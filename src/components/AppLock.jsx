import { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, Unlock } from 'lucide-react';

export default function AppLock({ children }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Check if the browser supports biometric authentication (requires HTTPS or localhost)
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsSupported(available);
          
          const isEnabled = localStorage.getItem('kintag_app_lock_enabled');
          const isDismissed = localStorage.getItem('kintag_app_lock_dismissed');

          // If they haven't enabled it AND they already dismissed the prompt, let them through
          if (isEnabled !== 'true' && isDismissed === 'true') {
            setIsLocked(false);
          }
          // If it is enabled, or if it's their FIRST time, it stays locked so the screen shows!
        });
    } else {
      // If biometrics aren't supported on this device/browser, just let them through
      setIsLocked(false);
    }
  }, []);

  const handleUnlock = async () => {
    setError('');
    try {
      const credentialId = localStorage.getItem('kintag_credential_id');

      if (!credentialId) {
        // --- FIRST TIME SETUP ---
        const publicKeyCredentialCreationOptions = {
          challenge: window.crypto.getRandomValues(new Uint8Array(32)),
          rp: { name: "KinTag", id: window.location.hostname },
          user: {
            id: window.crypto.getRandomValues(new Uint8Array(16)),
            name: "kintag_user",
            displayName: "KinTag User"
          },
          pubKeyCredParams: [{ alg: -7, type: "public-key" }],
          authenticatorSelection: {
            authenticatorAttachment: "platform", // Forces Device PIN/FaceID/Fingerprint
            userVerification: "required"
          },
          timeout: 60000
        };

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        const rawId = Array.from(new Uint8Array(credential.rawId))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        localStorage.setItem('kintag_credential_id', rawId);
        localStorage.setItem('kintag_app_lock_enabled', 'true');
        setIsLocked(false);

      } else {
        // --- SUBSEQUENT UNLOCKS ---
        const idBuffer = new Uint8Array(credentialId.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));

        const publicKeyCredentialRequestOptions = {
          challenge: window.crypto.getRandomValues(new Uint8Array(32)),
          allowCredentials: [{
            id: idBuffer,
            type: 'public-key',
            transports: ['internal']
          }],
          userVerification: 'required',
          timeout: 60000
        };

        await navigator.credentials.get({
          publicKey: publicKeyCredentialRequestOptions
        });

        setIsLocked(false);
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed or was canceled. Please try again.");
    }
  };

  const skipLock = () => {
    localStorage.setItem('kintag_app_lock_dismissed', 'true');
    setIsLocked(false);
  };

  if (!isLocked) {
    return children;
  }

  // If biometrics aren't available but we are still locked, show a fallback
  if (!isSupported) {
     return (
       <div className="min-h-screen flex items-center justify-center bg-[#fafafa]">
          <p className="text-zinc-500 font-bold">Checking device security...</p>
       </div>
     );
  }

  return (
    <div className="fixed inset-0 z-[999] bg-brandDark text-white flex flex-col items-center justify-center p-6 selection:bg-brandGold selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brandGold/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white/10 relative z-10 animate-in zoom-in duration-500">
        <Shield size={48} className="text-brandGold" />
      </div>
      
      <h1 className="text-3xl font-extrabold mb-2 tracking-tight relative z-10 text-center">App Privacy Lock</h1>
      <p className="text-white/60 font-medium mb-12 text-center max-w-xs relative z-10 leading-relaxed">
        {localStorage.getItem('kintag_app_lock_enabled') === 'true' 
          ? "Use your device's biometric security to unlock your dashboard."
          : "Secure your family's data by linking your device's Face ID, Touch ID, or Passcode."}
      </p>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-2xl mb-8 text-sm font-bold max-w-sm text-center animate-in fade-in relative z-10">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4 w-full max-w-xs relative z-10">
        <button 
          onClick={handleUnlock}
          className="w-full bg-brandGold text-brandDark py-4 rounded-full font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95"
        >
          <Fingerprint size={24} />
          {localStorage.getItem('kintag_app_lock_enabled') === 'true' ? "Unlock App" : "Enable App Lock"}
        </button>

        {/* The SKIP button for first-time users */}
        {localStorage.getItem('kintag_app_lock_enabled') !== 'true' && (
          <button 
            onClick={skipLock}
            className="w-full bg-white/10 text-white py-4 rounded-full font-bold hover:bg-white/20 transition-all active:scale-95"
          >
            Not Now
          </button>
        )}
      </div>

      {localStorage.getItem('kintag_app_lock_enabled') === 'true' && (
        <button 
          onClick={() => {
            if(window.confirm("Disable App Lock?")) {
              localStorage.removeItem('kintag_app_lock_enabled');
              localStorage.removeItem('kintag_credential_id');
              window.location.reload();
            }
          }}
          className="mt-10 text-white/40 hover:text-white/80 text-xs font-bold transition-colors relative z-10 underline underline-offset-4"
        >
          Disable Lock
        </button>
      )}
    </div>
  );
}
