"use client"

import React from "react"
import { motion } from "framer-motion"

// A lightweight utility to merge tailwind classes since we removed the TS/lib dependency
const cn = (...classes) => classes.filter(Boolean).join(" ");

const ContainerScroll = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("relative w-full", className)}
      style={{ perspective: "1000px", ...props.style }}
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
      incrementZ = 10,
      children,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const y = index * incrementY
    const z = index * incrementZ

    return (
      <motion.div
        ref={ref}
        layout="position"
        style={{
          // 🌟 Added '15vh' so it sticks below your Glass Navbar, not at the absolute top of the screen!
          top: `calc(15vh + ${y}px)`, 
          zIndex: z,
          backfaceVisibility: "hidden",
          ...style,
        }}
        className={cn("sticky", className)}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

CardSticky.displayName = "CardSticky"

export { ContainerScroll, CardSticky }
