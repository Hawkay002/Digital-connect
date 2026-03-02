import { Link } from 'react-router-dom';
import { Shield, MapPin, BellRing, Heart, QrCode, Smartphone, Github, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 font-sans selection:bg-brandGold selection:text-white">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-zinc-50/80 backdrop-blur-md border-b border-zinc-200/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <img src="/kintag-logo.png" alt="KinTag Logo" className="w-8 h-8 rounded-lg shadow-sm" />
            <span className="text-xl font-extrabold text-brandDark tracking-tight">KinTag</span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-zinc-600 hover:text-brandDark transition-colors">Log In</Link>
            <Link to="/login" className="bg-brandDark text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brandAccent transition-all shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-32 pb-20 md:pt-40 md:pb-32 px-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-brandGold/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white border border-zinc-200 px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-500">V1.0 is now live</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-brandDark tracking-tight leading-[1.1] mb-6">
            The ultimate digital <br className="hidden md:block"/> safety net for your family.
          </h1>
          
          <p className="text-lg md:text-xl text-zinc-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Link custom QR codes or NFC tags to life-saving digital profiles for your kids and pets. If they ever wander off, a simple scan sends you their exact GPS location instantly.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-brandDark text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-brandAccent transition-all shadow-lg hover:-translate-y-0.5">
              <span>Try KinTag for Free</span>
              <ArrowRight size={18} />
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-brandDark border border-zinc-200 px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all shadow-sm">
              How it works
            </a>
          </div>
        </div>
      </section>

      {/* FEATURES GRID */}
      <section id="how-it-works" className="py-20 bg-white border-y border-zinc-100">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-brandDark tracking-tight mb-4">Smarter than a standard ID tag.</h2>
            <p className="text-zinc-500 font-medium">Everything you need to bring them home safely, built right in.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<Smartphone size={24} className="text-blue-500" />}
              title="No App Required"
              desc="Anyone with a smartphone camera can scan the tag. There is absolutely nothing for the finder to download or install."
            />
            <FeatureCard 
              icon={<MapPin size={24} className="text-emerald-500" />}
              title="Precision GPS Pinpointing"
              desc="When scanned, the finder can securely send their exact coordinates directly to your phone with a single tap."
            />
            <FeatureCard 
              icon={<BellRing size={24} className="text-brandGold" />}
              title="Instant Push Alerts"
              desc="The second a tag is scanned, you receive an emergency push notification alerting you that your loved one was found."
            />
            <FeatureCard 
              icon={<Heart size={24} className="text-pink-500" />}
              title="Critical Medical Info"
              desc="Display crucial allergies, behavioral needs, temperament, and microchip IDs instantly to whoever finds them."
            />
            <FeatureCard 
              icon={<QrCode size={24} className="text-purple-500" />}
              title="Custom Mobile IDs"
              desc="Generate beautiful, printable QR codes or program your own blank NFC tags using your KinTag dashboard."
            />
            <FeatureCard 
              icon={<Shield size={24} className="text-zinc-700" />}
              title="Privacy First"
              desc="You control the data. Disable a tag anytime, and rest easy knowing your location alerts are encrypted and secure."
            />
          </div>
        </div>
      </section>

      {/* SOLO DEV & PARENT STORY */}
      <section className="py-24 px-4 relative">
        <div className="max-w-4xl mx-auto bg-brandDark rounded-[3rem] p-8 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brandGold/20 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <Heart size={40} className="text-brandGold mx-auto mb-6" />
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">Built by a single developer.<br/> Designed for parents.</h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed max-w-2xl mx-auto mb-10">
              I built KinTag because existing tracking solutions were either too expensive, incredibly clunky, or required costly monthly subscription fees just to keep basic data active. 
              <br/><br/>
              KinTag is a labor of love. It is lean, lightning-fast, and built strictly to do one thing perfectly: give parents and pet owners genuine peace of mind without the corporate bloat.
            </p>
            <Link to="/login" className="inline-flex items-center justify-center bg-white text-brandDark px-8 py-4 rounded-2xl font-bold text-lg hover:bg-zinc-200 transition-all shadow-lg">
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* SELF-HOST GUIDE */}
      <section className="py-20 bg-white border-t border-zinc-100">
        <div className="max-w-4xl mx-auto px-4 md:px-8 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1">
            <h2 className="text-3xl font-extrabold text-brandDark tracking-tight mb-4 flex items-center gap-3">
              <Github size={32} /> Open & Self-Hostable
            </h2>
            <p className="text-zinc-600 font-medium leading-relaxed mb-6">
              Are you a developer? You shouldn't have to rely on third-party servers for your family's safety. KinTag is designed to be completely self-hostable. Grab the code, hook it up to your own Firebase instance, and take 100% ownership of your database.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-sm font-bold text-zinc-700 gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Full React/Vite Source Code</li>
              <li className="flex items-center text-sm font-bold text-zinc-700 gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Simple Firebase Integration</li>
              <li className="flex items-center text-sm font-bold text-zinc-700 gap-2"><CheckCircle2 size={18} className="text-emerald-500"/> Free to modify for personal use</li>
            </ul>
            <a href="https://github.com/Hawkay002" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center space-x-2 bg-zinc-100 border border-zinc-200 text-brandDark px-6 py-3 rounded-xl font-bold hover:bg-zinc-200 transition-all">
              <span>View GitHub Repository</span>
            </a>
          </div>
          <div className="flex-1 w-full bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800 text-left">
            <div className="flex gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
            </div>
            <pre className="text-emerald-400 font-mono text-sm overflow-x-auto">
              <code>
<span className="text-zinc-500"># Clone the repository</span><br/>
<span className="text-blue-400">git clone</span> https://github.com/...<br/><br/>
<span className="text-zinc-500"># Install dependencies</span><br/>
<span className="text-blue-400">npm</span> install<br/><br/>
<span className="text-zinc-500"># Setup your Firebase config</span><br/>
<span className="text-blue-400">cp</span> .env.example .env<br/><br/>
<span className="text-zinc-500"># Start local server</span><br/>
<span className="text-blue-400">npm run</span> dev
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-zinc-50 py-8 border-t border-zinc-200 text-center">
        <div className="flex items-center justify-center space-x-2 mb-4 opacity-50">
          <img src="/kintag-logo.png" alt="Logo" className="w-5 h-5 rounded grayscale" />
          <span className="font-bold text-brandDark">KinTag</span>
        </div>
        <p className="text-xs text-zinc-400 font-bold">© {new Date().getFullYear()} KinTag. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-200 hover:border-brandDark/20 transition-colors">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm mb-5 border border-zinc-100">
        {icon}
      </div>
      <h3 className="text-xl font-extrabold text-brandDark mb-2">{title}</h3>
      <p className="text-sm text-zinc-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
