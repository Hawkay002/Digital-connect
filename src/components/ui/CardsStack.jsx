"use client"

import React from "react"
import { motion } from "framer-motion"

const ContainerScroll = React.forwardRef(({ children, className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      // 🌟 FIX: Removed perspective! Transforms on parents break sticky positioning.
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
      <motion.div
        ref={ref}
        // 🌟 FIX: Added smooth entry animations and removed buggy layout constraints
        initial={{ opacity: 0, y: 60 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        style={{
          // 🌟 Calculates the exact top offset so they stack neatly under the navbar like a deck of cards
          top: `calc(15vh + ${index * incrementY}px)`, 
          zIndex: index,
          ...style,
        }}
        className={`sticky ${className || ""}`}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)

CardSticky.displayName = "CardSticky"

export { ContainerScroll, CardSticky }
