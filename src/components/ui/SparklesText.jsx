import { useEffect, useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEFAULT_COLORS = ["#FBBF24", "#34D399", "#ffffff"]; 

const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;

const useRandomInterval = (callback, minDelay, maxDelay) => {
  const timeoutId = useRef(null);
  const savedCallback = useRef(callback);
  
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  useEffect(() => {
    let isEnabled = typeof minDelay === 'number' && typeof maxDelay === 'number';
    if (isEnabled) {
      const handleTick = () => {
        const nextTickAt = random(minDelay, maxDelay);
        timeoutId.current = window.setTimeout(() => {
          savedCallback.current();
          handleTick();
        }, nextTickAt);
      };
      handleTick();
    }
    return () => window.clearTimeout(timeoutId.current);
  }, [minDelay, maxDelay]);
  
  return useCallback(() => window.clearTimeout(timeoutId.current), []);
};

const generateSparkle = () => {
  const side = Math.floor(Math.random() * 4); 
  let top, left;
  
  if (side === 0) { 
    top = random(-20, 5);
    left = random(-10, 110);
  } else if (side === 1) { 
    top = random(-10, 110);
    left = random(90, 115);
  } else if (side === 2) { 
    top = random(85, 115);
    left = random(-10, 110);
  } else { 
    top = random(-10, 110);
    left = random(-15, 5);
  }

  return {
    id: String(Math.random()),
    createdAt: Date.now(),
    color: DEFAULT_COLORS[Math.floor(Math.random() * DEFAULT_COLORS.length)],
    size: random(14, 24),
    style: {
      top: top + "%",
      left: left + "%",
      zIndex: 2,
      position: "absolute",
      pointerEvents: "none"
    },
  };
};

const Sparkle = ({ size, color, style }) => (
  <motion.svg
    width={size} height={size} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg"
    style={style}
    initial={{ scale: 0, rotate: -90, opacity: 0 }}
    animate={{ scale: 1, rotate: 0, opacity: 1 }}
    exit={{ scale: 0, rotate: 90, opacity: 0 }}
    transition={{ duration: 0.8, ease: "easeInOut" }}
  >
    <path
      d="M80 0C80 0 84.2846 41.2925 101.496 58.504C118.707 75.7154 160 80 160 80C160 80 118.707 84.2846 101.496 101.496C84.2846 118.707 80 160 80 160C80 160 75.7154 118.707 58.504 101.496C41.2925 84.2846 0 80 0 80C0 80 41.2925 75.7154 58.504 58.504C75.7154 41.2925 80 0 80 0Z"
      fill={color} stroke={color} strokeWidth="12" strokeLinejoin="round" strokeLinecap="round"
    />
  </motion.svg>
);

export default function SparklesText({ text, className = "" }) {
  const [sparkles, setSparkles] = useState([]);
  const containerRef = useRef(null);
  const inViewRef = useRef(true);

  // 🌟 Smart Observer: Pauses the JS Interval array updates when scrolled out of view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { inViewRef.current = entry.isIntersecting; },
      { rootMargin: "100px" } 
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setSparkles([generateSparkle(), generateSparkle(), generateSparkle()]);
  }, []);

  useRandomInterval(
    () => {
      // 🌟 If off-screen, completely skip generating and filtering arrays!
      if (!inViewRef.current) return; 

      const sparkle = generateSparkle();
      const now = Date.now();
      setSparkles((current) => {
        const nextSparkles = current.filter(sp => now - sp.createdAt < 800);
        nextSparkles.push(sparkle);
        return nextSparkles;
      });
    },
    100, 
    400  
  );

  return (
    <span ref={containerRef} className={`relative inline-flex items-center justify-center px-4 ${className}`}>
      <AnimatePresence>
        {sparkles.map((sparkle) => (
          <Sparkle key={sparkle.id} {...sparkle} />
        ))}
      </AnimatePresence>
      <span className="relative z-10">{text}</span>
    </span>
  );
}
