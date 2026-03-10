import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

export default function UpdateToast() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r) {
      console.log('Service Worker Registered');
    },
    onRegisterError(error) {
      console.error('Service Worker Registration Failed', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] bg-brandDark text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-10 fade-in duration-500 w-[90%] max-w-sm">
      <div className="flex flex-col flex-1">
        <span className="font-extrabold text-sm tracking-tight">Update Available!</span>
        <span className="text-xs text-white/70 font-medium">A new version of KinTag is ready.</span>
      </div>
      <button 
        onClick={() => updateServiceWorker(true)}
        className="bg-brandGold text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-amber-500 transition-colors flex items-center gap-2 shadow-md shrink-0"
      >
        <RefreshCw size={14} /> Update
      </button>
      <button onClick={() => setNeedRefresh(false)} className="text-white/50 hover:text-white p-1 transition-colors shrink-0">
        <X size={18} />
      </button>
    </div>
  );
}
