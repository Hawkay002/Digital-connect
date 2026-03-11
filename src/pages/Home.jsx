import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import { Turnstile } from '@marsidev/react-turnstile';
import { CardStack } from '../components/ui/card-stack'; 
import { FAQMonochrome } from '../components/ui/faq-monochrome'; 
import { 
  Shield, MapPin, BellRing, Heart, Smartphone, Github, ArrowRight, 
  CheckCircle2, PawPrint, User, Activity, Info, RefreshCw, Battery, Cloud, 
  Lock, Infinity, Zap, Mail, MessageCircle, Send, 
  Users, Database, Phone, AlertTriangle, Trash2, Rocket, Siren, Megaphone, FileText, ShieldCheck, Download,
  ChevronRight, Terminal, HeartHandshake, ShieldPlus
} from 'lucide-react';

const stackFeatures = [
  { id: 1, title: "No App Required", description: "Anyone with a smartphone camera can scan the tag. There is absolutely nothing for the finder to download or install.", icon: <Smartphone size={40} className="text-blue-500" /> },
  { id: 2, title: "Instant Setup", description: "Skip the wait times of ordering custom engraved metals. Create an account and secure your child or pet in under 2 minutes.", icon: <Zap size={40} className="text-yellow-500" /> },
  { id: 3, title: "Unlimited Scans", description: "There is absolutely no cap on how many times your QR codes or NFC tags can be scanned.", icon: <Infinity size={40} className="text-rose-500" /> },
  { id: 4, title: "Precision GPS Pinpointing", description: "When scanned, the finder can securely send their exact coordinates directly to your phone with a single tap.", icon: <MapPin size={40} className="text-emerald-500" /> },
  { id: 5, title: "Passive Location Fallback", description: "Even if the finder denies GPS access, KinTag will passively log their general IP-based city and send an alert.", icon: <Activity size={40} className="text-rose-400" /> },
  { id: 6, title: "Instant Push Alerts", description: "The second a tag is scanned, you receive an emergency push notification alerting you that your loved one was found.", icon: <BellRing size={40} className="text-brandGold" /> },
  { id: 7, title: "One-Tap Emergency Dial", description: "A massive, clear button allows the finder to instantly dial your emergency contact number without copying it.", icon: <Phone size={40} className="text-emerald-600" /> },
  { id: 8, title: "Lost Mode (Panic Button)", description: "Instantly transform a lost tag into a high-alert distress signal with a flashing missing banner and pulsing emergency dialer.", icon: <Siren size={40} className="text-red-500" /> },
  { id: 9, title: "KinAlert Broadcasts", description: "Trigger an instant localized push notification to all other KinTag users in your zip code to help search for your missing loved one.", icon: <Megaphone size={40} className="text-amber-500" /> },
  { id: 10, title: "Secure Document Vault", description: "Upload sensitive medical records or IDs. They remain heavily locked and blurred until the finder explicitly shares their GPS location or calls you.", icon: <FileText size={40} className="text-indigo-500" /> },
  { id: 11, title: "Anti-Download Protection", description: "Strict UI protections prevent strangers from right-clicking, dragging, or long-pressing to save your photos and documents.", icon: <ShieldCheck size={40} className="text-emerald-600" /> },
  { id: 12, title: "Co-Guardian Family Sharing", description: "Invite up to 5 family members. When a tag is scanned, every co-guardian receives an instant push alert simultaneously.", icon: <Users size={40} className="text-indigo-500" /> },
  { id: 13, title: "Behavioral Alerts", description: "Highlight critical non-verbal behaviors, special needs, or fears so the finder knows exactly how to approach them.", icon: <AlertTriangle size={40} className="text-amber-500" /> },
  { id: 14, title: "Critical Medical Info", description: "Display crucial allergies, blood types, and daily medications instantly to whoever scans the tag.", icon: <Heart size={40} className="text-pink-500" /> },
  { id: 15, title: "Microchip Linking", description: "Store your pet's official microchip ID number visibly so veterinarians can cross-reference it instantly.", icon: <Database size={40} className="text-zinc-600" /> },
  { id: 16, title: "Vaccination Records", description: "Display rabies and core vaccination statuses to reassure finders that your pet is safe to handle.", icon: <ShieldPlus size={40} className="text-sky-500" /> },
  { id: 17, title: "Dynamic Updates", description: "Moved to a new house? Changed your phone number? Update your profile instantly without ever needing to print a new tag.", icon: <RefreshCw size={40} className="text-teal-500" /> },
  { id: 18, title: "Cloud Synced", description: "All your profiles are securely backed up to the cloud. Access and manage your dashboard from any device.", icon: <Cloud size={40} className="text-sky-400" /> },
  { id: 19, title: "Complete Data Control", description: "You own your data. Permanently wipe your account, profiles, and scan histories from our servers at any time.", icon: <Trash2 size={40} className="text-zinc-800" /> },
  { id: 20, title: "Zero Battery Required", description: "Unlike bulky GPS collars that constantly die and require charging, KinTag relies on the battery and cellular data of the Good Samaritan's smartphone. Your tag will never run out of power.", icon: <Battery size={40} className="text-orange-500" /> }
];

export default function Home() {
  const [isVerified, setIsVerified] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      window.pwaDeferredPrompt = e;
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    if (window.pwaDeferredPrompt) setDeferredPrompt(window.pwaDeferredPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallApp = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      window.pwaDeferredPrompt = null;
    }
  };

  const faqData = [
    { q: "Is there a monthly subscription fee?", a: "No! The core KinTag platform is entirely free to use. We don't believe in holding your family's safety hostage behind a monthly paywall. You only pay for your own blank NFC tags or printing if you choose to.", meta: "Pricing" },
    { q: "Does the finder need to download an app?", a: "No. That is the magic of KinTag. In a panic, you don't want a finder struggling to download an app. They simply point their standard phone camera at the QR code, and it opens a secure, native webpage instantly.", meta: "Access" },
    { q: "Can my spouse and I both receive alerts?", a: "Yes! With our Family Sharing feature, you can invite up to 5 co-guardians. If your child or pet's tag is scanned, every guardian receives an instant push notification on their own phone, and everyone can manage the profiles.", meta: "Family" },
    { q: "Can I upload medical records or government IDs?", a: "Yes. Our Secure Document Vault allows you to attach sensitive files like Rabies Certificates or Autism Medical IDs. To protect your privacy, these documents remain heavily blurred and locked until the finder physically taps 'Share Location' or calls your emergency contact.", meta: "Vault" },
    { q: "Can strangers download my child's photos or documents?", a: "No. We have implemented strict anti-download protections across all public profiles. Right-clicking, image dragging, and mobile long-press saving are completely disabled to protect your family's data.", meta: "Privacy" },
    { q: "What is 'Lost Mode' (The Panic Button)?", a: "If your loved one goes missing, you can activate 'Lost Mode' from your dashboard. It instantly transforms their digital ID into a high-alert distress signal with a flashing missing banner and pulsing emergency dialer to urge finders to call immediately.", meta: "Safety" },
    { q: "What is a KinAlert Community Broadcast?", a: "When you activate Lost Mode, you can optionally send a 'KinAlert'. This blasts an instant push notification to all other KinTag users in your Zip Code, turning your neighborhood into an active search party.", meta: "Community" },
    { q: "Why do I need to provide my Zip Code?", a: "Your Zip Code securely connects you to the KinAlert network. It ensures you only receive emergency push notifications for kids or pets that go missing in your immediate local area, and allows you to ask locals for help if yours goes missing.", meta: "Location" },
    { q: "How do I let the community know my pet/child was found?", a: "Simply toggle 'Lost Mode' off in your dashboard! This automatically restores their standard digital ID and sends a green 'Safe & Sound' notification to the local community to call off the search.", meta: "Community" },
    { q: "What happens if the finder denies GPS access?", a: "KinTag uses a dual-layer alert system. Even if the finder taps 'No' to sharing their exact GPS coordinates, our system performs a 'Passive Scan' which grabs their general IP-based city/region and sends you an instant push notification anyway.", meta: "Location" },
    { q: "What if a tag gets lost or stolen?", a: "We built an instant 'Kill Switch'. From your dashboard, you can click one button to disable any profile. If someone scans the lost tag, they will be blocked by a secure 'Profile Disabled' screen, protecting your data.", meta: "Security" },
    { q: "Do I have to buy special tags directly from you?", a: "Not at all. You can generate and download high-resolution QR codes directly from your dashboard to print on standard paper/stickers, or you can buy cheap, blank NFC tags from Amazon and program them yourself.", meta: "Hardware" },
    { q: "What is an NFC tag and how do I use it?", a: "NFC (Near Field Communication) is the same technology used for contactless payments. You can buy blank NFC stickers online and use free apps to program your unique KinTag URL onto them. Anyone who taps their phone to the sticker will instantly open your profile.", meta: "Hardware" },
    { q: "What if I move or change my phone number?", a: "Because KinTag is a cloud-based digital ID, any changes you make in your dashboard are instantly updated on the live tag. You never have to engrave, print, or buy a new physical tag just because you moved.", meta: "Account" },
    { q: "Does the tag have a battery I need to charge?", a: "No. Unlike bulky GPS collars that constantly die and require charging, KinTag relies on the battery and cellular data of the Good Samaritan's smartphone. Your tag will never run out of power.", meta: "Hardware" },
    { q: "Will the QR code fade or expire?", a: "The link embedded in the QR code will never expire as long as your account is active. If you print it on paper, we recommend placing clear tape over it to waterproof it and prevent smudging.", meta: "Hardware" },
    { q: "Can I print the tags myself?", a: "Absolutely. When you create a profile, you get a 'Download QR' button. You can print this at home, scale it down, and laminate it onto a backpack or dog collar.", meta: "Customization" },
    { q: "Can I create profiles for multiple pets or kids?", a: "Yes! Your single KinTag dashboard can hold multiple profiles. You can create unique cards and QR codes for every child, dog, or cat in your household.", meta: "Family" },
    { q: "How do I delete my data if I stop using KinTag?", a: "You have total ownership of your data. We built a 'Danger Zone' in your profile settings where you can permanently wipe your account, all created profiles, and all scan histories from our servers instantly.", meta: "Privacy" },
    { q: "Can I self-host this application?", a: "Yes. KinTag was built to be open and transparent. Developers can clone the repository and hook it up to their own private database for ultimate ownership.", meta: "Open Source" }
  ].map(item => ({ question: item.q, answer: item.a, meta: item.meta }));

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4 selection:bg-brandGold selection:text-white">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl shadow-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-800">
            <img src="/kintag-logo.png" alt="KinTag Logo" className="w-12 h-12 rounded-xl animate-pulse" />
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-2">Securing Connection...</h1>
          <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
            Please wait a moment while we verify your browser to protect our network.
          </p>
        </div>
        <div className="animate-in fade-in zoom-in-95 duration-500 delay-300 min-h-[65px] grayscale invert">
          <Turnstile siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={() => setIsVerified(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans selection:bg-brandGold selection:text-white animate-in fade-in duration-700 w-full bg-zinc-50">
      
      {/* DEEP DARK NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-950/80 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-br from-brandGold to-amber-600 p-0.5 rounded-lg shadow-[0_0_15px_rgba(251,191,36,0.3)]">
               <img src="/kintag-logo.png" alt="KinTag Logo" className="w-7 h-7 rounded-md" />
            </div>
            <span className="text-xl font-extrabold text-white tracking-tight">KinTag</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-zinc-400 hover:text-white transition-colors">Log In</Link>
            <Link to="/signup" className="bg-white text-black text-sm font-bold px-5 py-2.5 rounded-full hover:bg-zinc-200 hover:scale-105 transition-all shadow-lg">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* PREMIUM DARK HERO SECTION */}
      <section className="relative pt-40 pb-32 md:pt-52 md:pb-40 px-4 overflow-hidden bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(251,191,36,0.15),rgba(255,255,255,0))]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center space-x-2 bg-white/5 backdrop-blur-md border border-white/10 px-4 py-1.5 rounded-full mb-8 shadow-2xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">V1.1.1 is now live</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold text-white tracking-tighter leading-[1.05] mb-8 drop-shadow-2xl">
              The ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandGold via-amber-400 to-yellow-200">safety net</span><br className="hidden md:block"/> for your family.
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-zinc-400 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
              Link smart QR codes to life-saving digital profiles for your kids and pets. A single scan sends you their exact GPS location instantly. No app required.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
              <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brandGold text-zinc-950 px-8 py-4 rounded-full font-extrabold text-lg hover:bg-amber-400 transition-all shadow-[0_0_30px_rgba(251,191,36,0.3)] hover:scale-105">
                <span>Secure Them Now</span>
                <ChevronRight size={20} />
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-xs font-bold text-zinc-500 uppercase tracking-widest mt-10">
              <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-emerald-500"/> 100% Free Forever</span>
              <span className="flex items-center gap-1.5"><Lock size={14} className="text-brandGold"/> Encrypted Vault</span>
              <span className="flex items-center gap-1.5"><Shield size={14} className="text-blue-500"/> GPS Tracking</span>
            </div>
          </ScrollReveal>

          {/* FLOATING MOCKUPS */}
          <ScrollReveal delay={500}>
            <div className="mt-20 relative mx-auto w-full max-w-4xl flex justify-center perspective-[2000px]">
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-t from-zinc-950 via-transparent to-transparent z-30 pointer-events-none"></div>
              
              <div className="flex justify-center items-center gap-4 md:gap-12 w-full">
                {/* Left Device */}
                <div className="relative w-[200px] md:w-[280px] aspect-[9/19.5] rounded-[2rem] md:rounded-[2.5rem] border-[6px] md:border-[8px] border-zinc-800 bg-zinc-900 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden transform rotate-y-[15deg] rotate-z-[-5deg] translate-x-4 md:translate-x-8 z-10 opacity-80 hover:opacity-100 hover:rotate-y-0 hover:rotate-z-0 transition-all duration-700 ease-out">
                  <div className="relative w-full h-full bg-zinc-100 overflow-hidden rounded-[1.5rem] md:rounded-[2rem]">
                     <div className="absolute top-0 left-0 w-[375px] h-[813px] origin-top-left [transform:scale(0.5)] md:[transform:scale(0.71)]">
                        <iframe src="https://kintag.vercel.app/#/id/OSCIDGkJXSIh9mTmOVtr?preview=true" className="w-full h-full border-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }} title="Pet Profile" />
                     </div>
                  </div>
                </div>

                {/* Center Device */}
                <div className="relative w-[240px] md:w-[320px] aspect-[9/19.5] rounded-[2.25rem] md:rounded-[3rem] border-[8px] md:border-[10px] border-zinc-800 bg-black shadow-[0_30px_100px_rgba(0,0,0,0.8)] overflow-hidden transform z-20 hover:-translate-y-4 transition-all duration-700 ease-out">
                  <div className="absolute top-0 inset-x-0 h-6 bg-black z-50 rounded-b-3xl w-1/2 mx-auto"></div>
                  <div className="relative w-full h-full bg-zinc-100 overflow-hidden rounded-[1.75rem] md:rounded-[2.4rem]">
                     <div className="absolute top-0 left-0 w-[375px] h-[813px] origin-top-left [transform:scale(0.6)] md:[transform:scale(0.81)]">
                        <iframe src="https://kintag.vercel.app/#/id/kJeMwTQgTnuARri1gwc3?preview=true" className="w-full h-full border-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none' }} title="Kid Profile" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

        </div>
      </section>

      {/* ARCHITECTURAL BACKGROUND FOR LIGHT SECTIONS */}
      <div className="relative bg-white pb-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

        {/* HOW IT WORKS */}
        <section id="how-it-works" className="pt-32 pb-20 relative z-10 scroll-mt-20">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <ScrollReveal>
              <div className="flex flex-col items-center mb-16 text-center">
                <div className="inline-flex items-center space-x-2 bg-zinc-100 text-zinc-500 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4 border border-zinc-200">
                  Setup Process
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark tracking-tight mb-6">Three steps to peace of mind.</h2>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
              <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[2px] bg-gradient-to-r from-transparent via-brandGold/30 to-transparent z-0"></div>
              
              <ScrollReveal delay={0}>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white border border-zinc-200 shadow-xl rounded-full flex items-center justify-center mb-8 group-hover:-translate-y-2 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-brandGold rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <span className="text-4xl font-black text-brandDark">1</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-brandDark mb-3">Create Profile</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed px-4">Build a secure digital ID detailing emergency contacts, medical info, and behavioral triggers.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={150}>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-white border border-zinc-200 shadow-xl rounded-full flex items-center justify-center mb-8 group-hover:-translate-y-2 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-brandGold rounded-full blur-xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
                    <span className="text-4xl font-black text-brandDark">2</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-brandDark mb-3">Attach Tag</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed px-4">Download your custom QR code or link a blank NFC sticker to a backpack, collar, or bracelet.</p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300}>
                <div className="relative z-10 flex flex-col items-center text-center group">
                  <div className="w-24 h-24 bg-brandDark text-brandGold border-4 border-white shadow-2xl rounded-full flex items-center justify-center mb-8 group-hover:-translate-y-2 transition-transform duration-500 relative">
                    <div className="absolute inset-0 bg-brandGold rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                    <span className="text-4xl font-black">3</span>
                  </div>
                  <h3 className="text-xl font-extrabold text-brandDark mb-3">Get Alerted</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed px-4">If scanned, the finder views the ID and securely sends their exact GPS location to your phone.</p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>

        {/* BENTO UI - WHO IS IT FOR */}
        <section className="py-20 relative z-10">
          <div className="max-w-5xl mx-auto px-4 md:px-8">
            <ScrollReveal>
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark tracking-tight mb-4">Built for the vulnerable.</h2>
                <p className="text-zinc-500 font-medium text-lg">Engineered to protect those who can't ask for help themselves.</p>
              </div>
            </ScrollReveal>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Kids (Large Card) */}
              <ScrollReveal delay={0}>
                <div className="bg-white/80 backdrop-blur p-8 md:p-10 rounded-[2.5rem] border border-zinc-200/60 shadow-sm hover:shadow-xl hover:border-brandDark/20 transition-all duration-500 h-full flex flex-col justify-between group overflow-hidden relative lg:col-span-2">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors duration-500"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                      <User size={28} />
                    </div>
                    <h3 className="text-3xl font-extrabold text-brandDark mb-3 tracking-tight">Children & Toddlers</h3>
                    <p className="text-zinc-500 font-medium text-lg max-w-md leading-relaxed">
                      Perfect for crowded amusement parks or field trips. Instantly alert finders to non-verbal behaviors, severe allergies, or special needs so they know exactly how to help.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              
              {/* Pets (Tall Card) */}
              <ScrollReveal delay={150}>
                <div className="bg-white/80 backdrop-blur p-8 rounded-[2.5rem] border border-zinc-200/60 shadow-sm hover:shadow-xl hover:border-amber-500/30 transition-all duration-500 h-full group relative overflow-hidden">
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-colors"></div>
                  <div className="relative z-10">
                    <div className="w-14 h-14 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                      <PawPrint size={28} />
                    </div>
                    <h3 className="text-2xl font-extrabold text-brandDark mb-3 tracking-tight">Pets & Animals</h3>
                    <p className="text-zinc-500 font-medium leading-relaxed">
                      Share their microchip ID, temperament, and diet restrictions instantly if they escape the yard. No bulky GPS collar required.
                    </p>
                  </div>
                </div>
              </ScrollReveal>
              
              {/* Seniors (Wide Card) */}
              <ScrollReveal delay={300}>
                <div className="bg-brandDark p-8 md:p-10 rounded-[2.5rem] shadow-2xl transition-all duration-500 h-full lg:col-span-3 group relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%,100%_100%] animate-[shimmer_8s_infinite_linear]"></div>
                  <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
                    <div className="w-16 h-16 bg-white/10 text-white border border-white/20 rounded-2xl flex items-center justify-center shrink-0 backdrop-blur-md">
                      <Activity size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl md:text-3xl font-extrabold text-white mb-3 tracking-tight">Seniors & Medical</h3>
                      <p className="text-zinc-400 font-medium text-lg leading-relaxed max-w-3xl">
                        A critical safety net for elderly family members prone to wandering. Securely store their medical conditions, daily medications, and primary caregivers behind a digital lock.
                      </p>
                    </div>
                  </div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </section>
      </div>

      {/* INTERACTIVE CARD STACK FEATURES */}
      <section className="py-32 bg-zinc-50 border-y border-zinc-200 overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-b from-white to-zinc-50"></div>
        <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark tracking-tight mb-6">Smarter than a standard ID.</h2>
              <p className="text-zinc-500 font-medium text-lg">Swipe through to explore the complete feature set.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="w-full max-w-lg mx-auto flex justify-center">
              <CardStack
                items={stackFeatures}
                initialIndex={0}
                autoAdvance
                intervalMs={3000}
                pauseOnHover
                showDots={false} 
              />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* PWA / APP SECTION */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="bg-zinc-950 rounded-[3rem] p-8 md:p-12 lg:p-16 shadow-2xl relative overflow-hidden border border-zinc-800 flex flex-col md:flex-row items-center gap-12">
              <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brandGold/10 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex-1 relative z-10 text-center md:text-left">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
                  Install the <span className="text-brandGold">Native App</span>
                </h2>
                <p className="text-zinc-400 font-medium text-lg leading-relaxed mb-8">
                  Get the best, full-screen experience without browser distractions. Install KinTag directly to your device home screen instantly.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                  {deferredPrompt ? (
                    <button onClick={handleInstallApp} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brandGold text-zinc-950 px-8 py-4 rounded-full font-extrabold shadow-[0_0_20px_rgba(251,191,36,0.3)] hover:bg-amber-400 transition-all hover:scale-105">
                      <Download size={20} />
                      <span>Install Web App</span>
                    </button>
                  ) : (
                    <div className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white/10 text-white/50 px-8 py-4 rounded-full font-bold border border-white/10 cursor-not-allowed">
                      <CheckCircle2 size={20} />
                      <span>App Installed</span>
                    </div>
                  )}
                </div>
                <p className="text-zinc-500 text-xs font-medium mt-6 md:max-w-sm">
                  * iOS Safari Users: Tap the Share icon at the bottom of your browser and select "Add to Home Screen".
                </p>
              </div>

              <div className="relative z-10 shrink-0 hidden md:block">
                <div className="w-48 h-48 bg-gradient-to-br from-brandGold to-amber-600 p-1 rounded-[2.5rem] shadow-2xl transform rotate-6 hover:rotate-0 transition-all duration-500">
                  <div className="w-full h-full bg-zinc-950 rounded-[2.25rem] flex items-center justify-center">
                    <img src="/kintag-logo.png" alt="KinTag Icon" className="w-20 h-20 rounded-2xl" />
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FOUNDER LETTER */}
      <section className="py-24 px-4 bg-zinc-50 border-y border-zinc-200">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-[3rem] p-8 md:p-16 shadow-sm border border-zinc-200/60 relative overflow-hidden">
              <div className="absolute top-10 right-10 opacity-5">
                <HeartHandshake size={160} />
              </div>
              
              <div className="relative z-10">
                <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-600 px-4 py-1.5 rounded-full mb-8 font-bold text-xs uppercase tracking-widest border border-emerald-100">
                  <Terminal size={14} />
                  <span>The Developer's Promise</span>
                </div>
                
                <h2 className="text-3xl md:text-5xl font-extrabold text-brandDark tracking-tight leading-[1.1] mb-10">
                  Why is this 100% free?
                </h2>
                
                <div className="space-y-6 text-zinc-600 font-medium leading-relaxed text-lg max-w-2xl">
                  <p>
                    I built KinTag in a single week. When I looked for a way to safeguard my own family, I found an industry plagued by bulky hardware, clunky apps, and predatory monthly subscriptions.
                  </p>
                  <p>
                    I realized I couldn't trust massive corporations with my family's deeply personal data. More importantly, I absolutely refused to be trapped in a subscription cycle for something so crucial. <strong className="text-brandDark">Think about it: one forgotten payment, and your child's safety net is instantly turned off.</strong> I couldn't live with that anxiety.
                  </p>
                  <p className="text-brandDark text-xl md:text-2xl font-extrabold pt-4">
                    That is exactly why KinTag is, and always will be, completely free for lifetime.
                  </p>
                  <p>
                    I actively use this platform for my own loved ones, because I needed to build the exact tool I wished existed. You own your data, and your family's safety is never held behind a paywall.
                  </p>
                </div>

                <div className="mt-12 pt-8 border-t border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center text-zinc-400">
                      <User size={20} />
                    </div>
                    <div>
                      <p className="font-extrabold text-brandDark">Solo Developer</p>
                      <p className="text-sm text-zinc-500 font-medium">KinTag Creator</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* MONOCHROME FAQ SECTION */}
      <FAQMonochrome faqs={faqData} />

      {/* CODE / SELF-HOST */}
      <section className="py-24 bg-zinc-950 text-white border-b border-black">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 relative">
            <ScrollReveal delay={0}>
              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-6 flex items-center gap-3">
                <Github size={36} /> Open & Self-Hostable
              </h2>
              <p className="text-zinc-400 font-medium leading-relaxed mb-8 text-lg">
                Are you a developer? You shouldn't have to rely on third-party servers for your family's safety. KinTag is designed to be completely self-hostable. Grab the code, hook it up to your own Firebase instance, and take 100% ownership.
              </p>
              
              <div className="relative inline-block">
                <button onClick={handleGithubClick} className="flex items-center justify-center space-x-2 bg-white text-black px-8 py-3.5 rounded-full font-bold transition-all hover:scale-105">
                  <span>View Source Code</span>
                </button>
                {showGithubTooltip && (
                  <div className="absolute top-1/2 left-[calc(100%+20px)] -translate-y-1/2 bg-zinc-800 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-xl animate-in fade-in slide-in-from-left-2 whitespace-nowrap">
                    Repository opening soon
                    <div className="absolute top-1/2 -left-[5px] -translate-y-1/2 w-0 h-0 border-y-[5px] border-y-transparent border-r-[5px] border-r-zinc-800"></div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>

          <div className="flex-1 w-full max-w-md">
            <ScrollReveal delay={200}>
              <div className="bg-[#0D0D0D] rounded-2xl shadow-2xl border border-white/10 overflow-hidden font-mono text-sm">
                <div className="bg-white/5 px-4 py-3 flex items-center gap-2 border-b border-white/5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 text-xs text-zinc-500 font-sans font-medium">terminal — bash</span>
                </div>
                <div className="p-5 text-emerald-400/90 leading-relaxed overflow-x-auto">
                  <span className="text-zinc-500"># Clone the repository</span><br/>
                  <span className="text-blue-400">git clone</span> https://github.com/...<br/><br/>
                  <span className="text-zinc-500"># Install dependencies</span><br/>
                  <span className="text-blue-400">npm</span> install<br/><br/>
                  <span className="text-zinc-500"># Setup your config</span><br/>
                  <span className="text-blue-400">cp</span> .env.example .env<br/><br/>
                  <span className="text-zinc-500"># Start local server</span><br/>
                  <span className="text-blue-400">npm run</span> dev<span className="animate-pulse">_</span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-32 bg-white text-center px-4 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[200px] bg-brandGold/5 blur-3xl pointer-events-none"></div>
        <ScrollReveal>
          <div className="w-20 h-20 bg-zinc-50 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-zinc-200 shadow-sm">
            <Shield size={32} className="text-brandDark" />
          </div>
          <h2 className="text-4xl md:text-6xl font-extrabold text-brandDark tracking-tighter mb-6">Securing them is simple.</h2>
          <p className="text-zinc-500 font-medium text-xl mb-10 max-w-md mx-auto">Create an account and setup your first digital ID card in under 2 minutes.</p>
          <Link to="/signup" className="inline-flex items-center justify-center space-x-2 bg-brandDark text-white px-10 py-5 rounded-full font-extrabold text-lg hover:bg-brandAccent transition-all shadow-xl hover:scale-105">
            <span>Get Started for Free</span>
            <ArrowRight size={20} />
          </Link>
        </ScrollReveal>
      </section>

      {/* MINIMAL FOOTER */}
      <footer className="bg-zinc-50 py-12 border-t border-zinc-200 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6 grayscale opacity-40 hover:opacity-100 hover:grayscale-0 transition-all cursor-pointer">
          <img src="/kintag-logo.png" alt="Logo" className="w-6 h-6 rounded-md" />
          <span className="font-extrabold text-brandDark text-lg tracking-tight">KinTag</span>
        </div>
        <div className="flex items-center justify-center gap-6 text-sm font-bold text-zinc-500 mb-8">
          <a href="mailto:shovith2@gmail.com" className="hover:text-brandDark transition-colors">Email</a>
          <a href="https://wa.me/918777845713" target="_blank" rel="noopener noreferrer" className="hover:text-brandDark transition-colors">WhatsApp</a>
          <a href="https://t.me/X_o_x_o_002" target="_blank" rel="noopener noreferrer" className="hover:text-brandDark transition-colors">Telegram</a>
          <Link to="/changelog" className="hover:text-brandDark transition-colors">Changelog</Link>
        </div>
        <p className="text-xs text-zinc-400 font-bold">© {new Date().getFullYear()} KinTag. Developed by <span className="text-zinc-600">Hawkay002</span>.</p>
      </footer>
    </div>
  );
}

function ScrollReveal({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target); 
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" } 
    );
    
    if (ref.current) observer.observe(ref.current);
    return () => { if (ref.current) observer.unobserve(ref.current); };
  }, []);

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.25,1,0.5,1)] ${isVisible ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-12 blur-sm'}`}
    >
      {children}
    </div>
  );
}
