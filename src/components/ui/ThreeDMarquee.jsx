"use client";

import React, { useEffect, useRef, useState } from "react";

export default function ThreeDMarquee({
  items,
  className = "",
}) {
  const sectionRef = useRef(null);
  const [isPaused, setIsPaused] = useState(false);

  // 🌟 Smart Observer: Pauses the CSS animation when out of view to save battery/GPU
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { setIsPaused(!entry.isIntersecting); },
      { rootMargin: "300px" } 
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // 🌟 The Flawless Loop Math:
  // Duplicate the entire array exactly once. 
  // Translating by -50% will make item #21 perfectly replace item #1 seamlessly.
  const duplicatedItems = [...items, ...items];

  return (
    <section
      ref={sectionRef}
      // Uses a horizontal gradient mask to smoothly fade the cards out at the left/right edges
      className={`mx-auto block w-full py-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] ${className}`}
    >
      {/* 🌟 2D Hardware-Accelerated Keyframes (Virtually 0 GPU overhead) */}
      <style>{`
        @keyframes scroll-horizontal {
          from { transform: translate3d(0, 0, 0); }
          to { transform: translate3d(-50%, 0, 0); }
        }
        .animate-scroll-horizontal {
          animation: scroll-horizontal 60s linear infinite;
          will-change: transform;
        }
        .pause-animations .animate-scroll-horizontal,
        .pause-on-hover:hover .animate-scroll-horizontal {
          animation-play-state: paused !important;
        }
      `}</style>

      <div className={`flex w-full items-center pause-on-hover ${isPaused ? 'pause-animations' : ''}`}>
        
        {/* w-max ensures the container grows to fit all cards, enabling the -50% transform */}
        <div className="flex w-max animate-scroll-horizontal">
          {duplicatedItems.map((item, idx) => (
            
            // We use px-3 instead of flex 'gap' so the -50% loop math has zero jumping
            <div key={`item-${idx}`} className="px-3 md:px-4 shrink-0 py-4">
              
              {/* Your exact original card design! */}
              <div className="relative w-[280px] md:w-[320px] h-[280px] bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-zinc-200 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] transition-all hover:-translate-y-2 duration-300 z-10 flex flex-col items-start gap-4 cursor-pointer overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent"></div>
                
                <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-inner shrink-0">
                  {item.icon}
                </div>
                
                <h3 className="text-xl font-extrabold text-brandDark leading-tight">{item.title}</h3>
                <p className="text-sm text-zinc-500 font-medium leading-relaxed">{item.description}</p>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
