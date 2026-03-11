import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react"; // 🌟 NEW IMPORT FOR BUTTON

const INTRO_STYLE_ID = "faq1-animations";

const palettes = {
  dark: {
    surface: "bg-zinc-950 text-zinc-100",
    panel: "bg-zinc-900/50",
    border: "border-white/10",
    heading: "text-white",
    muted: "text-zinc-400",
    iconRing: "border-white/20",
    iconSurface: "bg-white/5",
    icon: "text-white",
    toggle: "border-white/20 text-white",
    toggleSurface: "bg-white/10 hover:bg-white/20",
    glow: "rgba(255, 255, 255, 0.08)",
    aurora: "radial-gradient(ellipse 50% 100% at 10% 0%, rgba(226, 232, 240, 0.15), transparent 65%), #09090b",
    shadow: "shadow-[0_36px_140px_-60px_rgba(10,10,10,0.95)]",
    overlay: "linear-gradient(130deg, rgba(255,255,255,0.04) 0%, transparent 65%)",
  },
  light: {
    surface: "bg-zinc-50 text-zinc-900",
    panel: "bg-white",
    border: "border-zinc-200",
    heading: "text-zinc-900",
    muted: "text-zinc-500",
    iconRing: "border-zinc-200",
    iconSurface: "bg-zinc-50",
    icon: "text-zinc-900",
    toggle: "border-zinc-200 text-zinc-900",
    toggleSurface: "bg-white hover:bg-zinc-100",
    glow: "rgba(15, 15, 15, 0.04)",
    aurora: "radial-gradient(ellipse 50% 100% at 10% 0%, rgba(15, 23, 42, 0.04), rgba(255, 255, 255, 1) 70%)",
    shadow: "shadow-sm",
    overlay: "linear-gradient(130deg, rgba(15,23,42,0.04) 0%, transparent 70%)",
  },
};

export function FAQMonochrome({ faqs = [] }) {
  const [theme, setTheme] = useState("light"); 
  const [introReady, setIntroReady] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [hasEntered, setHasEntered] = useState(false);
  
  // 🌟 NEW: State for Show More / Hide FAQs
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(INTRO_STYLE_ID)) return;
    const style = document.createElement("style");
    style.id = INTRO_STYLE_ID;
    style.innerHTML = `
      @keyframes faq1-fade-up {
        0% { transform: translate3d(0, 20px, 0); opacity: 0; filter: blur(6px); }
        60% { filter: blur(0); }
        100% { transform: translate3d(0, 0, 0); opacity: 1; filter: blur(0); }
      }
      @keyframes faq1-beam-spin {
        0% { transform: rotate(0deg) scale(1); }
        100% { transform: rotate(360deg) scale(1); }
      }
      @keyframes faq1-pulse {
        0% { transform: scale(0.7); opacity: 0.55; }
        60% { opacity: 0.1; }
        100% { transform: scale(1.25); opacity: 0; }
      }
      @keyframes faq1-meter {
        0%, 20% { transform: scaleX(0); transform-origin: left; }
        45%, 60% { transform: scaleX(1); transform-origin: left; }
        80%, 100% { transform: scaleX(0); transform-origin: right; }
      }
      @keyframes faq1-tick {
        0%, 30% { transform: translateX(-6px); opacity: 0.4; }
        50% { transform: translateX(2px); opacity: 1; }
        100% { transform: translateX(20px); opacity: 0; }
      }
      .faq1-intro {
        position: relative;
        display: flex;
        align-items: center;
        gap: 0.85rem;
        padding: 0.85rem 1.4rem;
        border-radius: 9999px;
        overflow: hidden;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(12, 12, 12, 0.42);
        color: rgba(248, 250, 252, 0.92);
        text-transform: uppercase;
        letter-spacing: 0.35em;
        font-size: 0.65rem;
        width: 100%;
        max-width: 24rem;
        margin: 0 auto;
        mix-blend-mode: screen;
        opacity: 0;
        transform: translate3d(0, 12px, 0);
        filter: blur(8px);
        transition: opacity 720ms ease, transform 720ms ease, filter 720ms ease;
        isolation: isolate;
      }
      .faq1-intro--light {
        border-color: rgba(17, 17, 17, 0.12);
        background: rgba(248, 250, 252, 0.88);
        color: rgba(15, 23, 42, 0.78);
        mix-blend-mode: multiply;
      }
      .faq1-intro--active {
        opacity: 1;
        transform: translate3d(0, 0, 0);
        filter: blur(0);
      }
      .faq1-intro__beam,
      .faq1-intro__pulse {
        position: absolute;
        inset: -110%;
        pointer-events: none;
        border-radius: 50%;
      }
      .faq1-intro__beam {
        background: conic-gradient(from 160deg, rgba(226, 232, 240, 0.25), transparent 32%, rgba(148, 163, 184, 0.22) 58%, transparent 78%, rgba(148, 163, 184, 0.18));
        animation: faq1-beam-spin 18s linear infinite;
        opacity: 0.55;
      }
      .faq1-intro--light .faq1-intro__beam {
        background: conic-gradient(from 180deg, rgba(15, 23, 42, 0.18), transparent 30%, rgba(71, 85, 105, 0.18) 58%, transparent 80%, rgba(15, 23, 42, 0.14));
      }
      .faq1-intro__pulse {
        border: 1px solid currentColor;
        opacity: 0.25;
        animation: faq1-pulse 3.4s ease-out infinite;
      }
      .faq1-intro__label {
        position: relative;
        z-index: 1;
        font-weight: 800;
        letter-spacing: 0.4em;
      }
      .faq1-intro__meter {
        position: relative;
        z-index: 1;
        flex: 1 1 auto;
        height: 1px;
        background: linear-gradient(90deg, transparent, currentColor 35%, transparent 85%);
        transform: scaleX(0);
        transform-origin: left;
        animation: faq1-meter 5.8s ease-in-out infinite;
        opacity: 0.7;
      }
      .faq1-intro__tick {
        position: relative;
        z-index: 1;
        width: 0.55rem;
        height: 0.55rem;
        border-radius: 9999px;
        background: currentColor;
        box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.1);
        animation: faq1-tick 3.2s ease-in-out infinite;
      }
      .faq1-intro--light .faq1-intro__tick {
        box-shadow: 0 0 0 4px rgba(15, 15, 15, 0.08);
      }
      .faq1-fade {
        opacity: 0;
        transform: translate3d(0, 24px, 0);
        filter: blur(12px);
        transition: opacity 700ms ease, transform 700ms ease, filter 700ms ease;
      }
      .faq1-fade--ready {
        animation: faq1-fade-up 860ms cubic-bezier(0.22, 0.68, 0, 1) forwards;
      }
    `;
    document.head.appendChild(style);
    return () => { if (style.parentNode) style.remove(); };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      setIntroReady(true);
      return;
    }
    const frame = window.requestAnimationFrame(() => setIntroReady(true));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    let timeout;
    const onLoad = () => { timeout = window.setTimeout(() => setHasEntered(true), 120); };
    if (document.readyState === "complete") { onLoad(); } 
    else { window.addEventListener("load", onLoad, { once: true }); }
    return () => { window.removeEventListener("load", onLoad); window.clearTimeout(timeout); };
  }, []);

  const palette = useMemo(() => palettes[theme], [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const toggleQuestion = (index) => setActiveIndex((prev) => (prev === index ? -1 : index));

  const setCardGlow = (event) => {
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    target.style.setProperty("--faq-x", `${event.clientX - rect.left}px`);
    target.style.setProperty("--faq-y", `${event.clientY - rect.top}px`);
  };

  const clearCardGlow = (event) => {
    const target = event.currentTarget;
    target.style.removeProperty("--faq-x");
    target.style.removeProperty("--faq-y");
  };

  // Determine how many FAQs to show
  const displayedFaqs = isExpanded ? faqs : faqs.slice(0, 6);

  return (
    <div id="faq-section" className={`relative w-full overflow-hidden transition-colors duration-700 ${palette.surface} scroll-mt-20`}>
      <div className="absolute inset-0 z-0" style={{ background: palette.aurora }} />
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-80"
        style={{ background: palette.overlay, mixBlendMode: theme === "dark" ? "screen" : "multiply" }}
      />

      <section
        className={`relative z-10 mx-auto flex max-w-4xl flex-col gap-12 px-4 py-24 md:px-8 ${
          hasEntered ? "faq1-fade--ready" : "faq1-fade"
        }`}
      >
        <div
          className={`faq1-intro ${introReady ? "faq1-intro--active" : ""} ${
            theme === "light" ? "faq1-intro--light" : "faq1-intro--dark"
          }`}
        >
          <span className="faq1-intro__beam" aria-hidden="true" />
          <span className="faq1-intro__pulse" aria-hidden="true" />
          <span className="faq1-intro__label">System FAQs</span>
          <span className="faq1-intro__meter" aria-hidden="true" />
          <span className="faq1-intro__tick" aria-hidden="true" />
        </div>

        <header className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4">
            <h2 className={`text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] ${palette.heading}`}>
              Everything you need to know about securing your family.
            </h2>
            <p className={`max-w-xl text-lg font-medium ${palette.muted}`}>
              Clear, transparent answers on how KinTag works, community alerts, and data privacy.
            </p>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className={`relative inline-flex h-11 items-center gap-3 rounded-full border px-5 text-sm font-bold transition-colors duration-500 shadow-sm shrink-0 ${palette.toggleSurface} ${palette.toggle}`}
          >
            <span className="relative flex h-6 w-6 items-center justify-center">
              <span
                className={`pointer-events-none absolute inset-0 rounded-full border opacity-40 ${
                  theme === "dark" ? "border-white/30 animate-pulse" : "border-neutral-400/50"
                }`}
              />
              <span
                className={`h-3 w-3 rounded-full transition-all duration-500 ${
                  theme === "dark" ? "bg-white" : "bg-neutral-900"
                }`}
              />
            </span>
            {theme === "dark" ? "Night" : "Day"} mode
          </button>
        </header>

        <ul className="space-y-4">
          {displayedFaqs.map((item, index) => {
            const open = activeIndex === index;
            const panelId = `faq-panel-${index}`;
            const buttonId = `faq-trigger-${index}`;

            return (
              <li
                key={index}
                className={`group relative overflow-hidden rounded-[2rem] border backdrop-blur-xl transition-all duration-500 hover:-translate-y-0.5 focus-within:-translate-y-0.5 ${palette.border} ${palette.panel} ${palette.shadow}`}
                onMouseMove={setCardGlow}
                onMouseLeave={clearCardGlow}
              >
                <div
                  className={`pointer-events-none absolute inset-0 transition-opacity duration-500 ${
                    open ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                  style={{
                    background: `radial-gradient(240px circle at var(--faq-x, 50%) var(--faq-y, 50%), ${palette.glow}, transparent 70%)`,
                  }}
                />

                {/* 🌟 FIXED: Changed layout to put the icon on the right */}
                <button
                  type="button"
                  id={buttonId}
                  aria-controls={panelId}
                  aria-expanded={open}
                  onClick={() => toggleQuestion(index)}
                  className="relative flex w-full items-start justify-between gap-4 px-6 py-7 md:px-8 text-left transition-colors duration-300 outline-none"
                >
                  <div className="flex flex-1 flex-col gap-4 pr-2">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                      <h2 className={`text-lg font-extrabold leading-tight sm:text-xl ${palette.heading}`}>
                        {item.question}
                      </h2>
                      {item.meta && (
                        <span
                          className={`inline-flex w-fit items-center rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] transition-opacity duration-300 ${palette.border} ${theme === 'dark' ? 'text-amber-400 border-amber-400/30 bg-amber-400/10' : 'text-amber-600 border-amber-200 bg-amber-50'}`}
                        >
                          {item.meta}
                        </span>
                      )}
                    </div>

                    <div
                      id={panelId}
                      role="region"
                      aria-labelledby={buttonId}
                      className={`overflow-hidden text-sm md:text-base font-medium leading-relaxed transition-[max-height] duration-500 ease-in-out ${
                        open ? "max-h-64" : "max-h-0"
                      } ${palette.muted}`}
                    >
                      <p className="pr-2 mt-1">
                        {item.answer}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`relative flex h-10 w-10 md:h-12 md:w-12 shrink-0 items-center justify-center rounded-full border transition-all duration-500 group-hover:scale-105 ${palette.iconRing} ${palette.iconSurface}`}
                  >
                    <span
                      className={`pointer-events-none absolute inset-0 rounded-full border opacity-30 ${
                        palette.iconRing
                      } ${open ? "animate-ping" : ""}`}
                    />
                    <svg
                      className={`relative h-4 w-4 md:h-5 md:w-5 transition-transform duration-500 ${palette.icon} ${open ? "rotate-45" : ""}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 5v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                      <path d="M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* 🌟 FIXED: Interactive Show More / Hide Button */}
        {faqs.length > 6 && (
          <div className="flex justify-center mt-6">
            <button 
              onClick={() => {
                setIsExpanded(!isExpanded);
                if (isExpanded) {
                  document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
                }
              }} 
              className={`flex items-center gap-2 bg-gradient-to-r from-brandDark via-zinc-800 to-brandDark bg-[length:200%_auto] hover:bg-[position:right_center] text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:-translate-y-0.5 transition-all duration-500`}
            >
              <span>{isExpanded ? 'Hide FAQs' : `Read All ${faqs.length} FAQs`}</span>
              <ChevronDown size={18} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
