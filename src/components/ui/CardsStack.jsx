"use client"

import React from "react"

const ContainerScroll = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`relative w-full ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  )
})
ContainerScroll.displayName = "ContainerScroll"

const CardSticky = React.forwardRef(
  (
    {
      index,
      incrementY = 20,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    return (
      // WRAPPER 1: Pure CSS sticky positioning
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
        {/*
          FIX: Removed Framer Motion's whileInView from every card.
          Previously, 20 cards × 1 IntersectionObserver + Framer animation engine
          = 20+ observers firing simultaneously during fast scroll, which is what
          caused the freezing on low-end phones.

          Replaced with a pure CSS animation using @keyframes fade-up-card and
          animation-fill-mode: both so the card stays visible after animating in.
          CSS animations are handled entirely on the compositor thread — no JS involved.

          FIX: Removed blur from the ScrollReveal in Home.jsx (see that file).
          This wrapper intentionally has NO filter properties.
        */}
        <div
          className="w-full h-full card-stack-reveal"
          style={{
            // Promote to its own GPU layer ahead of time so sticky positioning
            // doesn't trigger full-page repaints as it sticks.
            willChange: "transform",
          }}
        >
          {children}
        </div>
      </div>
    )
  }
)

CardSticky.displayName = "CardSticky"

// Inject the CSS animation once into the document head.
// This runs only in the browser and only once.
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
    }
    /* Fallback for browsers that don't support animation-timeline */
    @supports not (animation-timeline: view()) {
      .card-stack-reveal {
        animation: fade-up-card 0.5s cubic-bezier(0.22, 0.68, 0, 1) both;
        animation-play-state: running;
      }
    }
  `;
  document.head.appendChild(style);
}

export { ContainerScroll, CardSticky }
