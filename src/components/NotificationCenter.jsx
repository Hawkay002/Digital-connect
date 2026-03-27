import { useState, useEffect } from 'react';
import { db, messaging } from '../firebase';
import { doc, setDoc, deleteDoc, addDoc, collection, getDoc, updateDoc } from 'firebase/firestore';
import { getToken } from 'firebase/messaging';
import {
  Bell, BellRing, X, Trash2, Users, MapPin, Info,
  Eye, CheckCircle2, Siren, AlertOctagon, Loader2, List, Map as MapIcon
} from 'lucide-react';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// 🌟 FIXED: Bulletproof CSS for the map pin image
const createProfileMarker = (imageUrl, name) => {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  const hasImage = imageUrl && !imageUrl.includes('placehold.co');
  
  const innerContent = hasImage
    ? `<img src="${imageUrl}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover; border: 3px solid #ef4444; background: white; display: block;" />`
    : `<div style="width: 100%; height: 100%; border-radius: 50%; border: 3px solid #ef4444; background: white; display: flex; align-items: center; justify-content: center; color: #ef4444; font-weight: 800; font-size: 18px; font-family: sans-serif;">${initial}</div>`;

  return new L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="position: relative; width: 48px; height: 48px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: transform 0.2s; cursor: pointer;">
             ${innerContent}
             <div style="position: absolute; bottom: -7px; left: 50%; transform: translateX(-50%); width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #ef4444;"></div>
           </div>`,
    iconSize: [48, 56],
    iconAnchor: [24, 56],
    popupAnchor: [0, -56]
  });
};

// ─── Helpers ────────────────────────────────────────────────────────────────
const getTime = (ts) => ts?.toDate ? ts.toDate().getTime() : new Date(ts || 0).getTime();
const getISO  = (ts) => ts?.toDate ? ts.toDate().toISOString() : new Date(ts || 0).toISOString();

const renderFormattedTextDark = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const isBullet = line.trim().startsWith('-');
    let content = isBullet ? line.substring(line.indexOf('-') + 1).trim() : line;
    let html = content
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-white">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-white/90">$1</em>');
    if (isBullet) return <li key={i} className="ml-5 list-disc marker:text-brandGold pl-1 mb-1" dangerouslySetInnerHTML={{ __html: html }} />;
    return <p key={i} className="mb-2 last:mb-0 min-h-[1rem]" dangerouslySetInnerHTML={{ __html: html }} />;
  });
};

const extractCoords = (scan) => {
  if (scan.lat && scan.lng) return { lat: scan.lat, lng: scan.lng };
  if (scan.googleMapsLink) {
    const match = scan.googleMapsLink.match(/q=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
  }
  return null;
};

// ─── Reusable animation class strings ───────────────────────────────────────
const SPRING     = 'transition-colors animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7';
const SPRING_SM  = 'transition-colors animate-hover:scale-110 animate-tap:scale-90 animate-spring animate-stiffness-220 animate-damping-7';
const MODAL_CARD = 'animate-initial:opacity-0 animate-initial:scale-90 animate-enter:opacity-100 animate-enter:scale-100 animate-spring animate-stiffness-220 animate-damping-7';

// ─── Component ───────────────────────────────────────────────────────────────
export default function NotificationCenter({ scans, systemMessages, pendingInvite, currentUser, showMessage, profiles = [] }) {

  const [showNotifCenter, setShowNotifCenter]   = useState(false);
  const [notifTab,        setNotifTab]          = useState('personal');
  const [viewMode,        setViewMode]          = useState('list'); 

  const [isEnablingPush,    setIsEnablingPush]   = useState(false);
  const [showSoftAskModal,  setShowSoftAskModal] = useState(false);

  const [lastViewedPersonal, setLastViewedPersonal] = useState(null);
  const [lastViewedSystem,   setLastViewedSystem]   = useState(null);

  const [selectedScans,       setSelectedScans]       = useState([]);
  const [scanToDelete,        setScanToDelete]         = useState(null);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);

  useEffect(() => {
    if (window.location.hash.includes('view=notifications')) {
      setShowNotifCenter(true);
      window.history.replaceState(null, '', '/#/dashboard');
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    (async () => {
      try {
        const snap = await getDoc(doc(db, 'users', currentUser.uid));
        if (snap.exists()) {
          const d = snap.data();
          if (d.lastViewedPersonal) setLastViewedPersonal(d.lastViewedPersonal);
          if (d.lastViewedSystem)   setLastViewedSystem(d.lastViewedSystem);
        }
      } catch (_) {}
    })();
  }, [currentUser]);

  useEffect(() => {
    setSelectedScans(prev => prev.filter(id => scans.some(s => s.id === id)));
  }, [scans]);

  useEffect(() => {
    const markAsRead = async () => {
      if (!currentUser || !showNotifCenter) return;
      if (notifTab === 'personal' && scans.length > 0) {
        const latest = getISO(scans[0].timestamp);
        if (lastViewedPersonal !== latest) {
          setLastViewedPersonal(latest);
          await setDoc(doc(db, 'users', currentUser.uid), { lastViewedPersonal: latest }, { merge: true });
        }
      }
      if (notifTab === 'system' && systemMessages.length > 0) {
        const latest = getISO(systemMessages[0].timestamp);
        if (lastViewedSystem !== latest) {
          setLastViewedSystem(latest);
          await setDoc(doc(db, 'users', currentUser.uid), { lastViewedSystem: latest }, { merge: true });
        }
      }
    };
    markAsRead();
  }, [showNotifCenter, notifTab, scans, systemMessages, currentUser, lastViewedPersonal, lastViewedSystem]);

  const unreadPersonalCount = lastViewedPersonal
    ? scans.filter(s => getTime(s.timestamp) > new Date(lastViewedPersonal).getTime()).length
    : scans.length;
  const unreadSystemCount = lastViewedSystem
    ? systemMessages.filter(m => getTime(m.timestamp) > new Date(lastViewedSystem).getTime()).length
    : systemMessages.length;
  const hasAnyUnread = unreadPersonalCount > 0 || unreadSystemCount > 0 || pendingInvite;

  const geoScans = scans.map(scan => ({ ...scan, coords: extractCoords(scan) })).filter(scan => scan.coords !== null);
  const mapCenter = geoScans.length > 0 ? [geoScans[0].coords.lat, geoScans[0].coords.lng] : [39.8283, -98.5795]; 

  const groupedScans = [];
  scans.forEach(scan => {
    const dateObj   = new Date(getTime(scan.timestamp));
    const today     = new Date();
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    let dateStr = dateObj.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    if (dateObj.toDateString() === today.toDateString())     dateStr = 'Today';
    else if (dateObj.toDateString() === yesterday.toDateString()) dateStr = 'Yesterday';
    let group = groupedScans.find(g => g.date === dateStr);
    if (!group) { group = { date: dateStr, items: [] }; groupedScans.push(group); }
    group.items.push(scan);
  });

  const handleEnableAlertsClick = () => {
    if (!('Notification' in window)) {
      showMessage('Not Supported', 'Your browser does not support notifications.', 'error');
      return;
    }
    if (Notification.permission === 'granted')  { processNotificationPermission(); }
    else if (Notification.permission === 'denied') {
      showMessage('Permission Blocked', "You previously blocked notifications. Tap the lock 🔒 next to the URL, go to Site Settings, allow notifications and reload.", 'warning');
    } else { setShowSoftAskModal(true); }
  };

  const processNotificationPermission = async () => {
    setShowSoftAskModal(false);
    setIsEnablingPush(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
        let swReg = null;
        if ('serviceWorker' in navigator) swReg = await navigator.serviceWorker.ready;
        const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: swReg });
        if (token) {
          await setDoc(doc(db, 'users', currentUser.uid), { fcmToken: token, email: currentUser.email, lastUpdated: new Date().toISOString() }, { merge: true });
          showMessage('Connected!', 'Your device is now securely connected to Emergency Alerts.', 'success');
        }
      } else { showMessage('Permission Denied', "You won't receive emergency popups.", 'warning'); }
    } catch (err) { showMessage('Connection Error', err.message, 'error'); }
    finally { setIsEnablingPush(false); }
  };

  const handleAcceptInvite = async () => {
    if (!pendingInvite) return;
    try {
      await updateDoc(doc(db, 'users', currentUser.uid), { familyId: pendingInvite.familyId });
      await deleteDoc(doc(db, 'invites', currentUser.email.toLowerCase()));
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      const name = snap.exists() && snap.data().name ? snap.data().name : currentUser.email;
      await addDoc(collection(db, 'scans'), { familyId: pendingInvite.familyId, type: 'invite_response', profileName: 'Family Update', message: `${name} accepted your co-guardian request and can now manage your profiles.`, timestamp: new Date().toISOString() });
      await fetch('/api/notify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ownerId: pendingInvite.inviterUid, title: '🤝 Guardian Joined!', body: `${name} accepted your invite.`, link: 'https://kintag.vercel.app/#/dashboard?view=notifications' }) }).catch(() => {});
      window.location.reload();
    } catch (e) { console.error(e); }
  };

  const handleDeclineInvite = async () => {
    if (!pendingInvite) return;
    try {
      await deleteDoc(doc(db, 'invites', currentUser.email.toLowerCase()));
      const snap = await getDoc(doc(db, 'users', currentUser.uid));
      const name = snap.exists() && snap.data().name ? snap.data().name : currentUser.email;
      await addDoc(collection(db, 'scans'), { familyId: pendingInvite.familyId, type: 'invite_response', profileName: 'Family Update', message: `${name} declined your co-guardian request.`, timestamp: new Date().toISOString() });
    } catch (e) { console.error(e); }
  };

  const toggleScanSelection = (id) =>
    setSelectedScans(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSelectAll = () =>
    setSelectedScans(selectedScans.length === scans.length ? [] : scans.map(s => s.id));

  const confirmDeleteScan = async () => {
    if (!scanToDelete) return;
    try   { await deleteDoc(doc(db, 'scans', scanToDelete)); }
    catch  { showMessage('Error', 'Failed to delete notification.', 'error'); }
    finally { setScanToDelete(null); }
  };

  const confirmBulkDelete = async () => {
    try {
      await Promise.all(selectedScans.map(id => deleteDoc(doc(db, 'scans', id))));
      setSelectedScans([]);
      setShowBulkDeleteModal(false);
      showMessage('Success', 'Selected notifications have been deleted.', 'success');
    } catch { showMessage('Error', 'Failed to delete selected notifications.', 'error'); }
  };

  return (
    <>
      <button
        onClick={handleEnableAlertsClick}
        disabled={isEnablingPush}
        className={`flex-1 flex items-center justify-center space-x-2 bg-brandGold text-white p-4 md:py-5 rounded-[2rem] font-bold shadow-lg disabled:opacity-50 ${SPRING}`}
      >
        {isEnablingPush ? <Loader2 size={20} className="animate-spin" /> : <BellRing size={20} />}
        <span>Enable Alerts</span>
      </button>

      <button
        onClick={() => setShowNotifCenter(true)}
        className={`flex-1 flex items-center justify-center space-x-2 bg-white/80 backdrop-blur-md text-brandDark border border-zinc-200/80 p-4 md:py-5 rounded-[2rem] font-bold shadow-sm relative ${SPRING}`}
      >
        <Bell size={20} />
        <span>Notifications</span>
        {hasAnyUnread && (
          <span className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full shadow-sm animate-pulse border-2 border-white" />
        )}
      </button>

      {showNotifCenter && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-zinc-950/40 backdrop-blur-sm overflow-hidden">
          <div className="bg-white w-full max-w-md h-full shadow-[auto_0_40px_rgba(0,0,0,0.2)] flex flex-col animate-in slide-in-from-right duration-300 relative border-l border-zinc-200/50">

            <div className="p-6 md:p-8 pb-4 border-b border-zinc-100 flex justify-between items-center bg-white shrink-0">
              <h2 className="text-3xl font-extrabold text-brandDark tracking-tight">Updates</h2>
              <button
                onClick={() => setShowNotifCenter(false)}
                className={`p-2.5 bg-zinc-50 rounded-full text-zinc-500 hover:text-brandDark hover:bg-zinc-100 border border-zinc-200 shadow-sm ${SPRING_SM}`}
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex border-b border-zinc-200 shrink-0 px-4 pt-2 bg-white">
              <button
                onClick={() => setNotifTab('personal')}
                className={`flex-1 py-4 font-bold text-sm border-b-2 flex items-center justify-center gap-2 ${SPRING} ${notifTab === 'personal' ? 'border-brandDark text-brandDark' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
              >
                Personal
                {unreadPersonalCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{unreadPersonalCount}</span>
                )}
              </button>
              <button
                onClick={() => setNotifTab('system')}
                className={`flex-1 py-4 font-bold text-sm border-b-2 flex items-center justify-center gap-2 ${SPRING} ${notifTab === 'system' ? 'border-brandDark text-brandDark' : 'border-transparent text-zinc-400 hover:text-zinc-600'}`}
              >
                System
                {unreadSystemCount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full shadow-sm">{unreadSystemCount}</span>
                )}
              </button>
            </div>

            {notifTab === 'personal' && scans.length > 0 && (
              <div className="bg-white px-6 py-4 border-b border-zinc-100 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-3 cursor-pointer text-sm font-bold text-brandDark select-none">
                    <input
                      type="checkbox"
                      checked={selectedScans.length === scans.length && scans.length > 0}
                      onChange={handleSelectAll}
                      disabled={viewMode === 'map'}
                      className="w-5 h-5 rounded border-zinc-300 text-brandDark focus:ring-brandDark cursor-pointer disabled:opacity-50"
                    />
                    Select All
                  </label>
                  {selectedScans.length > 0 && viewMode === 'list' && (
                    <button onClick={() => setShowBulkDeleteModal(true)} className={`bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm flex items-center gap-2 ${SPRING}`}>
                      <Trash2 size={14} /> ({selectedScans.length})
                    </button>
                  )}
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                   <button 
                     onClick={() => setViewMode('list')} 
                     className={`flex items-center justify-center p-1.5 px-3 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brandDark' : 'text-zinc-400 hover:text-zinc-600'}`}
                   >
                     <List size={14} className="mr-1.5" /> List
                   </button>
                   <button 
                     onClick={() => setViewMode('map')} 
                     className={`flex items-center justify-center p-1.5 px-3 rounded-lg text-xs font-bold transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-brandDark' : 'text-zinc-400 hover:text-zinc-600'}`}
                   >
                     <MapIcon size={14} className="mr-1.5" /> Map
                   </button>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-zinc-50 flex flex-col">

              {pendingInvite && (
                <div className="bg-brandGold/5 p-6 rounded-[2rem] border border-brandGold/20 mb-6 shadow-sm relative overflow-hidden group shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brandGold/10 rounded-full blur-2xl pointer-events-none group-hover:bg-brandGold/20 transition-colors" />
                  <h3 className="font-extrabold text-brandDark flex items-center gap-2 mb-3 text-lg">
                    <Users size={20} className="text-brandGold" /> Co-Guardian Invite
                  </h3>
                  <p className="text-sm text-zinc-600 font-medium mb-6 leading-relaxed relative z-10">
                    <strong className="text-brandDark">{pendingInvite.invitedBy}</strong> invited you to become their kid/pet's co-guardian.
                  </p>
                  <div className="flex gap-3 relative z-10">
                    <button onClick={handleAcceptInvite}  className={`bg-brandDark text-white py-3.5 rounded-full font-bold flex-1 shadow-md ${SPRING}`}>Accept</button>
                    <button onClick={handleDeclineInvite} className={`bg-white border border-red-200 text-red-600 py-3.5 rounded-full font-bold flex-1 shadow-sm ${SPRING}`}>Decline</button>
                  </div>
                </div>
              )}

              {notifTab === 'personal' && viewMode === 'map' && (
                 <div className="flex-1 w-full rounded-[2rem] overflow-hidden border border-zinc-200 shadow-inner relative z-0 min-h-[400px] animate-in fade-in zoom-in-95 duration-500">
                    {geoScans.length === 0 ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100 text-center p-6 z-10">
                        <MapPin size={32} className="text-zinc-300 mb-4" />
                        <h3 className="font-extrabold text-brandDark mb-2">No GPS Data</h3>
                        <p className="text-xs text-zinc-500 font-medium max-w-[250px]">None of your recent scans included active GPS location sharing.</p>
                      </div>
                    ) : (
                      <>
                        <MapContainer center={mapCenter} zoom={13} style={{ height: '100%', width: '100%' }} className="z-0">
                          {/* 🌟 FIXED: Ultra-detailed Google Maps engine for street-level landmarks */}
                          <TileLayer
                            url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                            attribution="&copy; Google Maps"
                            maxZoom={20}
                          />
                          {geoScans.map(scan => {
                            // 🌟 FIXED: Ultra-aggressive profile matching
                            const matchedProfile = profiles?.find(p => 
                              (scan.profileId && p.id === scan.profileId) || 
                              (scan.profileName && p.name === scan.profileName) ||
                              (scan.profileName && scan.profileName.includes(p.name))
                            );
                            
                            const imageUrl = scan.imageUrl || matchedProfile?.imageUrl;

                            return (
                              <Marker 
                                key={scan.id} 
                                position={[scan.coords.lat, scan.coords.lng]} 
                                icon={createProfileMarker(imageUrl, scan.profileName || '?')}
                              >
                                <Popup className="font-sans">
                                   <div className="font-bold text-brandDark text-sm">{scan.profileName}</div>
                                   <div className="text-xs text-zinc-500">{new Date(getTime(scan.timestamp)).toLocaleString()}</div>
                                   {scan.googleMapsLink && (
                                     <a href={scan.googleMapsLink} target="_blank" rel="noreferrer" className="block mt-2 text-[10px] text-blue-500 font-bold hover:underline">
                                       Open in Maps
                                     </a>
                                   )}
                                </Popup>
                              </Marker>
                            );
                          })}
                        </MapContainer>
                        
                        {/* 🌟 FIXED: Floating Badge for Passive Scans */}
                        {scans.length - geoScans.length > 0 && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 backdrop-blur-md border border-zinc-200 shadow-lg px-5 py-2.5 rounded-full flex items-center gap-2 animate-in slide-in-from-bottom-4">
                             <Info size={16} className="text-brandGold" />
                             <span className="text-xs font-bold text-zinc-600 whitespace-nowrap">
                               <strong className="text-brandDark">{scans.length - geoScans.length}</strong> updates without exact GPS hidden
                             </span>
                          </div>
                        )}
                      </>
                    )}
                 </div>
              )}

              {notifTab === 'personal' && viewMode === 'list' && (
                groupedScans.length === 0 ? (
                  <div className="text-center mt-20">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><Bell size={24} /></div>
                    <p className="text-zinc-500 font-medium text-lg tracking-tight">No scans recorded yet.</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {groupedScans.map(group => (
                      <div key={group.date} className="mb-8 last:mb-2">
                        <div className="flex items-center mb-5">
                          <div className="h-px bg-zinc-200 flex-1" />
                          <span className="px-3 text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest bg-zinc-50">{group.date}</span>
                          <div className="h-px bg-zinc-200 flex-1" />
                        </div>
                        <div className="space-y-4">
                          {group.items.map(scan => {
                            if (scan.type === 'kinAlert') return (
                              <div key={scan.id} className="bg-red-50 p-4 sm:p-5 rounded-[2rem] border border-red-200 shadow-sm relative overflow-hidden flex items-start gap-3">
                                <input type="checkbox" checked={selectedScans.includes(scan.id)} onChange={() => toggleScanSelection(scan.id)} className="w-5 h-5 mt-1 rounded border-zinc-300 text-brandDark focus:ring-brandDark cursor-pointer shrink-0 z-20" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl pointer-events-none z-0" />
                                <button onClick={() => setScanToDelete(scan.id)} className={`absolute top-4 right-4 p-2 text-red-300 hover:text-red-600 hover:bg-red-100 rounded-full z-10 ${SPRING_SM}`}><Trash2 size={16} /></button>
                                <div className="flex-1 min-w-0 relative z-10">
                                  <div className="flex items-center justify-between mb-3 pr-10">
                                    <span className="font-extrabold text-red-800 text-lg flex items-center gap-2"><Siren size={18} /> KinAlert</span>
                                    <span className="text-[10px] text-red-400 font-bold uppercase shrink-0 bg-red-100 px-2 py-1 rounded-md">{new Date(getTime(scan.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-sm text-red-900 font-bold mb-4 leading-relaxed">{scan.message}</p>
                                  {scan.publicLink && (
                                    <a href={scan.publicLink} target="_blank" rel="noopener noreferrer" className={`bg-red-600 text-white py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 w-full shadow-md ${SPRING}`}>
                                      <Eye size={18} /> View Profile
                                    </a>
                                  )}
                                </div>
                              </div>
                            );

                            if (scan.type === 'kinAlert_found') return (
                              <div key={scan.id} className="bg-emerald-50 p-4 sm:p-5 rounded-[2rem] border border-emerald-200 shadow-sm relative overflow-hidden flex items-start gap-3">
                                <input type="checkbox" checked={selectedScans.includes(scan.id)} onChange={() => toggleScanSelection(scan.id)} className="w-5 h-5 mt-1 rounded border-zinc-300 text-brandDark focus:ring-brandDark cursor-pointer shrink-0 z-20" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none z-0" />
                                <button onClick={() => setScanToDelete(scan.id)} className={`absolute top-4 right-4 p-2 text-emerald-300 hover:text-emerald-600 hover:bg-emerald-100 rounded-full z-10 ${SPRING_SM}`}><Trash2 size={16} /></button>
                                <div className="flex-1 min-w-0 relative z-10">
                                  <div className="flex items-center justify-between mb-3 pr-10">
                                    <span className="font-extrabold text-emerald-800 text-lg flex items-center gap-2"><CheckCircle2 size={18} /> Found Alert</span>
                                    <span className="text-[10px] text-emerald-400 font-bold uppercase shrink-0 bg-emerald-100 px-2 py-1 rounded-md">{new Date(getTime(scan.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-sm text-emerald-900 font-bold leading-relaxed">{scan.message}</p>
                                </div>
                              </div>
                            );

                            return (
                              <div key={scan.id} className="bg-white p-4 sm:p-5 rounded-[2rem] shadow-sm border border-zinc-200 relative group transition-shadow hover:shadow-md flex items-start gap-3">
                                <input type="checkbox" checked={selectedScans.includes(scan.id)} onChange={() => toggleScanSelection(scan.id)} className="w-5 h-5 mt-1 rounded border-zinc-300 text-brandDark focus:ring-brandDark cursor-pointer shrink-0 z-20" />
                                <button onClick={() => setScanToDelete(scan.id)} className={`absolute top-4 right-4 p-2 text-zinc-300 hover:text-red-500 hover:bg-red-50 rounded-full z-10 ${SPRING_SM}`}><Trash2 size={16} /></button>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center justify-between mb-3 pr-8">
                                    <span className="font-extrabold text-brandDark text-lg tracking-tight truncate">
                                      {scan.profileName} {scan.type === 'invite_response' ? 'Update' : 'Scanned'}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-bold uppercase shrink-0 bg-zinc-50 border border-zinc-100 px-2 py-1 rounded-md">
                                      {new Date(getTime(scan.timestamp)).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  {scan.type === 'active' ? (
                                    <div className="bg-red-50/50 p-4 rounded-2xl border border-red-100 mt-2">
                                      <p className="text-xs text-red-800 font-bold mb-4 flex items-center gap-2"><MapPin size={16} className="text-red-500 shrink-0" /> A Good Samaritan pinpointed their exact location!</p>
                                      <a href={scan.googleMapsLink} target="_blank" rel="noopener noreferrer" className={`bg-red-600 text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 w-full shadow-md ${SPRING}`}>Open in Google Maps</a>
                                    </div>
                                  ) : scan.type === 'invite_response' ? (
                                    <p className="text-sm text-emerald-700 font-bold flex items-start gap-2 mt-2 bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 leading-relaxed">
                                      <Users size={16} className="shrink-0 mt-0.5 text-emerald-500" /> {scan.message}
                                    </p>
                                  ) : (
                                    <p className="text-sm text-zinc-500 font-medium flex items-center gap-2 mt-2 bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                                      <Info size={16} className="shrink-0 text-brandGold" /> Passive scan near <strong className="text-brandDark font-bold">{scan.city}, {scan.region}</strong>
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* System messages */}
              {notifTab === 'system' && (
                systemMessages.length === 0 ? (
                  <div className="text-center mt-20">
                    <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-400"><BellRing size={24} /></div>
                    <p className="text-zinc-500 font-medium text-lg tracking-tight">No system updates yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {systemMessages.map(msg => (
                      <div key={msg.id} className="bg-brandDark text-white p-6 rounded-[2rem] shadow-xl border border-zinc-800 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-brandGold/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-brandGold/20 transition-colors" />
                        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-4 relative z-10">
                          <span className="font-extrabold flex items-center gap-2 text-lg tracking-tight"><BellRing size={20} className="text-brandGold" /> {msg.title}</span>
                          <span className="text-[10px] text-white/50 font-bold uppercase tracking-widest bg-white/5 px-2 py-1 rounded-md border border-white/5">{new Date(getTime(msg.timestamp)).toLocaleDateString()}</span>
                        </div>
                        <div className="text-sm text-white/80 font-medium leading-relaxed relative z-10">{renderFormattedTextDark(msg.body)}</div>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {showSoftAskModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
          <div className={`bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 max-w-sm w-full text-center shadow-2xl border border-white/20 ${MODAL_CARD}`}>
            <div className="w-20 h-20 bg-brandGold/10 text-brandGold rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-brandGold/20">
              <BellRing size={36} />
            </div>
            <h2 className="text-3xl font-extrabold text-brandDark mb-3 tracking-tight">Enable Alerts?</h2>
            <p className="text-zinc-500 mb-8 text-base font-medium leading-relaxed">KinTag needs permission to send you emergency push notifications when your tag is scanned.</p>
            <div className="flex flex-col gap-3">
              <button onClick={processNotificationPermission} className={`w-full bg-brandGold text-white py-4 rounded-full font-bold shadow-lg ${SPRING}`}>Proceed</button>
              <button onClick={() => setShowSoftAskModal(false)} className={`w-full bg-zinc-100 text-zinc-600 py-4 rounded-full font-bold ${SPRING}`}>Maybe Later</button>
            </div>
          </div>
        </div>
      )}

      {scanToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
          <div className={`bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 max-w-sm w-full text-center shadow-2xl border border-white/20 ${MODAL_CARD}`}>
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
              <Trash2 size={36} />
            </div>
            <h2 className="text-3xl font-extrabold text-brandDark mb-3 tracking-tight">Delete Record?</h2>
            <p className="text-zinc-500 mb-8 text-base font-medium leading-relaxed">This action cannot be undone. This scan record will be permanently removed from your history.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmDeleteScan}          className={`w-full bg-red-600 text-white py-4 rounded-full font-bold shadow-lg ${SPRING}`}>Yes, Delete</button>
              <button onClick={() => setScanToDelete(null)} className={`w-full bg-zinc-100 text-zinc-600 py-4 rounded-full font-bold ${SPRING}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md">
          <div className={`bg-white/95 backdrop-blur-2xl rounded-[3rem] p-8 md:p-10 max-w-sm w-full text-center shadow-2xl border border-white/20 ${MODAL_CARD}`}>
            <div className="w-20 h-20 bg-red-50 text-red-600 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner border border-red-100">
              <Trash2 size={36} />
            </div>
            <h2 className="text-3xl font-extrabold text-brandDark mb-3 tracking-tight">Delete {selectedScans.length} Records?</h2>
            <p className="text-zinc-500 mb-8 text-base font-medium leading-relaxed">This action cannot be undone. These scan records will be permanently removed from your history.</p>
            <div className="flex flex-col gap-3">
              <button onClick={confirmBulkDelete}                  className={`w-full bg-red-600 text-white py-4 rounded-full font-bold shadow-lg ${SPRING}`}>Yes, Delete All</button>
              <button onClick={() => setShowBulkDeleteModal(false)} className={`w-full bg-zinc-100 text-zinc-600 py-4 rounded-full font-bold ${SPRING}`}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
