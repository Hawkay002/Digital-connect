import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShieldAlert, AlertOctagon, HeartHandshake, Eye, Siren, X, Phone, User, PawPrint, Timer, Activity, Heart, Cake, Droplet, MapPin, FileText } from 'lucide-react';

const getComputedAge = (profile) => {
  if (profile.dob) {
    const dob = new Date(profile.dob);
    const today = new Date();
    let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) months--;
    if (months < 0) months = 0;
    
    if (months < 12) {
      return { value: months === 0 ? 1 : months, label: 'Mos' };
    } else {
      return { value: Math.floor(months / 12), label: 'Yrs' };
    }
  }
  return { 
    value: profile.age || 'Unknown', 
    label: profile.ageUnit === 'Months' ? 'Mos' : 'Yrs' 
  };
};

export default function CareView() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [viewProfile, setViewProfile] = useState(null);
  const [viewingDocument, setViewingDocument] = useState(null);

  // Live Timer State
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0 });

  useEffect(() => {
    const fetchCareData = async () => {
      try {
        const sessionRef = doc(db, 'care_sessions', sessionId);
        const sessionSnap = await getDoc(sessionRef);
        
        if (!sessionSnap.exists()) {
          return setError("Invalid access link. This bundle does not exist.");
        }
        
        const data = sessionSnap.data();
        if (data.status !== 'active' || new Date(data.expiresAt).getTime() < Date.now()) {
          return setError("This access link has expired.");
        }
        
        setSession(data);
        
        const pIds = data.selectedProfiles || [];
        if (pIds.length > 0) {
           const chunks = [];
           for(let i=0; i<pIds.length; i+=10) chunks.push(pIds.slice(i, i+10));
           let fetched = [];
           for(const chunk of chunks) {
              const qP = query(collection(db, "profiles"), where("__name__", "in", chunk));
              const pSnap = await getDocs(qP);
              pSnap.forEach(d => fetched.push({ id: d.id, ...d.data() }));
           }
           setProfiles(fetched);
        }
      } catch(e) {
        setError("Failed to load care session data.");
      } finally {
        setLoading(false);
      }
    };
    fetchCareData();
  }, [sessionId]);

  // Live Timer Countdown Logic
  useEffect(() => {
    if (!session) return;

    const updateTimer = () => {
      const diff = new Date(session.expiresAt).getTime() - Date.now();
      
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0 });
        window.location.reload(); // Auto-locks the page when time runs out
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const mins = Math.floor((diff / 1000 / 60) % 60);
      
      setTimeLeft({ days, hours, mins });
    };
    
    updateTimer(); // Initial call
    const interval = setInterval(updateTimer, 30000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [session]);

  if (loading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-bold text-zinc-500"><Loader2 className="animate-spin w-8 h-8 mr-3" /> Verifying Access...</div>;

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4 selection:bg-brandGold selection:text-white">
      <div className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] text-center max-w-sm w-full shadow-2xl">
         <div className="w-20 h-20 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6"><AlertOctagon size={36} /></div>
         <h2 className="text-2xl font-extrabold text-white mb-2">Access Denied</h2>
         <p className="text-zinc-400 font-medium mb-8">{error}</p>
         <p className="text-xs text-zinc-500 uppercase tracking-widest font-bold">Powered by KinTag</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fafafa] p-4 md:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none"></div>
      <div className="max-w-2xl mx-auto relative z-10 pt-4 animate-in fade-in duration-700">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-zinc-200/80 p-8 text-center mb-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-[40px] pointer-events-none group-hover:bg-indigo-500/10 transition-colors"></div>
           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm relative z-10"><HeartHandshake size={32}/></div>
           <h1 className="text-3xl font-extrabold text-brandDark tracking-tight mb-2 relative z-10">Caretaker Dashboard</h1>
           <p className="text-zinc-500 font-medium relative z-10">Hello <strong className="text-brandDark">{session.name}</strong>, you have been granted temporary access to these profiles.</p>
           
           {/* LIVE COUNTDOWN TIMER */}
           <div className="inline-flex items-center gap-2 mt-6 bg-indigo-50 pl-2 pr-5 py-2 rounded-full border border-indigo-100 shadow-inner relative z-10">
              <div className="bg-indigo-500 text-white p-1.5 rounded-full shadow-sm"><Timer size={14}/></div>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">
                Expires in: {timeLeft.days}d {timeLeft.hours}h {timeLeft.mins}m
              </span>
           </div>
        </div>

        {/* Profiles List */}
        <div className="space-y-6">
          {profiles.map(profile => {
            const ageInfo = getComputedAge(profile);
            return (
              <div key={profile.id} className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 flex flex-col sm:flex-row items-center gap-6 transition-all hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)] hover:-translate-y-1">
                <img src={profile.imageUrl} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover bg-zinc-100 shadow-sm shrink-0" />
                <div className="flex-1 text-center sm:text-left w-full">
                  <h3 className="text-2xl font-extrabold text-brandDark tracking-tight mb-1">{profile.name}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center justify-center sm:justify-start gap-1.5">
                    {profile.type === 'kid' ? <User size={14}/> : <PawPrint size={14}/>} {profile.typeSpecific} • {ageInfo.value} {ageInfo.label}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setViewProfile(profile)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-indigo-100 active:scale-95 shadow-sm">
                      <Eye size={16}/> View Info
                    </button>
                    <Link to={`/id/${profile.id}`} target="_blank" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-red-100 active:scale-95 shadow-sm">
                      <Siren size={16}/> Emergency
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* 🌟 FULL PARITY READ-ONLY INFO MODAL */}
      {viewProfile && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-md overflow-y-auto flex p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full m-auto rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300 border border-white/20">
            <button onClick={() => setViewProfile(null)} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2.5 rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
            
            {/* Header Image */}
            <div className="h-64 relative bg-zinc-100">
              <img src={viewProfile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brandDark/90 via-brandDark/20 to-transparent pointer-events-none"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-extrabold tracking-tight mb-1 drop-shadow-sm">{viewProfile.name}</h2>
                <p className="text-xs text-white/80 font-bold uppercase tracking-widest flex items-center gap-1.5 drop-shadow-sm">
                  {viewProfile.typeSpecific} • {getComputedAge(viewProfile).value} {getComputedAge(viewProfile).label} {viewProfile.type === 'kid' && viewProfile.nationality ? `• ${viewProfile.nationality}` : ''}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto bg-white pb-10">
              
              {/* Medical & Pet Specifics */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-[2rem] overflow-hidden shadow-sm divide-y divide-zinc-200">
                {viewProfile.allergies && viewProfile.allergies?.toLowerCase() !== 'none' && viewProfile.allergies?.toLowerCase() !== 'none known' && (
                  <div className="p-4 flex items-center gap-4 bg-amber-50/50">
                    <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0 border border-amber-200"><Activity size={20} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-amber-800 uppercase tracking-widest mb-0.5">Allergies / Meds</p>
                      <p className="text-sm font-bold text-amber-950 leading-tight">{viewProfile.allergies}</p>
                    </div>
                  </div>
                )}
                
                {viewProfile.type === 'kid' && viewProfile.specialNeeds && (
                  <div className="p-4 flex items-center gap-4 bg-violet-50/50">
                    <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-xl flex items-center justify-center shrink-0 border border-violet-200"><Heart size={20} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-violet-800 uppercase tracking-widest mb-0.5">Special Needs</p>
                      <p className="text-sm font-bold text-violet-950 leading-tight">{viewProfile.specialNeeds}</p>
                    </div>
                  </div>
                )}

                {viewProfile.dob && (
                  <div className="p-4 flex items-center gap-4 bg-sky-50/50">
                    <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center shrink-0 border border-sky-200"><Cake size={20} /></div>
                    <div>
                      <p className="text-[10px] font-extrabold text-sky-800 uppercase tracking-widest mb-0.5">Date of Birth</p>
                      <p className="text-sm font-bold text-sky-950 leading-tight">{new Date(viewProfile.dob).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                    </div>
                  </div>
                )}
                
                {viewProfile.type === 'pet' && viewProfile.vaccinationStatus && (
                  <div className="p-4 flex flex-col gap-1 bg-emerald-50/50">
                    <p className="text-[10px] font-extrabold text-emerald-800 uppercase tracking-widest">Vaccination Status</p>
                    <p className="text-sm font-bold text-emerald-950 leading-tight">{viewProfile.vaccinationStatus}</p>
                  </div>
                )}
                {viewProfile.type === 'pet' && viewProfile.microchip && (
                  <div className="p-4 flex flex-col gap-1 bg-zinc-50/50">
                    <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Microchip ID</p>
                    <p className="text-sm font-extrabold text-brandDark font-mono leading-tight">{viewProfile.microchip}</p>
                  </div>
                )}
                {viewProfile.type === 'pet' && viewProfile.temperament && (
                  <div className="p-4 flex flex-col gap-1 bg-zinc-50/50">
                    <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Temperament</p>
                    <p className={`text-sm font-bold leading-tight ${viewProfile.temperament !== 'Friendly' ? 'text-red-600' : 'text-brandDark'}`}>{viewProfile.temperament}</p>
                  </div>
                )}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col items-center text-center border border-zinc-200 shadow-sm">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest mb-1">Gender</span>
                  <span className="font-extrabold text-brandDark text-sm">{viewProfile.gender || 'N/A'}</span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col items-center text-center border border-zinc-200 shadow-sm">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest mb-1">Height</span>
                  <span className="font-extrabold text-brandDark text-sm">
                    {viewProfile.heightUnit === 'ft' 
                      ? `${viewProfile.heightMain || 0}'${viewProfile.heightSub || 0}"` 
                      : (viewProfile.heightMain ? `${viewProfile.heightMain} cm` : viewProfile.height || 'N/A')}
                  </span>
                </div>
                <div className="bg-zinc-50 p-4 rounded-2xl flex flex-col items-center text-center border border-zinc-200 shadow-sm">
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest mb-1">Weight</span>
                  <span className="font-extrabold text-brandDark text-sm">
                    {viewProfile.weightMain ? `${viewProfile.weightMain} ${viewProfile.weightUnit}` : viewProfile.weight || 'N/A'}
                  </span>
                </div>
              </div>
              
              {viewProfile.type === 'kid' && viewProfile.bloodGroup && (
                 <div className="bg-red-50 p-4 rounded-2xl flex justify-between items-center border border-red-100 shadow-sm">
                    <span className="text-xs text-red-600 font-extrabold uppercase tracking-widest flex items-center gap-2"><Droplet size={16}/> Blood Group</span>
                    <span className="font-extrabold text-red-700 text-lg">{viewProfile.bloodGroup}</span>
                 </div>
              )}

              {/* Emergency Contacts */}
              <div>
                 <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3 ml-2">Emergency Contacts</h4>
                 <div className="bg-zinc-50 border border-zinc-200 rounded-[2rem] p-2 space-y-2">
                   {viewProfile.contacts?.length > 0 ? viewProfile.contacts.map((c, i) => (
                     <div key={i} className="flex justify-between items-center bg-white p-3 rounded-3xl shadow-sm border border-zinc-100">
                        <div className="pl-2">
                          <div className="flex items-center space-x-2 mb-0.5">
                            <p className="font-bold text-brandDark tracking-tight">{c.name}</p>
                            <span className="px-2 py-0.5 bg-brandGold/10 border border-brandGold/20 text-brandGold text-[9px] font-extrabold uppercase tracking-widest rounded-md">
                              {c.tag === 'Other' ? c.customTag : c.tag}
                            </span>
                          </div>
                          <p className="text-zinc-500 text-xs font-bold tracking-wider">{c.phone || 'No phone set'}</p>
                        </div>
                        <a href={`tel:${c.countryCode}${c.phone}`} className="bg-brandDark text-white p-3 rounded-2xl hover:bg-brandAccent transition-colors shadow-sm active:scale-95 shrink-0"><Phone size={18}/></a>
                     </div>
                   )) : (
                     <div className="flex justify-between items-center bg-white p-3 rounded-3xl shadow-sm border border-zinc-100">
                        <div className="pl-2">
                          <p className="font-bold text-brandDark tracking-tight">{viewProfile.parent1Name || 'Guardian'}</p>
                          <p className="text-zinc-500 text-xs font-bold tracking-wider">{viewProfile.parent1Phone || 'No phone set'}</p>
                        </div>
                        <a href={`tel:${viewProfile.parent1Phone}`} className="bg-brandDark text-white p-3 rounded-2xl hover:bg-brandAccent transition-colors shadow-sm active:scale-95 shrink-0"><Phone size={18}/></a>
                     </div>
                   )}
                 </div>
              </div>

              {/* Documents & Location (Vault unlocked for Babysitters) */}
              <div>
                 <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3 ml-2">Documents & Location</h4>
                 <div className="bg-zinc-50 border border-zinc-200 rounded-[2rem] overflow-hidden divide-y divide-zinc-200 shadow-sm">
                    {(viewProfile.policeStation || viewProfile.pincode) && (
                      <div className="p-4 grid grid-cols-2 gap-4 bg-white">
                        <div>
                          <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Police Station</span>
                          <span className="text-sm font-extrabold text-brandDark truncate block">{viewProfile.policeStation || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] font-extrabold text-zinc-400 uppercase tracking-widest mb-1">Pincode</span>
                          <span className="text-sm font-extrabold text-brandDark font-mono">{viewProfile.pincode || 'N/A'}</span>
                        </div>
                      </div>
                    )}
                    
                    {viewProfile.documents && viewProfile.documents.length > 0 && (
                      <div className="p-4 bg-white space-y-2">
                         {viewProfile.documents.map((doc, idx) => (
                           <button 
                             key={idx} 
                             onClick={() => setViewingDocument(doc)} 
                             className="w-full flex items-center justify-between bg-zinc-50 p-3 rounded-2xl shadow-sm border border-zinc-200 hover:border-brandDark/30 transition-all active:scale-[0.98]"
                           >
                             <span className="font-extrabold text-brandDark text-sm tracking-tight truncate pl-2">{doc.name}</span>
                             <div className="bg-white border border-zinc-200 p-2 rounded-xl shrink-0 shadow-sm"><FileText size={16} className="text-brandDark"/></div>
                           </button>
                         ))}
                      </div>
                    )}
                 </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Document Viewer Modal (Nested inside) */}
      {viewingDocument && (
        <div className="fixed inset-0 z-[200] bg-zinc-950/90 flex flex-col items-center justify-center p-4 backdrop-blur-xl animate-in fade-in duration-200">
          <div className="absolute top-4 w-full max-w-md mx-auto px-6 flex justify-between items-center z-[210]">
             <div className="flex items-center gap-3 bg-black/50 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full shadow-lg">
               <FileText size={16} className="text-brandGold" />
               <h3 className="text-white font-extrabold tracking-tight truncate max-w-[200px] text-sm">{viewingDocument.name}</h3>
             </div>
             <button onClick={() => setViewingDocument(null)} className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition shrink-0 border border-white/10 shadow-lg">
               <X size={20} />
             </button>
          </div>
          <div className="w-full max-w-md mx-auto h-full flex items-center justify-center pt-20 pb-6">
            {viewingDocument.url?.toLowerCase().includes('.doc') ? (
              <div className="w-full h-full max-h-[80vh] rounded-[2rem] shadow-2xl relative z-[205] bg-white overflow-hidden border border-white/10">
                <iframe 
                  src={`https://docs.google.com/gview?url=${encodeURIComponent(viewingDocument.url)}&embedded=true`} 
                  className="w-full h-full border-0" 
                />
              </div>
            ) : (
              <img 
                src={viewingDocument.url?.toLowerCase().includes('.pdf') ? viewingDocument.url.replace(/\.pdf/i, '.jpg') : viewingDocument.url} 
                alt={viewingDocument.name} 
                onContextMenu={(e) => e.preventDefault()} 
                draggable="false" 
                className="max-w-full max-h-[80vh] object-contain rounded-[2rem] shadow-2xl relative z-[205] border border-white/10" 
              />
            )}
          </div>
        </div>
      )}

    </div>
  );
}
