import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; 
import { useNavigate } from 'react-router-dom';
import { User, ArrowLeft, CheckCircle2, Edit2, X, MapPin, Camera, AlertTriangle } from 'lucide-react'; 
import { AvatarPicker, avatars } from '../components/ui/avatar-picker'; 
import BackupRestore from '../components/BackupRestore'; 

// 🌟 FULL OFFLINE ARCHITECTURE: Import dynamic storage functions
import { saveToCache, getFromCache } from '../utils/offlineStorage';

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  const [isEditingName, setIsEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");

  const [isEditingZip, setIsEditingZip] = useState(false);
  const [editZipValue, setEditZipValue] = useState("");

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  // 🌟 NEW: Network Status Monitor
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        // 🌟 FULL OFFLINE ARCHITECTURE: The Local Hard Drive Interceptor
        if (!isOnline) {
          const cachedUser = await getFromCache('userData');
          if (cachedUser && cachedUser.length > 0) {
            setUserData(cachedUser[0]);
          } else {
            // Fallback if they somehow never cached their user data yet
            setUserData({ name: 'Offline User', zipCode: '', avatarId: 1 });
          }
          setLoading(false);
          return; // Stop here, do not attempt to contact Firebase
        }

        // 🌟 ONLINE ENGINE: Fetch from Firebase & silently backup to IndexedDB
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          // Backup User Data instantly
          saveToCache('userData', [{ id: auth.currentUser.uid, ...data }]);
        } else {
          setUserData({ name: '', zipCode: '', avatarId: 1 });
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [isOnline]); // Re-run if network status changes

  const handleSaveAvatar = async (avatarId) => {
    setProfileError(''); setProfileSuccess('');
    setAvatarLoading(true);
    try {
      await updateDoc(doc(db, "users", auth.currentUser.uid), { avatarId });
      const newData = { ...userData, avatarId };
      setUserData(newData);
      saveToCache('userData', [{ id: auth.currentUser.uid, ...newData }]); // Update cache
      setProfileSuccess("Avatar updated successfully!");
    } catch (err) {
      setProfileError("Failed to update avatar.");
    } finally {
      setAvatarLoading(false);
      setShowAvatarModal(false);
    }
  };

  const handleSaveName = async () => {
    if (!editNameValue.trim()) return;
    setProfileError(''); setProfileSuccess('');
    try {
      const newName = editNameValue.trim();
      await updateDoc(doc(db, "users", auth.currentUser.uid), { name: newName });
      const newData = { ...userData, name: newName };
      setUserData(newData);
      saveToCache('userData', [{ id: auth.currentUser.uid, ...newData }]); // Update cache
      setIsEditingName(false);
      setProfileSuccess("Name updated successfully!");
    } catch (err) {
      setProfileError("Failed to update name.");
    }
  };

  const handleSaveZipCode = async () => {
    if (!editZipValue.trim()) return;
    setProfileError(''); setProfileSuccess('');
    try {
      const formattedZip = editZipValue.replace(/\s+/g, '').toUpperCase();
      await updateDoc(doc(db, "users", auth.currentUser.uid), { zipCode: formattedZip });
      const newData = { ...userData, zipCode: formattedZip };
      setUserData(newData);
      saveToCache('userData', [{ id: auth.currentUser.uid, ...newData }]); // Update cache
      setIsEditingZip(false);
      setProfileSuccess("Zip Code updated successfully! You will now receive local KinAlerts.");
    } catch (err) {
      setProfileError("Failed to update Zip Code.");
    }
  };

  if (loading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-bold text-zinc-500">Loading Profile...</div>;

  const currentAvatar = avatars.find(a => a.id === userData?.avatarId) || null;

  return (
    <div className="min-h-[100dvh] bg-[#fafafa] p-4 md:p-8 relative pb-24 selection:bg-brandGold selection:text-white">
      
      {/* 🌟 OFFLINE DANGER BANNER */}
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[200] bg-amber-500 text-amber-950 py-3 px-4 font-bold text-sm shadow-md flex items-center justify-center gap-2 animate-in slide-in-from-top-4">
          <AlertTriangle size={18} />
          You are offline. Editing is disabled.
        </div>
      )}

      {/* Premium Background Elements */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-b from-brandGold/10 via-emerald-400/5 to-transparent rounded-full blur-[100px] pointer-events-none z-0"></div>

      <div className={`max-w-2xl mx-auto relative z-10 pt-4 ${!isOnline ? 'mt-8' : ''}`}>

        {/* ── SECTION 1: Back Button ── delay-0 */}
        <div className="mb-8 animate-initial:opacity-0 animate-initial:y-10 animate-enter:opacity-100 animate-enter:y-0 animate-spring animate-stiffness-220 animate-damping-7 animate-delay-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="group flex items-center space-x-2 bg-white/60 backdrop-blur-md border border-zinc-200 text-zinc-600 px-5 py-2.5 rounded-full font-bold shadow-sm hover:shadow-md hover:bg-white transition-all animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7"
          >
            <ArrowLeft size={18} className="transform group-hover:-translate-x-1 transition-transform" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* ── SECTION 2: Main Profile Card ── delay-100 */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-zinc-200/80 p-8 md:p-10 mb-8 text-center relative overflow-hidden group animate-initial:opacity-0 animate-initial:y-16 animate-enter:opacity-100 animate-enter:y-0 animate-spring animate-stiffness-220 animate-damping-7 animate-delay-100">
          
          {/* Avatar */}
          <div 
            onClick={() => {
              if (isOnline) setShowAvatarModal(true);
              else setProfileError("Cannot change avatar while offline.");
            }}
            className={`w-28 h-28 bg-white border-[4px] border-white shadow-xl text-zinc-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 relative mt-8 md:mt-0 transition-all duration-500 ${isOnline ? 'cursor-pointer group-hover:scale-105 overflow-hidden group/avatar animate-hover:scale-110 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7' : 'opacity-80'}`}
          >
            {currentAvatar ? (
              <div className="w-full h-full bg-zinc-50 p-2">
                {currentAvatar.svg}
              </div>
            ) : (
              <div className="w-full h-full bg-zinc-50 flex items-center justify-center">
                <User size={48} />
              </div>
            )}
            
            {isOnline && (
              <div className="absolute inset-0 bg-brandDark/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity backdrop-blur-[2px]">
                <Camera size={28} className="text-white" />
              </div>
            )}

            {!userData?.zipCode && isOnline && <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 border-[3px] border-white rounded-full animate-pulse z-10" title="Missing Zip Code"></span>}
          </div>

          {/* Name */}
          <div className="flex flex-col items-center justify-center mb-6">
            <div className="flex items-center justify-center gap-3 mb-2">
              {isEditingName ? (
                <div className="flex items-center gap-2 bg-zinc-50 p-1.5 rounded-full border border-zinc-200 shadow-sm">
                  <input type="text" defaultValue={userData?.name || ''} onChange={(e) => setEditNameValue(e.target.value)} className="w-40 px-4 py-2 bg-transparent outline-none font-bold text-center text-brandDark" autoFocus/>
                  <button onClick={handleSaveName} className="bg-brandDark text-white px-4 py-2 rounded-full font-bold text-sm hover:bg-brandAccent transition-all shadow-sm animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7">Save</button>
                  <button onClick={() => setIsEditingName(false)} className="text-zinc-400 hover:text-zinc-600 bg-white p-2 rounded-full border border-zinc-200 transition-all shadow-sm animate-hover:scale-110 animate-tap:scale-90 animate-spring animate-stiffness-220 animate-damping-7"><X size={16}/></button>
                </div>
              ) : (
                <>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-brandDark tracking-tight">{userData?.name || 'Guardian'}</h1>
                  <button 
                    onClick={() => {
                      if (isOnline) {
                        setEditNameValue(userData?.name || ''); 
                        setIsEditingName(true);
                      } else {
                        setProfileError("Cannot edit name while offline.");
                      }
                    }} 
                    className={`transition-colors bg-zinc-50 p-2 rounded-full border border-zinc-200 shadow-sm ${isOnline ? 'text-zinc-400 hover:text-brandGold animate-hover:scale-110 animate-tap:scale-90 animate-spring animate-stiffness-220 animate-damping-7' : 'text-zinc-300 cursor-not-allowed opacity-50'}`} 
                    title="Edit Name"
                  >
                    <Edit2 size={16} />
                  </button>
                </>
              )}
            </div>
            <p className="text-zinc-500 font-medium bg-zinc-50 px-4 py-1.5 rounded-full border border-zinc-200 shadow-sm">{auth.currentUser?.email}</p>
          </div>

          {/* Zip Code */}
          <div className="max-w-sm mx-auto bg-zinc-50 p-5 rounded-[2rem] border border-zinc-200 relative mt-8 shadow-inner">
            <div className="flex items-center justify-center gap-2 mb-2 text-brandDark font-bold">
              <MapPin size={18} className="text-brandGold" />
              <span>Broadcast Zip Code</span>
            </div>
            <p className="text-sm text-zinc-500 mb-4 px-2 font-medium">Set your local Zip Code to receive community KinAlerts in your area.</p>
            
            {isEditingZip ? (
              <div className="flex items-center gap-2 bg-white p-1.5 rounded-full border border-zinc-200 shadow-sm">
                <input type="text" placeholder="Enter Zip" defaultValue={userData?.zipCode || ''} onChange={(e) => setEditZipValue(e.target.value)} className="w-full px-4 py-2 bg-transparent outline-none font-bold text-center" autoFocus/>
                <button onClick={handleSaveZipCode} className="bg-brandDark text-white px-5 py-2 rounded-full font-bold text-sm hover:bg-brandAccent transition-all shadow-sm animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7">Save</button>
                <button onClick={() => setIsEditingZip(false)} className="text-zinc-400 hover:text-zinc-600 bg-zinc-50 p-2 rounded-full border border-zinc-200 transition-all shadow-sm animate-hover:scale-110 animate-tap:scale-90 animate-spring animate-stiffness-220 animate-damping-7"><X size={16}/></button>
              </div>
            ) : (
              <div className="flex justify-center">
                <button
                  onClick={() => {
                    if (isOnline) {
                      setEditZipValue(userData?.zipCode || ''); 
                      setIsEditingZip(true);
                    } else {
                      setProfileError("Cannot edit Zip Code while offline.");
                    }
                  }}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all shadow-sm relative ${
                    !isOnline ? 'bg-zinc-100 border border-zinc-200 text-zinc-400 cursor-not-allowed opacity-70' :
                    userData?.zipCode ? 'bg-white border border-zinc-200 text-brandDark hover:-translate-y-0.5 hover:shadow-md animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7' : 
                    'bg-red-50 border border-red-200 text-red-600 hover:-translate-y-0.5 hover:shadow-md animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-220 animate-damping-7'
                  }`}
                >
                  {userData?.zipCode ? <span className="text-lg">{userData.zipCode}</span> : <span>Setup Zip Code Now</span>}
                  <Edit2 size={16} />
                  {!userData?.zipCode && isOnline && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>}
                </button>
              </div>
            )}
          </div>

          {profileError && <div className="mt-6 mx-auto max-w-sm p-4 bg-red-50 text-red-600 text-sm font-bold rounded-2xl border border-red-100">{profileError}</div>}
          {profileSuccess && <div className="mt-6 mx-auto max-w-sm p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-2xl border border-emerald-100 flex items-center justify-center gap-2"><CheckCircle2 size={18} /> {profileSuccess}</div>}
        </div>

        {/* ── SECTION 3: Backup & Restore ── delay-200 */}
        <div className={`animate-initial:opacity-0 animate-initial:y-16 animate-enter:opacity-100 animate-enter:y-0 animate-spring animate-stiffness-220 animate-damping-7 animate-delay-200 ${!isOnline ? 'opacity-50 pointer-events-none' : ''}`}>
           <BackupRestore />
        </div>

        {/* AVATAR PICKER MODAL */}
        {showAvatarModal && isOnline && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-950/40 backdrop-blur-md overflow-y-auto">
            <div className="animate-initial:opacity-0 animate-initial:scale-90 animate-enter:opacity-100 animate-enter:scale-100 animate-spring animate-stiffness-220 animate-damping-7">
              <AvatarPicker 
                currentAvatarId={userData?.avatarId} 
                onSave={handleSaveAvatar} 
                onCancel={() => setShowAvatarModal(false)}
                isSaving={avatarLoading}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
