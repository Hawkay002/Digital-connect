import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { Loader2, ShieldAlert, AlertOctagon, HeartHandshake, Eye, Siren, X, Phone, User, PawPrint, Timer } from 'lucide-react';

const getComputedAge = (profile) => {
  if (profile.dob) {
    const dob = new Date(profile.dob);
    const today = new Date();
    let months = (today.getFullYear() - dob.getFullYear()) * 12 + (today.getMonth() - dob.getMonth());
    if (today.getDate() < dob.getDate()) months--;
    if (months < 0) months = 0;
    return { value: months < 12 ? (months === 0 ? 1 : months) : Math.floor(months / 12), label: months < 12 ? 'Mos' : 'Yrs' };
  }
  return { value: profile.age || 'Unknown', label: profile.ageUnit === 'Months' ? 'Mos' : 'Yrs' };
};

export default function CareView() {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewProfile, setViewProfile] = useState(null);

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

  if (loading) return <div className="min-h-screen bg-[#fafafa] flex items-center justify-center font-bold text-zinc-500"><Loader2 className="animate-spin w-8 h-8 mr-3" /> Verifying Access...</div>;

  if (error) return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
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
        <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_40px_rgb(0,0,0,0.06)] border border-zinc-200/80 p-8 text-center mb-8">
           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100 shadow-sm"><HeartHandshake size={32}/></div>
           <h1 className="text-3xl font-extrabold text-brandDark tracking-tight mb-2">Caretaker Dashboard</h1>
           <p className="text-zinc-500 font-medium">Hello <strong className="text-brandDark">{session.name}</strong>, you have been granted temporary access to these profiles.</p>
           
           <div className="inline-flex items-center gap-2 mt-6 bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100">
              <Timer size={16} className="text-indigo-500"/>
              <span className="text-xs font-bold text-indigo-700 uppercase tracking-widest">Valid until {new Date(session.expiresAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
           </div>
        </div>

        {/* Profiles */}
        <div className="space-y-6">
          {profiles.map(profile => {
            const ageInfo = getComputedAge(profile);
            return (
              <div key={profile.id} className="bg-white rounded-[2.5rem] p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-200 flex flex-col sm:flex-row items-center gap-6">
                <img src={profile.imageUrl} alt={profile.name} className="w-24 h-24 rounded-2xl object-cover bg-zinc-100 shadow-sm shrink-0" />
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl font-extrabold text-brandDark tracking-tight mb-1">{profile.name}</h3>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mb-4 flex items-center justify-center sm:justify-start gap-1.5">
                    {profile.type === 'kid' ? <User size={14}/> : <PawPrint size={14}/>} {profile.typeSpecific} • {ageInfo.value} {ageInfo.label}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <button onClick={() => setViewProfile(profile)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-indigo-100">
                      <Eye size={16}/> View Info
                    </button>
                    <Link to={`/id/${profile.id}`} target="_blank" className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-5 py-3 rounded-xl font-bold text-sm transition-colors border border-red-100">
                      <Siren size={16}/> Emergency
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Read-Only Information Modal */}
      {viewProfile && (
        <div className="fixed inset-0 z-[100] bg-zinc-950/60 backdrop-blur-md overflow-y-auto flex p-4 animate-in fade-in duration-200">
          <div className="bg-white max-w-md w-full m-auto rounded-[3rem] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button onClick={() => setViewProfile(null)} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 p-2.5 rounded-full transition-colors backdrop-blur-md"><X size={20} /></button>
            <div className="h-64 relative bg-zinc-100">
              <img src={viewProfile.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-brandDark/90 to-transparent"></div>
              <div className="absolute bottom-6 left-6 text-white">
                <h2 className="text-3xl font-extrabold tracking-tight mb-1">{viewProfile.name}</h2>
                <p className="text-sm text-white/80 font-bold uppercase tracking-widest">{viewProfile.typeSpecific} • {getComputedAge(viewProfile).value} {getComputedAge(viewProfile).label}</p>
              </div>
            </div>
            <div className="p-8 space-y-6">
              <div>
                 <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2"><AlertOctagon size={14}/> Allergies & Needs</h4>
                 <div className="bg-red-50 p-4 rounded-2xl border border-red-100 text-red-700 font-bold text-sm leading-relaxed">{viewProfile.allergies}</div>
                 {viewProfile.specialNeeds && <div className="mt-2 bg-amber-50 p-4 rounded-2xl border border-amber-100 text-amber-700 font-bold text-sm leading-relaxed">{viewProfile.specialNeeds}</div>}
              </div>
              <div>
                 <h4 className="text-xs font-extrabold text-zinc-400 uppercase tracking-widest mb-3 flex items-center gap-2"><Phone size={14}/> Emergency Contacts</h4>
                 <div className="space-y-3">
                   {viewProfile.contacts?.map((c, i) => (
                     <div key={i} className="flex justify-between items-center bg-zinc-50 p-4 rounded-2xl border border-zinc-200">
                        <div>
                          <p className="font-bold text-brandDark">{c.name}</p>
                          <p className="text-xs text-zinc-500 font-medium">{c.tag === 'Other' ? c.customTag : c.tag}</p>
                        </div>
                        <a href={`tel:${c.countryCode}${c.phone}`} className="bg-emerald-100 text-emerald-700 p-2.5 rounded-full hover:bg-emerald-200 transition-colors shadow-sm"><Phone size={16}/></a>
                     </div>
                   ))}
                 </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
