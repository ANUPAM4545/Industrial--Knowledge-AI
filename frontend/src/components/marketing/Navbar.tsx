import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { m, useScroll, useTransform, useMotionValueEvent, AnimatePresence } from 'framer-motion'
import { Zap, Menu, X, Code } from 'lucide-react'
import { ThemeToggle } from '../ui/ThemeToggle'
import { MagneticButton } from '../ui/MagneticButton'

export function Navbar() {
  const { scrollY } = useScroll()
  const location = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Floating shrink effect
  const navWidth = useTransform(scrollY, [0, 100], ['100%', '80%'])
  const navY = useTransform(scrollY, [0, 100], [0, 20])
  const navBorderRadius = useTransform(scrollY, [0, 100], ['0px', '24px'])
  const navBg = useTransform(scrollY, [0, 100], ['rgba(var(--bg-primary-rgb), 0)', 'var(--bg-glass)'])
  const navBorder = useTransform(scrollY, [0, 100], ['rgba(255,255,255,0)', 'var(--border-subtle)'])
  const navShadow = useTransform(scrollY, [0, 100], ['none', '0 10px 40px -10px rgba(0,0,0,0.1)'])

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
  })

  const navLinks = ['Features', 'Workflow', 'Use Cases', 'Pricing', 'Docs']

  return (
    <>
      <m.nav 
        style={{
          width: navWidth,
          y: navY,
          x: '-50%',
          borderRadius: navBorderRadius,
          backgroundColor: navBg,
          borderColor: navBorder,
          boxShadow: navShadow,
          backdropFilter: 'blur(16px)'
        }}
        className="fixed top-0 left-1/2 z-50 border transition-colors duration-300"
      >
        <div className="px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link to="/" className="flex items-center gap-2 group">
              <m.div 
                whileHover={{ rotate: 15, scale: 1.1 }}
                className="w-8 h-8 rounded-lg bg-forge-500 flex items-center justify-center shadow-lg shadow-forge-500/20 transition-transform"
              >
                <Zap className="w-4 h-4 text-white" />
              </m.div>
              <span className="font-bold text-lg text-[var(--text-primary)] tracking-tight">ForgeMind AI</span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-6 mr-4 relative">
              {navLinks.map(item => {
                const targetId = item.toLowerCase().replace(' ', '-')
                return (
                  <Link 
                    key={item} 
                    to={location.pathname === '/' ? `#${targetId}` : `/#${targetId}`}
                    className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] relative group py-1"
                  >
                    {item}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-forge-500 group-hover:w-full transition-all duration-300 ease-out" />
                  </Link>
                )
              })}
            </div>

            <div className="w-px h-6 bg-[var(--border-subtle)]" />
            
            <a href="https://github.com" target="_blank" rel="noreferrer" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">
              <Code className="w-5 h-5" />
            </a>

            <ThemeToggle />

            <Link to="/login" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-sm font-medium transition-colors ml-2">
              Sign In
            </Link>
            
            <Link to="/register">
              <MagneticButton className="px-5 py-2 bg-[var(--text-primary)] text-[var(--bg-primary)] rounded-lg text-sm font-bold shadow-lg">
                Launch Platform
              </MagneticButton>
            </Link>
          </div>

          {/* Mobile Nav Toggle */}
          <button 
            className="md:hidden p-2 text-[var(--text-primary)]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </m.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <m.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[var(--bg-primary)]/95 backdrop-blur-xl md:hidden pt-24 px-6 flex flex-col"
          >
            {navLinks.map((item, i) => {
              const targetId = item.toLowerCase().replace(' ', '-')
              return (
                <Link
                  key={item}
                  to={location.pathname === '/' ? `#${targetId}` : `/#${targetId}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <m.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-2xl font-bold text-[var(--text-primary)] py-4 border-b border-[var(--border-subtle)]"
                  >
                    {item}
                  </m.div>
                </Link>
              )
            })}
            
            <div className="mt-8 flex items-center justify-between">
              <ThemeToggle />
              <Link to="/login" className="text-[var(--text-primary)] font-semibold">Sign In</Link>
            </div>
            
            <Link to="/register" className="mt-8 w-full text-center py-4 bg-forge-500 text-white rounded-xl font-bold shadow-lg shadow-forge-500/25">
              Launch Platform
            </Link>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}
