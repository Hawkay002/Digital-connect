import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ArrowLeft, Users, Mail, Link as LinkIcon, CheckCircle2, Loader2, Copy } from 'lucide-react';

export default function Profile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [familyMembers, setFamilyMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [copiedLink, setCopiedLink] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      try {
        const userDoc = await getDoc(doc(db, "users", auth.currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);
          
          // Fetch all users sharing this familyId
          const familyQuery = query(collection(db, "users"), where("familyId", "==", data.familyId));
          const familySnaps = await getDocs(familyQuery);
          setFamilyMembers(familySnaps.docs.map(d => ({ id: d.id, ...d.data() })));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setCopiedLink('');
    
    if (familyMembers.length >= 6) {
      return setError("You have reached the maximum of 6 co-guardians.");
    }
    if (!inviteEmail || !userData?.familyId) return;

    setInviteLoading(true);
    try {
      // Save invite to database
      await setDoc(doc(db, "invites", inviteEmail.toLowerCase()), {
        familyId: userData.familyId,
        invitedBy: userData.name || auth.currentUser.email,
        invitedAt: new Date().toISOString()
      });

      const link = `${window.location.origin}/#/signup?email=${encodeURIComponent(inviteEmail.toLowerCase())}`;
      setCopiedLink(link);
      setSuccess(`Invite sent! Send them this link to join your family dashboard.`);
      setInviteEmail('');
    } catch (err) {
      setError("Failed to send invite. Please try again.");
    } finally {
      setInviteLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(copiedLink);
    setSuccess("Link copied to clipboard!");
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center font-bold text-zinc-500">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 relative">
      <div className="max-w-2xl mx-auto">
        
        <button onClick={() => navigate('/')} className="mb-6 flex items-center space-x-2 text-zinc-500 hover:text-brandDark font-bold transition-colors">
          <ArrowLeft size={20} />
          <span>Back to Dashboard</span>
        </button>

        <div className="bg-white rounded-3xl shadow-premium border border-zinc-100 p-8 mb-8 text-center">
          <div className="w-24 h-24 bg-brandMuted text-brandDark rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={40} />
          </div>
          <h1 className="text-3xl font-extrabold text-brandDark tracking-tight mb-1">{userData?.name || 'Guardian'}</h1>
          <p className="text-zinc-500 font-medium mb-8">{auth.currentUser?.email}</p>
          
          <button onClick={handleLogout} className="inline-flex items-center justify-center space-x-2 bg-red-50 text-red-600 hover:bg-red-100 px-6 py-3 rounded-xl font-bold transition-colors">
            <LogOut size={18} />
            <span>Log Out Securely</span>
          </button>
        </div>

        <div className="bg-white rounded-3xl shadow-premium border border-zinc-100 p-8">
          <div className="flex items-center gap-3 mb-2">
            <Users size={24} className="text-brandGold" />
            <h2 className="text-2xl font-extrabold text-brandDark tracking-tight">Family Co-Guardians</h2>
          </div>
          <p className="text-zinc-500 font-medium mb-6 leading-relaxed">
            Invite up to 5 family members to manage profiles and receive emergency scan notifications on their own phones.
          </p>

          {error && <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100">{error}</div>}
          {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-600 text-sm font-bold rounded-xl border border-emerald-100 flex justify-between items-center">
            <span>{success}</span>
            {copiedLink && (
              <button onClick={copyToClipboard} className="bg-emerald-600 text-white p-2 rounded-lg hover:bg-emerald-700 transition"><Copy size={16}/></button>
            )}
          </div>}

          {familyMembers.length < 6 && (
            <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 mb-8">
              <input 
                type="email" 
                placeholder="Enter guardian's email..." 
                value={inviteEmail} 
                onChange={(e) => setInviteEmail(e.target.value)} 
                required 
                className="flex-1 p-3.5 bg-brandMuted border-transparent rounded-xl focus:bg-white focus:border-brandDark focus:ring-2 focus:ring-brandDark/20 outline-none transition-all font-medium" 
              />
              <button type="submit" disabled={inviteLoading} className="bg-brandDark text-white px-6 py-3.5 rounded-xl font-bold hover:bg-brandAccent transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2">
                {inviteLoading ? <Loader2 size={18} className="animate-spin"/> : <Mail size={18} />}
                <span>Send Invite</span>
              </button>
            </form>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold text-zinc-400 uppercase tracking-widest mb-3">Active Guardians ({familyMembers.length}/6)</h3>
            {familyMembers.map((member) => (
              <div key={member.id} className="flex items-center justify-between bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-zinc-200 text-zinc-500 shadow-sm">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="font-bold text-brandDark">{member.name || 'Guardian'}</p>
                    <p className="text-xs text-zinc-500 font-medium">{member.email}</p>
                  </div>
                </div>
                {member.id === userData?.familyId && (
                  <span className="text-[10px] font-extrabold bg-brandGold/20 text-brandGold px-2 py-1 rounded-md uppercase tracking-widest">Primary</span>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
