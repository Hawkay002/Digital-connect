import { useState, useEffect } from 'react';
import { Shield, Fingerprint, Lock, Unlock } from 'lucide-react';

export default function AppLock({ children }) {
  const [isLocked, setIsLocked] = useState(true);
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState('');

  // Check if the device supports Biometrics/WebAuthn
  useEffect(() => {
    if (window.PublicKeyCredential) {
      PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
        .then((available) => {
          setIsSupported(available);
          // If the user hasn't opted into the lock yet, skip it
          if (localStorage.getItem('kintag_app_lock_enabled') !== 'true') {
            setIsLocked(false);
          }
        });
    } else {
      setIsLocked(false);
    }
  }, []);

  const handleUnlock = async () => {
    setError('');
    try {
      // 1. Check if we already have a credential saved locally
      const credentialId = localStorage.getItem('kintag_credential_id');

      if (!credentialId) {
        // --- FIRST TIME SETUP (Registration) ---
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
            authenticatorAttachment: "platform", // Forces FaceID/TouchID/Device PIN
            userVerification: "required"
          },
          timeout: 60000
        };

        const credential = await navigator.credentials.create({
          publicKey: publicKeyCredentialCreationOptions
        });

        // Save the raw ID to request it next time
        const rawId = Array.from(new Uint8Array(credential.rawId))
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
        
        localStorage.setItem('kintag_credential_id', rawId);
        localStorage.setItem('kintag_app_lock_enabled', 'true');
        setIsLocked(false);

      } else {
        // --- SUBSEQUENT UNLOCKS (Authentication) ---
        // Convert hex string back to Uint8Array
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

        // If the promise resolves, the user successfully used FaceID/TouchID
        setIsLocked(false);
      }
    } catch (err) {
      console.error(err);
      setError("Authentication failed or was canceled. Please try again.");
    }
  };

  // If the app is unlocked, render the normal application (Dashboard/Settings)
  if (!isLocked) {
    return children;
  }

  // If locked, show the Lock Screen
  return (
    <div className="fixed inset-0 z-[999] bg-brandDark text-white flex flex-col items-center justify-center p-6 selection:bg-brandGold selection:text-white">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-brandGold/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-8 shadow-inner border border-white/10 relative z-10 animate-in zoom-in duration-500">
        <Shield size={48} className="text-brandGold" />
      </div>
      
      <h1 className="text-3xl font-extrabold mb-2 tracking-tight relative z-10 text-center">App Locked</h1>
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

      <button 
        onClick={handleUnlock}
        className="w-full max-w-xs bg-brandGold text-brandDark py-4 rounded-full font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center gap-3 active:scale-95 relative z-10"
      >
        <Fingerprint size={24} />
        {localStorage.getItem('kintag_app_lock_enabled') === 'true' ? "Unlock App" : "Enable App Lock"}
      </button>

      {localStorage.getItem('kintag_app_lock_enabled') === 'true' && (
        <button 
          onClick={() => {
            // Failsafe to reset lock if they get completely stuck
            if(window.confirm("Disable App Lock? You will need to re-verify your email on next login.")) {
              localStorage.removeItem('kintag_app_lock_enabled');
              localStorage.removeItem('kintag_credential_id');
              window.location.reload();
            }
          }}
          className="mt-8 text-white/40 hover:text-white/80 text-xs font-bold transition-colors relative z-10 underline underline-offset-4"
        >
          Reset Lock Settings
        </button>
      )}
    </div>
  );
}
