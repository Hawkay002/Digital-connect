import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp, updateDoc } from 'firebase/firestore';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Send, Trash2, ShieldAlert, Loader2, ChevronLeft, BellRing, CheckCircle2, AlertOctagon, AlertTriangle, Info, Edit2, X } from 'lucide-react'; // 🌟 Added Edit2 and X

// Lightweight Markdown Parser for Admin Preview
const renderFormattedText = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    const isBullet = line.trim().startsWith('-');
    let content = isBullet ? line.substring(line.indexOf('-') + 1).trim() : line;
    
    // Safely escapes HTML and replaces markdown tags
    let htmlContent = content
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-extrabold text-brandDark">$1</strong>')
      .replace(/\*(.*?)\*/g, '<em class="italic text-brandDark/80">$1</em>');
      
    if (isBullet) {
      return <li key={i} className="ml-5 list-disc marker:text-brandGold pl-1 mb-1" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
    }
    return <p key={i} className="mb-2 last:mb-0 min-h-[1rem]" dangerouslySetInnerHTML={{ __html: htmlContent }} />;
  });
};

export default function Admin() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  // 🌟 NEW: Editing State
  const [editingId, setEditingId] = useState(null);

  const [customAlert, setCustomAlert] = useState({ isOpen: false, title: '', message: '', type: 'info', onClose: null });
  const [messageToDelete, setMessageToDelete] = useState(null);
  
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  // SECURITY LOCK: Now securely using environment variables!
  const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL; 

  const showMessage = (alertTitle, alertMessage, type = 'info', onClose = null) => {
    setCustomAlert({ isOpen: true, title: alertTitle, message: alertMessage, type, onClose });
  };

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    if (currentUser.email !== ADMIN_EMAIL) {
      showMessage("Access Denied", "You are not authorized to view the admin control center.", "error", () => navigate('/'));
      return;
    }

    fetchMessages();
  }, [currentUser, navigate, ADMIN_EMAIL]);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, "systemMessages"), orderBy("timestamp", "desc"));
      const snap = await getDocs(q);
      const fetched = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setMessages(fetched);
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 NEW: Handle the click of the Edit button
  const handleEditClick = (msg) => {
    setTitle(msg.title);
    setBody(msg.body);
    setEditingId(msg.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll back to form
  };

  const cancelEdit = () => {
    setTitle('');
    setBody('');
    setEditingId(null);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    
    if (!title || !body) {
      return showMessage("Missing Fields", "Please fill out both the Notification Title and Message Body fields.", "warning");
    }
    
    setSending(true);

    try {
      if (editingId) {
        // 🌟 UPDATED: Update existing document
        await updateDoc(doc(db, "systemMessages", editingId), {
          title,
          body,
          // We intentionally don't update timestamp so it stays in its original chronological order
        });
        
        showMessage("Update Saved! ✏️", "The campaign has been updated in the inbox (Note: This does not resend push notifications to devices).", "success");
        setEditingId(null);
      } else {
        // Create new document & Broadcast
        await addDoc(collection(db, "systemMessages"), {
          title,
          body,
          timestamp: serverTimestamp() 
        });

        await fetch('/api/broadcast', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, body })
        });

        showMessage("Broadcast Sent! 🚀", "Your campaign was successfully saved and broadcasted to all users.", "success");
      }
      
      setTitle('');
      setBody('');
      fetchMessages(); 
    } catch (error) {
      showMessage("Error", "Failed to process the request. Please check your connection and try again.", "error");
    } finally {
      setSending(false);
    }
  };

  const confirmDeleteMessage = async () => {
    if (!messageToDelete) return;
    try {
      await deleteDoc(doc(db, "systemMessages", messageToDelete));
      setMessages(messages.filter(m => m.id !== messageToDelete));
      // If we delete the message we are currently editing, clear the form
      if (editingId === messageToDelete) {
        cancelEdit();
      }
    } catch (error) {
      showMessage("Error", "Failed to delete the message.", "error");
    } finally {
      setMessageToDelete(null); 
    }
  };

  if (loading) return <div className="min-h-screen bg-zinc-50 flex items-center justify-center"><Loader2 className="animate-spin text-brandDark" size={40}/></div>;

  return (
    <div className="min-h-screen bg-zinc-50 p-4 md:p-8 relative">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center space-x-4 bg-brandDark text-white p-6 rounded-3xl shadow-lg">
          <Link to="/" className="bg-white/10 p-2 rounded-xl hover:bg-white/20 transition">
            <ChevronLeft size={24} />
          </Link>
          <div>
            <h1 className="text-2xl font-extrabold flex items-center gap-2">
              <ShieldAlert className="text-brandGold"/> Admin Control Center
            </h1>
            <p className="text-white/60 text-sm font-medium mt-1">Broadcast system updates to all KinTag users.</p>
          </div>
        </div>

        {/* Create / Edit Campaign Card */}
        <div className={`p-6 md:p-8 rounded-3xl shadow-sm border transition-colors ${editingId ? 'bg-brandGold/5 border-brandGold/30' : 'bg-white border-zinc-100'}`}>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-brandDark flex items-center gap-2">
              {editingId ? <Edit2 size={20} className="text-brandGold"/> : <BellRing size={20} className="text-brandGold"/>}
              {editingId ? 'Edit Existing Campaign' : 'Draft New Campaign'}
            </h2>
            {editingId && (
              <button onClick={cancelEdit} className="text-zinc-500 hover:text-brandDark bg-white px-3 py-1.5 rounded-lg border border-zinc-200 text-xs font-bold transition-all shadow-sm flex items-center gap-1.5">
                <X size={14} /> Cancel
              </button>
            )}
          </div>

          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Notification Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., 🚀 New Feature Available!"
                className="w-full p-4 bg-white border border-zinc-200 rounded-2xl focus:border-brandDark outline-none font-medium shadow-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Message Body</label>
              <textarea 
                value={body} 
                onChange={(e) => setBody(e.target.value)} 
                placeholder="What do you want to tell your users?"
                rows="4"
                className="w-full p-4 bg-white border border-zinc-200 rounded-2xl focus:border-brandDark outline-none font-medium resize-none shadow-sm"
              ></textarea>
              {/* Markdown Cheat Sheet */}
              <div className="flex flex-wrap gap-4 mt-2 px-1 text-[11px] text-zinc-400 font-semibold tracking-wide uppercase">
                 <span><b className="text-brandDark">**Bold**</b></span>
                 <span><i className="text-brandDark">*Italic*</i></span>
                 <span>- Bullet Point</span>
                 <span>(Enter) New Line</span>
              </div>
            </div>
            
            <button 
              type="submit" 
              disabled={sending}
              className={`w-full flex items-center justify-center space-x-2 text-white p-4 rounded-2xl font-bold transition-all shadow-md disabled:opacity-50 mt-2 ${editingId ? 'bg-brandDark hover:bg-brandAccent' : 'bg-brandGold hover:bg-amber-500'}`}
            >
              {sending ? <Loader2 size={20} className="animate-spin" /> : (editingId ? <CheckCircle2 size={20} /> : <Send size={20} />)}
              <span>{sending ? 'Processing...' : (editingId ? 'Save Changes' : 'Send Campaign Now')}</span>
            </button>
          </form>
        </div>

        {/* Existing Messages List */}
        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-zinc-100">
          <h2 className="text-xl font-bold text-brandDark mb-6">Campaign History</h2>
          
          {messages.length === 0 ? (
            <p className="text-zinc-500 font-medium text-center py-8">No system messages sent yet.</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start gap-4 transition-colors ${editingId === msg.id ? 'bg-brandGold/5 border-brandGold/30' : 'bg-zinc-50 border-zinc-200'}`}>
                  <div className="w-full overflow-hidden">
                    <h3 className="font-extrabold text-brandDark flex items-center gap-2 mb-2">{msg.title}</h3>
                    {/* Passes the message through the rendering engine for accurate preview */}
                    <div className="text-sm text-zinc-600 font-medium leading-relaxed mb-4">
                      {renderFormattedText(msg.body)}
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                      {msg.timestamp?.toDate ? msg.timestamp.toDate().toLocaleString() : new Date(msg.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  {/* 🌟 NEW: Action Buttons Container */}
                  <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                    <button 
                      onClick={() => handleEditClick(msg)} 
                      className="flex-1 sm:flex-none p-2 text-zinc-500 hover:text-brandDark bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-100 rounded-xl transition-all flex items-center justify-center"
                      title="Edit Message"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button 
                      onClick={() => setMessageToDelete(msg.id)} 
                      className="flex-1 sm:flex-none p-2 text-zinc-400 hover:text-red-500 bg-white border border-zinc-200 hover:border-red-200 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
                      title="Delete Message"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- MODALS --- */}
      
      {customAlert.isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-brandDark/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-in zoom-in-95 duration-200">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5 ${
              customAlert.type === 'success' ? 'bg-emerald-50 text-emerald-500' :
              customAlert.type === 'error' ? 'bg-red-50 text-red-600' :
              customAlert.type === 'warning' ? 'bg-amber-50 text-amber-500' :
              'bg-brandMuted text-brandDark'
            }`}>
              {customAlert.type === 'success' && <CheckCircle2 size={32} />}
              {customAlert.type === 'error' && <AlertOctagon size={32} />}
              {customAlert.type === 'warning' && <AlertTriangle size={32} />}
              {customAlert.type === 'info' && <Info size={32} />}
            </div>
            <h2 className="text-2xl font-extrabold text-brandDark mb-2 tracking-tight">{customAlert.title}</h2>
            <p className="text-zinc-500 mb-8 text-sm font-medium leading-relaxed">{customAlert.message}</p>
            <button 
              onClick={() => {
                if(customAlert.onClose) customAlert.onClose();
                setCustomAlert({ ...customAlert, isOpen: false });
              }} 
              className="w-full bg-brandDark text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-brandAccent transition-colors"
            >
              Okay
            </button>
          </div>
        </div>
      )}

      {messageToDelete && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-brandDark/80 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl border border-zinc-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertOctagon size={32} />
            </div>
            <h2 className="text-2xl font-extrabold text-brandDark mb-2 tracking-tight">Delete Message?</h2>
            <p className="text-zinc-500 mb-8 text-sm font-medium leading-relaxed">This action cannot be undone. This broadcast will be permanently removed from all users' inboxes.</p>
            
            <div className="flex gap-3">
              <button onClick={() => setMessageToDelete(null)} className="flex-1 bg-brandMuted text-brandDark py-3.5 rounded-xl font-bold hover:bg-zinc-200 transition-colors">
                Cancel
              </button>
              <button onClick={confirmDeleteMessage} className="flex-1 bg-red-600 text-white py-3.5 rounded-xl font-bold shadow-md hover:bg-red-700 transition-colors">
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
