import React, { useEffect, useState } from 'react'
import { m, useScroll, useTransform, useSpring } from 'framer-motion'

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { scrollY } = useScroll()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX,
        y: e.clientY
      })
    }
    
    // Throttle for performance
    let timeoutId: number | undefined
    const throttledMouseMove = (e: MouseEvent) => {
      if (timeoutId) return
      timeoutId = window.setTimeout(() => {
        handleMouseMove(e)
        timeoutId = undefined
      }, 50)
    }

    window.addEventListener('mousemove', throttledMouseMove)
    return () => {
      window.removeEventListener('mousemove', throttledMouseMove)
      clearTimeout(timeoutId)
    }
  }, [])

  // Mouse Parallax for Blobs
  const mouseX = useSpring(mousePosition.x, { stiffness: 50, damping: 20 })
  const mouseY = useSpring(mousePosition.y, { stiffness: 50, damping: 20 })
  
  const blob1X = useTransform(mouseX, [0, window.innerWidth], [-20, 20])
  const blob1Y = useTransform(mouseY, [0, window.innerHeight], [-20, 20])
  
  const blob2X = useTransform(mouseX, [0, window.innerWidth], [30, -30])
  const blob2Y = useTransform(mouseY, [0, window.innerHeight], [30, -30])

  const parallaxY = useTransform(scrollY, [0, 1000], [0, 200])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-[var(--bg-primary)]">
      
      {/* Noise Texture */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.15] mix-blend-overlay z-10" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] z-0" />

      {/* Aurora / Glowing Blobs */}
      <m.div style={{ y: parallaxY }} className="absolute inset-0 z-0">
        <m.div
          style={{ x: blob1X, y: blob1Y }}
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] bg-forge-500/20 rounded-full blur-[100px] mix-blend-screen"
        />
        
        <m.div
          style={{ x: blob2X, y: blob2Y }}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-forge-400/20 rounded-full blur-[100px] mix-blend-screen"
        />

        <m.div
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute top-[40%] left-[20%] w-[800px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] mix-blend-screen"
        />
      </m.div>
    </div>
  )
}
