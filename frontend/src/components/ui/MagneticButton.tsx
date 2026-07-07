import React, { useRef, useState } from 'react'
import { m, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MagneticButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  intensity?: number
  className?: string
  href?: string
}

export function MagneticButton({ 
  children, 
  intensity = 0.2, 
  className,
  href,
  ...props 
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const x = useMotionValue(0)
  const y = useMotionValue(0)

  const springConfig = { damping: 15, stiffness: 150, mass: 0.1 }
  const springX = useSpring(x, springConfig)
  const springY = useSpring(y, springConfig)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (shouldReduceMotion) return
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    // Calculate distance from center
    const distanceX = e.clientX - centerX
    const distanceY = e.clientY - centerY

    x.set(distanceX * intensity)
    y.set(distanceY * intensity)
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    x.set(0)
    y.set(0)
  }

  const handleMouseEnter = () => {
    setIsHovered(true)
  }

  const Component = href ? m.a : m.button
  
  return (
    <Component
      ref={ref as any}
      href={href as any}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{
        x: springX,
        y: springY,
      }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "relative overflow-hidden group transition-colors",
        className
      )}
      {...(props as any)}
    >
      {/* Ripple/Glow effect */}
      <m.div
        initial={false}
        animate={{
          scale: isHovered ? 1.5 : 0,
          opacity: isHovered ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="absolute inset-0 bg-white/10 dark:bg-white/5 rounded-full pointer-events-none blur-md z-0"
        style={{
          left: '50%',
          top: '50%',
          x: '-50%',
          y: '-50%',
          width: '120%',
          aspectRatio: '1',
        }}
      />
      
      <div className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </div>
    </Component>
  )
}
