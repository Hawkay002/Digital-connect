"use client"

import React, { useEffect, useRef } from "react"

// Inject the CSS animation once into the document head.
if (typeof document !== "undefined" && !document.getElementById("card-stack-styles")) {
  const style = document.createElement("style");
  style.id = "card-stack-styles";
  style.innerHTML = `
    @keyframes fade-up-card {
      from { opacity: 0; transform: translate3d(0, 40px, 0); }
      to   { opacity: 1; transform: translate3d(0, 0, 0); }
    }
    .card-stack-reveal {
      animation: fade-up-card 0.5s cubic-bezier(0.22, 0.68, 0, 1) both;
      animation-timeline: view();
      animation-range: entry 0% entry 30%;
      will-change: transform;
    }
    /* Pause the sticky will-change promotion when the whole section is off-screen.
       This releases the GPU layer entirely instead of keeping 20 composited
       layers alive while the user is reading a completely different section. */
    .card-stack-section--hidden .card-stack-reveal {
      will-change: auto;
      animation-play-state: paused;
    }
    /* Fallback for browsers without animation-timeline */
    @supports not (animation-timeline: view()) {
      .card-stack-reveal {
        animation: fade-up-card 0.5s cubic-bezier(0.22, 0.68, 0, 1) both;
      }
    }
  `;
  document.head.appendChild(style);
}

// ContainerScroll now observes itself and adds/removes the hidden class
// so all child card animations pause when the section leaves the viewport.
const ContainerScroll = React.forwardRef(({ children, className, ...props }, ref) => {
  const innerRef = useRef(null);
  const combinedRef = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  useEffect(() => {
    const el = innerRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Add class when fully off-screen, remove when any part is visible
        el.classList.toggle('card-stack-section--hidden', !entry.isIntersecting);
      },
      { rootMargin: "100px" } // 100px buffer so pause happens just after leaving view
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={combinedRef}
      className={`relative w-full ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
});
ContainerScroll.displayName = "ContainerScroll";

const CardSticky = React.forwardRef(
  ({ index, incrementY = 20, children, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={`sticky ${className || ""}`}
        style={{
          top: `calc(15vh + ${index * incrementY}px)`,
          zIndex: index,
          ...style,
        }}
        {...props}
      >
        <div className="w-full h-full card-stack-reveal">
          {children}
        </div>
      </div>
    );
  }
);
CardSticky.displayName = "CardSticky";

export { ContainerScroll, CardSticky };
