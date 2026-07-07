import React from 'react'
import { m, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

const STATS = [
  { label: 'Documents Indexed', value: 145000, suffix: '+' },
  { label: 'Vectors Generated', value: 2.4, suffix: 'M' },
  { label: 'Avg. Latency', value: 94, suffix: 'ms' },
  { label: 'System Uptime', value: 99.99, suffix: '%' },
]

function AnimatedCounter({ from, to, duration = 2 }: { from: number, to: number, duration?: number }) {
  const [count, setCount] = useState(from)
  const nodeRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(nodeRef, { once: true })

  useEffect(() => {
    if (inView) {
      let startTime: number | null = null
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
        
        // easeOutQuart
        const ease = 1 - Math.pow(1 - progress, 4)
        setCount(from + (to - from) * ease)
        
        if (progress < 1) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)
    }
  }, [inView, from, to, duration])

  // Format to 1 decimal if float, otherwise integer
  const formatted = to % 1 !== 0 ? count.toFixed(1) : Math.floor(count)

  return <span ref={nodeRef}>{formatted}</span>
}

export function PlatformOverview() {
  return (
    <section className="py-20 border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative z-10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center">
          {STATS.map((stat, i) => (
            <m.div 
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="space-y-2"
            >
              <div className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400">
                <AnimatedCounter from={0} to={stat.value} />{stat.suffix}
              </div>
              <div className="text-sm font-medium text-[var(--text-muted)] uppercase tracking-wider">
                {stat.label}
              </div>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  )
}
