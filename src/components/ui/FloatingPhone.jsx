import React from "react";

export default function FloatingPhone({ 
  imageSrc, 
  imageAlt = "KinTag Profile Preview",
  facing = "left", 
  className = "", 
}) {
  const rotation = facing === "left" 
    ? "rotateY(-20deg) rotateX(10deg)" 
    : "rotateY(20deg) rotateX(10deg)";
    
  const borderThickness = facing === "left"
    ? "border-b-[6px] border-r-[6px] border-l-[2px] border-t-[2px] border-orange-500 border-l-orange-300 border-t-orange-300"
    : "border-b-[6px] border-l-[6px] border-r-[2px] border-t-[2px] border-orange-500 border-r-orange-300 border-t-orange-300";
  
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        transform: rotation,
      }}
      className={`relative rounded-[2.25rem] md:rounded-[3rem] bg-orange-600 shadow-[0_20px_40px_rgba(0,0,0,0.25)] ${className}`}
    >
      <div
        className={`relative w-full h-full rounded-[2.25rem] md:rounded-[3rem] bg-zinc-950 p-1.5 md:p-2 ${borderThickness}`}
      >
        <div className="relative z-0 h-full w-full overflow-hidden rounded-[1.85rem] md:rounded-[2.6rem] bg-zinc-100">
           {/* 🌟 IFRAMES REMOVED: Using an optimized static image for massive performance gains */}
           <img 
             src={imageSrc} 
             alt={imageAlt}
             className="w-full h-full object-cover pointer-events-none select-none"
             loading="lazy"
           />
        </div>
      </div>
    </div>
  );
}
