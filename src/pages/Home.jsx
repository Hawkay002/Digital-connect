import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom'; 
import { Turnstile } from '@marsidev/react-turnstile';
import { CardStack } from '../components/ui/card-stack'; 
import { FAQMonochrome } from '../components/ui/faq-monochrome'; 
import { 
  Shield, MapPin, BellRing, Heart, Smartphone, Github, ArrowRight, 
  CheckCircle2, PawPrint, User, Activity, Info, RefreshCw, Battery, Cloud, 
  Lock, Infinity, Zap, Mail, MessageCircle, Send, 
  Users, Wifi, Database, Phone, AlertTriangle, Trash2, Rocket, Siren, Megaphone, FileText, ShieldCheck, Download,
  Code2, Sparkles, Terminal
} from 'lucide-react';

const stackFeatures = [
  { id: 1, title: "No App Required", description: "Anyone with a smartphone camera can scan the tag. There is absolutely nothing for the finder to download or install.", icon: <Smartphone size={40} className="text-zinc-800" /> },
  { id: 2, title: "Instant Setup", description: "Skip the wait times of ordering custom engraved metals. Create an account and secure your child or pet in under 2 minutes.", icon: <Zap size={40} className="text-zinc-800" /> },
  { id: 3, title: "Unlimited Scans", description: "There is absolutely no cap on how many times your QR codes or NFC tags can be scanned.", icon: <Infinity size={40} className="text-zinc-800" /> },
  { id: 4, title: "Precision GPS Pinpointing", description: "When scanned, the finder can securely send their exact coordinates directly to your phone with a single tap.", icon: <MapPin size={40} className="text-zinc-800" /> },
  { id: 5, title: "Passive Location Fallback", description: "Even if the finder denies GPS access, KinTag will passively log their general IP-based city and send an alert.", icon: <Wifi size={40} className="text-zinc-800" /> },
  { id: 6, title: "Instant Push Alerts", description: "The second a tag is scanned, you receive an emergency push notification alerting you that your loved one was found.", icon: <BellRing size={40} className="text-zinc-800" /> },
  { id: 7, title: "One-Tap Emergency Dial", description: "A massive, clear button allows the finder to instantly dial your emergency contact number without copying it.", icon: <Phone size={40} className="text-zinc-800" /> },
  { id: 8, title: "Lost Mode (Panic Button)", description: "Instantly transform a lost tag into a high-alert distress signal with a flashing missing banner and pulsing emergency dialer.", icon: <Siren size={40} className="text-zinc-800" /> },
  { id: 9, title: "KinAlert Broadcasts", description: "Trigger an instant localized push notification to all other KinTag users in your zip code to help search for your missing loved one.", icon: <Megaphone size={40} className="text-zinc-800" /> },
  { id: 10, title: "Secure Document Vault", description: "Upload sensitive medical records or IDs. They remain heavily locked and blurred until the finder explicitly shares their GPS location or calls you.", icon: <FileText size={40} className="text-zinc-800" /> },
  { id: 11, title: "Anti-Download Protection", description: "Strict UI protections prevent strangers from right-clicking, dragging, or long-pressing to save your photos and documents.", icon: <ShieldCheck size={40} className="text-zinc-800" /> },
  { id: 12, title: "Co-Guardian Family Sharing", description: "Invite up to 5 family members. When a tag is scanned, every co-guardian receives an instant push alert simultaneously.", icon: <Users size={40} className="text-zinc-800" /> },
  { id: 13, title: "Behavioral Alerts", description: "Highlight critical non-verbal behaviors, special needs, or fears so the finder knows exactly how to approach them.", icon: <AlertTriangle size={40} className="text-zinc-800" /> },
  { id: 14, title: "Critical Medical Info", description: "Display crucial allergies, blood types, and daily medications instantly to whoever scans the tag.", icon: <Heart size={40} className="text-zinc-800" /> },
  { id: 15, title: "Microchip Linking", description: "Store your pet's official microchip ID number visibly so veterinarians can cross-reference it instantly.", icon: <Database size={40} className="text-zinc-800" /> },
  { id: 16, title: "Vaccination Records", description: "Display rabies and core vaccination statuses to reassure finders that your pet is safe to handle.", icon: <Activity size={40} className="text-zinc-800" /> },
  { id: 17, title: "Dynamic Updates", description: "Moved to a new house? Changed your phone number? Update your profile instantly without ever needing to print a new tag.", icon: <RefreshCw size={40} className="text-zinc-800" /> },
  { id: 18, title: "Cloud Synced", description: "All your profiles are securely backed up to the cloud. Access and manage your dashboard from any device.", icon: <Cloud size={40} className="text-zinc-800" /> },
  { id: 19, title: "Complete Data Control", description: "You own your data. Permanently wipe your account, profiles, and scan histories from our servers at any time.", icon: <Trash2 size={40} className="text-zinc-800" /> },
  { id: 20, title: "Zero Battery Required", description: "Unlike bulky GPS collars that constantly die and require charging, KinTag relies on the battery and cellular data of the Good Samaritan's smartphone. Your tag will never run out of power.", icon: <Battery size={40} className="text-zinc-800" /> }
];

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

export default function Home() {
  const [showGithubTooltip, setShowGithubTooltip] = useState(false);
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

  const scrollToSection = (id, e) => {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center p-4 selection:bg-brandGold selection:text-white">
        <div className="text-center mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-24 h-24 bg-white rounded-3xl shadow-xl flex items-center justify-center mx-auto mb-6 border border-zinc-100/50">
            <img src="/kintag-logo.png" alt="KinTag Logo" className="w-14 h-14 rounded-2xl animate-pulse" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-brandDark tracking-tight mb-3">Securing connection...</h1>
          <p className="text-zinc-500 font-medium max-w-sm mx-auto leading-relaxed">
            Please wait a moment to ensure you are a real person before accessing the KinTag platform.
          </p>
        </div>
        <div className="animate-in fade-in zoom-in-95 duration-500 delay-300 min-h-[65px]">
          <Turnstile siteKey={import.meta.env.VITE_CLOUDFLARE_SITE_KEY || '1x00000000000000000000AA'} onSuccess={() => setIsVerified(true)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-brandGold selection:text-white animate-in fade-in duration-700 w-full text-zinc-900">
      
      {/* 🌟 REDESIGNED: Floating Pill Navbar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 pointer-events-none">
        <nav className="max-w-5xl mx-auto bg-white/80 backdrop-blur-xl border border-zinc-200/60 shadow-lg shadow-zinc-200/20 rounded-full px-6 py-3.5 flex items-center justify-between pointer-events-auto transition-all">
          <div className="flex items-center space-x-3">
            <img src="/kintag-logo.png" alt="KinTag Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="text-xl font-extrabold tracking-tight">KinTag</span>
          </div>
          <div className="flex items-center space-x-5">
            <Link to="/login" className="text-sm font-bold text-zinc-500 hover:text-brandDark transition-colors hidden sm:block">Log In</Link>
            <Link to="/signup" className="bg-brandDark text-white text-sm font-bold px-6 py-2.5 rounded-full hover:bg-brandAccent transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Get Started
            </Link>
          </div>
        </nav>
      </div>

      {/* 🌟 REDESIGNED: Hero Section */}
      <section className="relative pt-40 pb-20 md:pt-48 md:pb-32 px-4 overflow-hidden bg-zinc-50 border-b border-zinc-100">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-200/60 via-zinc-50/10 to-transparent pointer-events-none blur-3xl"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.015] pointer-events-none mix-blend-overlay"></div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10">
          <ScrollReveal delay={0}>
            <div className="inline-flex items-center space-x-2 bg-white border border-zinc-200/60 px-4 py-1.5 rounded-full mb-8 shadow-sm">
              <Sparkles size={14} className="text-brandGold" />
              <span className="text-xs font-bold uppercase tracking-widest text-zinc-600">V1.1.1 is now live</span>
            </div>
          </ScrollReveal>
          
          <ScrollReveal delay={100}>
            <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-black tracking-tighter leading-[1.05] mb-8">
              The ultimate <span className="text-transparent bg-clip-text bg-gradient-to-r from-brandDark via-zinc-700 to-brandDark">digital safety net</span><br className="hidden md:block"/> for your family.
            </h1>
          </ScrollReveal>
          
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
              Link custom QR codes or NFC tags to life-saving digital profiles for your kids and pets. A simple scan sends you their exact GPS location instantly.
            </p>
          </ScrollReveal>
          
          <ScrollReveal delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link to="/signup" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brandDark text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-brandAccent transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1">
                <span>Start securing them now</span>
                <ArrowRight size={18} />
              </Link>
              <button onClick={(e) => scrollToSection('how-it-works', e)} className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-zinc-900 border border-zinc-200/80 px-8 py-4 rounded-full font-bold text-lg hover:bg-zinc-50 transition-all shadow-sm">
                See how it works
              </button>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-xs font-bold text-zinc-400 uppercase tracking-widest mb-16">
              <span className="flex items-center gap-2"><Lock size={14} className="text-zinc-300"/> Fully Encrypted</span>
              <span className="flex items-center gap-2"><Infinity size={14} className="text-zinc-300"/> 100% Free Forever</span>
              <span className="flex items-center gap-2"><Shield size={14} className="text-zinc-300"/> No App Required</span>
            </div>
          </ScrollReveal>

          {/* 🌟 UPGRADED: Hero 3D Mockups */}
          <ScrollReveal delay={500}>
            <div className="relative mx-auto max-w-5xl">
              <div className="flex justify-center mb-10 relative z-40">
                <div className="inline-flex items-center gap-1.5 bg-black/80 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-full shadow-2xl">
                  <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span></span>
                  <span className="text-[10px] font-bold tracking-widest uppercase ml-1">Live Demo Preview</span>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-center items-center gap-8 md:gap-12 lg:gap-16 perspective-[1200px] w-full pb-10 md:pb-0">
                <div className="relative w-[280px] md:w-[320px] aspect-[9/19.5] rounded-[3rem] border-[10px] border-zinc-900 bg-zinc-900 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden transform md:rotate-y-[12deg] md:rotate-x-[6deg] z-20 md:hover:rotate-y-0 md:hover:rotate-x-0 hover:scale-[1.03] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group shrink-0">
                  <div className="relative w-full h-full bg-zinc-100 overflow-hidden rounded-[2.4rem] ring-1 ring-white/20 inset-0">
                     <div className="absolute top-0 left-0 w-[375px] h-[813px] origin-top-left max-md:[transform:scale(0.704)] md:[transform:scale(0.8)]">
                        <iframe src="https://kintag.vercel.app/#/id/kJeMwTQgTnuARri1gwc3?preview=true" className="w-full h-full border-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} title="Live Kid Profile View" />
                     </div>
                  </div>
                </div>

                <div className="relative w-[280px] md:w-[310px] aspect-[9/20] rounded-[2.75rem] border-[10px] border-zinc-800 bg-zinc-800 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden transform md:rotate-y-[-12deg] md:rotate-x-[6deg] z-10 md:hover:rotate-y-0 md:hover:rotate-x-0 hover:scale-[1.03] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group shrink-0">
                  <div className="relative w-full h-full bg-zinc-100 overflow-hidden rounded-[2.1rem] ring-1 ring-white/10 inset-0">
                     <div className="absolute top-0 left-0 w-[375px] h-[834px] origin-top-left max-md:[transform:scale(0.704)] md:[transform:scale(0.7733)]">
                        <iframe src="https://kintag.vercel.app/#/id/OSCIDGkJXSIh9mTmOVtr?preview=true" className="w-full h-full border-0 [&::-webkit-scrollbar]:hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} title="Live Pet Profile View" />
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 🌟 REDESIGNED: How It Works (Bento/Card Track) */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white scroll-mt-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16 md:mb-20 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Zero friction.<br/>Maximum security.</h2>
              <p className="text-zinc-500 font-medium text-lg md:text-xl max-w-xl">You can't afford complexity during an emergency. We built the platform to work instantly, everywhere.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            <ScrollReveal delay={0}>
              <div className="bg-zinc-50 p-8 md:p-10 rounded-[2rem] border border-zinc-200/60 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 border border-zinc-200/60">
                  <span className="text-xl font-black text-brandDark">1</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Create a Profile</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Sign up and build a detailed digital ID card containing emergency contacts, medical info, and behavioral details.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={150}>
              <div className="bg-zinc-50 p-8 md:p-10 rounded-[2rem] border border-zinc-200/60 h-full hover:shadow-xl hover:-translate-y-1 transition-all duration-500">
                <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-8 border border-zinc-200/60">
                  <span className="text-xl font-black text-brandDark">2</span>
                </div>
                <h3 className="text-2xl font-bold mb-3 tracking-tight">Generate & Attach</h3>
                <p className="text-zinc-500 font-medium leading-relaxed">Download your custom QR code or link an NFC tag. Attach it to a pet's collar, a kid's backpack, or a medical bracelet.</p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={300}>
              <div className="bg-zinc-950 text-white p-8 md:p-10 rounded-[2rem] shadow-xl h-full hover:-translate-y-1 transition-all duration-500 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-brandGold/20 to-transparent opacity-50"></div>
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-8 border border-white/20">
                    <span className="text-xl font-black text-white">3</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-3 tracking-tight">Get Scanned</h3>
                  <p className="text-zinc-400 font-medium leading-relaxed">If they are lost, a Good Samaritan scans the tag. You instantly get an alert, and they can send you their exact GPS location.</p>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 🌟 REDESIGNED: Bento Box "Who is it for" */}
      <section className="py-24 md:py-32 bg-zinc-50 border-y border-zinc-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="mb-16 text-center">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Built for the vulnerable.</h2>
              <p className="text-zinc-500 font-medium text-lg md:text-xl">Engineered to protect those who cannot speak for themselves.</p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Large Card */}
            <ScrollReveal delay={0} className="md:col-span-3">
              <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-zinc-200/60 h-full hover:shadow-lg transition-all duration-500 group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 opacity-5 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform duration-700">
                  <User size={200} />
                </div>
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-8">
                  <User size={28} />
                </div>
                <h3 className="text-3xl font-black mb-4 tracking-tight">Children</h3>
                <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-sm relative z-10">
                  Perfect for amusement parks, crowded malls, or field trips. Alert finders to non-verbal behaviors, severe allergies, or special needs instantly.
                </p>
              </div>
            </ScrollReveal>
            
            {/* Stacked Right Cards */}
            <div className="md:col-span-2 flex flex-col gap-6">
              <ScrollReveal delay={150} className="h-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-200/60 h-full hover:shadow-lg transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                      <PawPrint size={24} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Pets & Animals</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    Easily share their microchip number, temperament, and diet restrictions if they escape the yard.
                  </p>
                </div>
              </ScrollReveal>

              <ScrollReveal delay={300} className="h-full">
                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-zinc-200/60 h-full hover:shadow-lg transition-all duration-500 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-14 h-14 bg-pink-50 text-pink-600 rounded-2xl flex items-center justify-center">
                      <Activity size={24} />
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-2 tracking-tight">Seniors & Medical</h3>
                  <p className="text-zinc-500 font-medium leading-relaxed">
                    A critical safety net detailing medical conditions and primary caregivers for those prone to wandering.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* NEW: INTERACTIVE CARD STACK FEATURES */}
      <section className="py-32 md:py-48 bg-white overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <ScrollReveal>
            <div className="text-center mb-20">
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">Smarter than a standard ID.</h2>
              <p className="text-zinc-500 font-medium text-lg md:text-xl">Swipe to explore how KinTag brings them home safely and quickly.</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="w-full max-w-lg mx-auto flex justify-center mt-10">
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

      {/* 🌟 REDESIGNED: Developer Manifesto */}
      <section className="py-32 bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brandGold/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none mix-blend-overlay"></div>

        <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row gap-16 md:gap-24 items-start">
              
              <div className="flex-1 space-y-8">
                <div className="inline-flex items-center space-x-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full">
                  <Terminal size={14} className="text-brandGold" />
                  <span className="text-xs font-bold uppercase tracking-widest text-zinc-300">The KinTag Promise</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-[1.1]">
                  Built by a solo developer.<br/>Driven by pure passion.
                </h2>
                <div className="space-y-6 text-zinc-400 font-medium text-lg leading-relaxed">
                  <p>
                    I built KinTag in a single week. When I looked for a way to safeguard my own family, I found an industry plagued by bulky hardware, clunky apps, and predatory monthly subscriptions. 
                  </p>
                  <p>
                    I realized I couldn't trust massive corporations with my family's deeply personal data. More importantly, I absolutely refused to be trapped in a subscription cycle for something so crucial. <span className="text-white font-bold">Think about it: one forgotten payment, and your child's safety net is instantly turned off.</span> I couldn't live with that anxiety.
                  </p>
                  <p className="text-white text-2xl font-black tracking-tight pt-4">
                    That is exactly why KinTag is <br className="hidden sm:block"/><span className="text-emerald-400">100% free for lifetime.</span>
                  </p>
                </div>
              </div>
              
              <div className="w-full md:w-[380px] bg-white/5 backdrop-blur-xl p-8 rounded-[2rem] border border-white/10 shrink-0">
                <h3 className="text-white font-bold mb-6 text-xl tracking-tight">Platform Guarantees</h3>
                <ul className="space-y-5 mb-10">
                  <li className="flex items-start text-zinc-300 font-medium gap-4"><CheckCircle2 size={24} className="text-emerald-400 shrink-0"/> Fully encrypted Google Firebase database</li>
                  <li className="flex items-start text-zinc-300 font-medium gap-4"><CheckCircle2 size={24} className="text-emerald-400 shrink-0"/> Zero hidden paywalls or premium lockouts</li>
                  <li className="flex items-start text-zinc-300 font-medium gap-4"><CheckCircle2 size={24} className="text-emerald-400 shrink-0"/> You have absolute ownership of your data</li>
                  <li className="flex items-start text-zinc-300 font-medium gap-4"><CheckCircle2 size={24} className="text-emerald-400 shrink-0"/> Built specifically for parents, by a parent</li>
                </ul>
                <Link to="/signup" className="w-full flex items-center justify-center bg-white text-zinc-950 py-4 rounded-xl font-bold text-lg hover:bg-zinc-200 transition-all shadow-lg hover:scale-[1.02]">
                  Create Your Free KinTag
                </Link>
              </div>

            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 🌟 NATIVE APP BANNER */}
      <section className="py-8 bg-zinc-950 border-b border-white/10 relative z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
           <div className="bg-brandGold text-zinc-950 rounded-[2rem] p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden shadow-2xl">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/20 blur-3xl rounded-full pointer-events-none"></div>
              <div className="relative z-10 text-center md:text-left">
                <h2 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Get the KinTag Native App</h2>
                <p className="font-medium text-zinc-900/80 max-w-lg">For the best, full-screen experience without browser distractions, install the Web App directly to your device.</p>
              </div>
              <div className="relative z-10 w-full md:w-auto shrink-0 flex flex-col items-center gap-3">
                 {deferredPrompt ? (
                    <button onClick={handleInstallApp} className="w-full md:w-auto flex items-center justify-center space-x-2 bg-zinc-950 text-white px-8 py-4 rounded-full font-bold shadow-xl hover:bg-black hover:scale-105 transition-all">
                      <Download size={20} />
                      <span>Install Web App</span>
                    </button>
                  ) : (
                    <div className="w-full md:w-auto flex items-center justify-center space-x-2 bg-black/10 text-zinc-900/50 px-8 py-4 rounded-full font-bold border border-zinc-900/10 cursor-not-allowed">
                      <CheckCircle2 size={20} />
                      <span>App Installed</span>
                    </div>
                  )}
                  <p className="text-zinc-900/60 text-[10px] font-bold uppercase tracking-widest text-center">iOS: Share &gt; Add to Home Screen</p>
              </div>
           </div>
        </div>
      </section>

      {/* NEW: MONOCHROME FAQ SECTION */}
      <FAQMonochrome faqs={faqData} />

      {/* 🌟 REDESIGNED: Open Source Terminal */}
      <section className="py-32 bg-zinc-50 border-y border-zinc-200">
        <div className="max-w-5xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 relative order-2 md:order-1 w-full">
            <ScrollReveal delay={200}>
              <div className="bg-[#0D0D0D] rounded-2xl p-6 shadow-2xl border border-zinc-800 font-mono text-sm leading-relaxed overflow-hidden relative">
                <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-4">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                <div className="text-zinc-400">
                  <span className="text-emerald-400">~/developer</span>$ <span className="text-white">git clone https://github.com/Hawkay002/KinTag.git</span><br/><br/>
                  <span className="text-emerald-400">~/developer/KinTag</span>$ <span className="text-white">npm install</span><br/>
                  <span className="text-zinc-500">added 142 packages in 3s</span><br/><br/>
                  <span className="text-emerald-400">~/developer/KinTag</span>$ <span className="text-white">cp .env.example .env</span><br/>
                  <span className="text-zinc-500"># Configure your Firebase keys</span><br/><br/>
                  <span className="text-emerald-400">~/developer/KinTag</span>$ <span className="text-white">npm run dev</span><br/>
                  <span className="text-blue-400">VITE v5.0.0</span> <span className="text-zinc-300">ready in 240 ms</span><br/><br/>
                  <span className="text-emerald-400">➜</span>  <span className="text-white">Local:   http://localhost:5173/</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          <div className="flex-1 text-center md:text-left order-1 md:order-2">
            <ScrollReveal delay={0}>
              <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-200/50 rounded-2xl mb-6 text-zinc-600">
                <Code2 size={32} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">
                Open & Self-Hostable
              </h2>
              <p className="text-zinc-500 font-medium text-lg leading-relaxed mb-8">
                Are you a developer? You shouldn't have to rely on third-party servers for your family's safety. KinTag is designed to be completely self-hostable. Grab the code, hook it up to your own Firebase instance, and take 100% ownership of your database.
              </p>
              
              <div className="relative inline-block w-full sm:w-auto">
                <button 
                  onClick={handleGithubClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-3 bg-white border border-zinc-200 text-zinc-400 px-8 py-4 rounded-full font-bold cursor-not-allowed transition-all shadow-sm"
                >
                  <Github size={20} />
                  <span>View Repository</span>
                </button>
                
                {showGithubTooltip && (
                  <div className="absolute top-0 sm:top-1/2 left-1/2 sm:left-[calc(100%+16px)] -translate-x-1/2 sm:-translate-x-0 -translate-y-full sm:-translate-y-1/2 mb-4 sm:mb-0 bg-zinc-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-xl animate-in fade-in slide-in-from-bottom-2 sm:slide-in-from-left-2 duration-200 flex items-center whitespace-nowrap z-10">
                    Repository opening soon
                    <div className="absolute bottom-0 sm:top-1/2 left-1/2 sm:-left-[5px] -translate-x-1/2 sm:translate-x-0 translate-y-full sm:-translate-y-1/2 w-0 h-0 border-t-[5px] sm:border-t-[5px] border-t-zinc-900 sm:border-t-transparent sm:border-y-[5px] sm:border-y-transparent border-x-[5px] border-x-transparent sm:border-r-[5px] sm:border-r-zinc-900"></div>
                  </div>
                )}
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* LIVE CONTACT */}
      <section className="py-24 bg-white border-b border-zinc-100">
        <ScrollReveal>
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <Heart size={48} className="text-brandGold mx-auto mb-8" />
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-6">Help keep KinTag alive.</h2>
            <p className="text-zinc-500 font-medium text-lg leading-relaxed max-w-3xl mx-auto mb-12">
              Currently, the platform relies entirely on the free tiers of backend services like Firebase and Vercel. 
              As more parents join to safeguard their families, our limits will max out. Buying more capacity is incredibly costly for a solo developer. 
              If you believe in this mission and want to help me scale it, or if you just want to say hi, my inbox is always open!
            </p>
            
            <div className="flex flex-wrap items-center justify-center gap-4">
              <a href="mailto:shovith2@gmail.com" className="flex items-center gap-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 px-6 py-4 rounded-full font-bold transition-all shadow-sm">
                <Mail size={18} className="text-blue-500"/> Email Me
              </a>
              <a href="https://wa.me/918777845713" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 px-6 py-4 rounded-full font-bold transition-all shadow-sm">
                <MessageCircle size={18} className="text-emerald-500"/> WhatsApp
              </a>
              <a href="https://t.me/X_o_x_o_002" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 px-6 py-4 rounded-full font-bold transition-all shadow-sm">
                <Send size={18} className="text-sky-500"/> Telegram
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="py-32 bg-zinc-50 text-center px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brandGold/5 rounded-full blur-[100px] pointer-events-none"></div>
        <ScrollReveal>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">Ready to secure your loved ones?</h2>
          <p className="text-zinc-500 font-medium text-xl mb-10">Join the platform and create your first tag in under 2 minutes.</p>
          <Link to="/signup" className="inline-flex items-center justify-center space-x-2 bg-brandDark text-white px-10 py-5 rounded-full font-bold text-xl hover:bg-brandAccent transition-all shadow-2xl hover:scale-105">
            <span>Get Started for Free</span>
            <ArrowRight size={20} />
          </Link>
          <div className="mt-12">
            <Link to="/changelog" className="text-zinc-400 hover:text-brandDark font-bold text-sm uppercase tracking-widest transition-colors">
              Read the Official Changelog
            </Link>
          </div>
        </ScrollReveal>
      </section>

      {/* FOOTER */}
      <footer className="bg-white py-12 border-t border-zinc-200 text-center">
        <div className="flex items-center justify-center space-x-2 mb-6 opacity-50">
          <img src="/kintag-logo.png" alt="Logo" className="w-6 h-6 rounded-md grayscale" />
          <span className="font-bold text-lg tracking-tight">KinTag</span>
        </div>
        <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">© {new Date().getFullYear()} KinTag. All rights reserved.</p>
      </footer>
    </div>
  );
}

function ScrollReveal({ children, delay = 0, className = "" }) {
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
    
    const currentRef = ref.current;
    if (currentRef) observer.observe(currentRef);
    
    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, []);

  return (
    <div 
      ref={ref} 
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'} ${className}`}
    >
      {children}
    </div>
  );
}
