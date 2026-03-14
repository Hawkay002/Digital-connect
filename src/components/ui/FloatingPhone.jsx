import { motion } from "framer-motion";

export default function FloatingPhone({ 
  iframeSrc, 
  facing = "left", 
  className = "", 
  scaleClass = "",
  iframeWidth = "375px",
  iframeHeight = "813px" 
}) {
  const rotation = facing === "left" 
    ? "rotateY(-20deg) rotateX(10deg)" 
    : "rotateY(20deg) rotateX(10deg)";
  
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        transform: rotation,
      }}
      className={`rounded-[2.25rem] md:rounded-[3rem] bg-amber-700 shadow-[0_30px_60px_rgba(0,0,0,0.3)] ${className}`}
    >
      <motion.div
        initial={{
          transform: "translateZ(8px) translateY(-2px)",
        }}
        // 🌟 Use whileInView instead of animate! 
        // This pauses the repeating floating animation automatically when off-screen!
        whileInView={{
          transform: "translateZ(32px) translateY(-8px)",
        }}
        viewport={{ once: false, margin: "200px" }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 2.5, 
          ease: "easeInOut",
        }}
        className="relative w-full h-full rounded-[2.25rem] md:rounded-[3rem] border-2 border-b-[6px] border-r-[6px] border-amber-600 border-l-amber-200 border-t-amber-200 bg-zinc-950 p-1.5 md:p-2"
      >
        <div className="relative z-0 h-full w-full overflow-hidden rounded-[1.85rem] md:rounded-[2.6rem] bg-zinc-100">
          <div 
            className={`absolute top-0 left-0 origin-top-left ${scaleClass}`}
            style={{ width: iframeWidth, height: iframeHeight }}
          >
             <iframe 
               src={iframeSrc} 
               className="w-full h-full border-0 [&::-webkit-scrollbar]:hidden" 
               style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} 
               title="Live Profile Preview" 
             />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
