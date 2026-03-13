import { motion } from "framer-motion";

export default function FloatingPhone({ iframeSrc, facing = "left", className = "", scaleClass = "" }) {
  // Automatically handles the 3D rotation based on the facing direction
  const rotation = facing === "left" 
    ? "rotateY(-20deg) rotateX(10deg)" 
    : "rotateY(20deg) rotateX(10deg)";
  
  return (
    <div
      style={{
        transformStyle: "preserve-3d",
        transform: rotation,
      }}
      className={`rounded-[2.25rem] md:rounded-[3rem] bg-zinc-800 shadow-[0_30px_60px_rgba(0,0,0,0.4)] ${className}`}
    >
      <motion.div
        initial={{
          transform: "translateZ(8px) translateY(-2px)",
        }}
        animate={{
          transform: "translateZ(32px) translateY(-8px)",
        }}
        transition={{
          repeat: Infinity,
          repeatType: "mirror",
          duration: 2.5, // Smooth floating duration
          ease: "easeInOut",
        }}
        // Creates the 3D metallic edge styling around the phone
        className="relative w-full h-full rounded-[2.25rem] md:rounded-[3rem] border-2 border-b-[6px] border-r-[6px] border-zinc-950 border-l-zinc-600 border-t-zinc-600 bg-zinc-900 p-1 md:p-1.5"
      >
        <div className="relative z-0 h-full w-full overflow-hidden rounded-[1.85rem] md:rounded-[2.6rem] bg-zinc-100">
          
          {/* Iframe Scaling Container */}
          <div className={`absolute top-0 left-0 w-[375px] h-[813px] origin-top-left ${scaleClass}`}>
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
