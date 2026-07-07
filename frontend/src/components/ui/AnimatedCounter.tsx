import React, { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  format?: (val: number) => string
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1.5,
  format = (val) => Math.round(val).toLocaleString(),
}) => {
  const [hasMounted, setHasMounted] = useState(false)
  const spring = useSpring(0, {
    stiffness: 100,
    damping: 30,
    mass: 1,
    duration: duration * 1000
  })

  const display = useTransform(spring, (current) => format(current))

  useEffect(() => {
    setHasMounted(true)
    spring.set(value)
  }, [value, spring])

  if (!hasMounted) return <span>{format(value)}</span>

  return <motion.span>{display}</motion.span>
}
