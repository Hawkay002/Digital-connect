"use client";

import React from "react";

export default function ThreeDMarquee({
  items,
  className = "",
  cols = 4, 
}) {
  // 1. Distribute your feature items evenly across the columns
  const columns = Array.from({ length: cols }, () => []);
  items.forEach((item, idx) => {
    columns[idx % cols].push(item);
  });

  // 2. Duplicate EXACTLY once (2 sets total). This makes the 50% translation math flawless.
  const duplicatedColumns = columns.map(col => [...col, ...col]);

  return (
    <section
      className={`mx-auto block h-[500px] md:h-[700px] w-full overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)] ${className}`}
    >
      {/* 🌟 INJECTED HARDWARE-ACCELERATED CSS ANIMATIONS TO FIX REACT JS LAG */}
      <style>{`
        @keyframes marquee-up {
          from { transform: translateY(0%); }
          to { transform: translateY(-50%); }
        }
        @keyframes marquee-down {
          from { transform: translateY(-50%); }
          to { transform: translateY(0%); }
        }
        .animate-marquee-up {
          animation: marquee-up 60s linear infinite;
          will-change: transform;
        }
        .animate-marquee-down {
          animation: marquee-down 60s linear infinite;
          will-change: transform;
        }
        .pause-on-hover:hover .animate-marquee-up,
        .pause-on-hover:hover .animate-marquee-down {
          animation-play-state: paused;
        }
      `}</style>

      <div
        className="flex w-full h-full items-center justify-center pause-on-hover"
        style={{
          transform: "rotateX(55deg) rotateY(0deg) rotateZ(45deg)",
          transformStyle: "preserve-3d",
        }}
      >
        <div className="w-[200%] md:w-[120%] overflow-visible scale-[1.1] md:scale-100">
          {/* Removed the Flex Gap. Relying solely on padding to fix the loop jump. */}
          <div className="relative flex justify-center transform">
            
            {duplicatedColumns.map((itemsInGroup, idx) => (
              <div
                key={`column-${idx}`}
                className={`flex flex-col items-center px-3 md:px-4 relative ${idx % 2 === 0 ? 'animate-marquee-up' : 'animate-marquee-down'}`}
              >
                {itemsInGroup.map((item, itemIdx) => (
                  
                  // 🌟 Padding-bottom instead of gap makes the 50% translation mathematically perfect
                  <div key={`item-${idx}-${itemIdx}`} className="pb-6 md:pb-8 shrink-0">
                    
                    <div
                      className="relative w-[260px] md:w-[300px] bg-white/90 backdrop-blur-md rounded-3xl p-8 border border-zinc-200 shadow-[0_20px_40px_rgba(0,0,0,0.06)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] transition-all hover:scale-105 hover:-translate-y-2 duration-300 z-10 flex flex-col items-start gap-4 cursor-pointer h-full"
                    >
                      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-300 to-transparent"></div>
                      
                      <div className="w-16 h-16 rounded-[1.2rem] bg-zinc-50 border border-zinc-100 flex items-center justify-center shadow-inner mb-2 shrink-0">
                        {item.icon}
                      </div>
                      
                      <h3 className="text-xl font-extrabold text-brandDark leading-tight">{item.title}</h3>
                      <p className="text-sm text-zinc-500 font-medium leading-relaxed">{item.description}</p>
                      
                    </div>
                  </div>

                ))}
              </div>
            ))}

          </div>
        </div>
      </div>
    </section>
  );
}
