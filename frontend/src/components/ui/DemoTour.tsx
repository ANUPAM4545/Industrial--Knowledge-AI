import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, X, Sparkles, Check } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'

interface TourStep {
  id: string
  title: string
  content: string
  targetElementId: string
  position: 'top' | 'bottom' | 'left' | 'right'
}

const TOUR_STEPS: TourStep[] = [
  {
    id: 'step_1',
    title: 'Welcome to ForgeMind AI',
    content: 'Experience how ForgeMind transforms your industrial documents into actionable intelligence. Let\'s take a quick tour.',
    targetElementId: 'nav-dashboard',
    position: 'right'
  },
  {
    id: 'step_2',
    title: 'Knowledge Base',
    content: 'All your manuals, SOPs, and datasheets are securely indexed here. We\'ve pre-loaded some sample documents for you.',
    targetElementId: 'nav-knowledge',
    position: 'right'
  },
  {
    id: 'step_3',
    title: 'Ask Anything',
    content: 'Chat with your documents in real-time. Every answer includes exact source citations so you can verify the information.',
    targetElementId: 'nav-chat',
    position: 'right'
  },
  {
    id: 'step_4',
    title: 'System Telemetry',
    content: 'Monitor embedding health, RAG latency, and document processing queues directly from the observability dashboard.',
    targetElementId: 'nav-observability',
    position: 'right'
  }
]

export function DemoTour() {
  const { workspaceMode, tourState, setTourState } = useUIStore()
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null)

  const isActive = workspaceMode === 'demo' && tourState.isActive
  const stepIndex = tourState.currentStep
  const step = TOUR_STEPS[stepIndex]

  const updateTargetRect = () => {
    if (!isActive || !step) return
    const el = document.getElementById(step.targetElementId)
    if (el) {
      setTargetRect(el.getBoundingClientRect())
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }

  useEffect(() => {
    updateTargetRect()
    window.addEventListener('resize', updateTargetRect)
    window.addEventListener('scroll', updateTargetRect, true)
    return () => {
      window.removeEventListener('resize', updateTargetRect)
      window.removeEventListener('scroll', updateTargetRect, true)
    }
  }, [isActive, stepIndex, step?.targetElementId])

  if (!isActive || !step) return null

  const handleNext = () => {
    if (stepIndex < TOUR_STEPS.length - 1) {
      setTourState({ currentStep: stepIndex + 1 })
    } else {
      setTourState({ isActive: false, hasSeenTour: true })
    }
  }

  const handlePrev = () => {
    if (stepIndex > 0) {
      setTourState({ currentStep: stepIndex - 1 })
    }
  }

  const handleSkip = () => {
    setTourState({ isActive: false, hasSeenTour: true })
  }

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
      {/* Background Dimming (Spotlight effect) */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
      />

      {/* Spotlight Cutout */}
      {targetRect && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ 
            opacity: 1,
            top: targetRect.top - 8,
            left: targetRect.left - 8,
            width: targetRect.width + 16,
            height: targetRect.height + 16,
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute border-2 border-indigo-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.6)] pointer-events-none"
        />
      )}

      {/* Tooltip Card */}
      {targetRect && (
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="absolute pointer-events-auto w-80 glass-card bg-slate-900/90 border border-indigo-500/30 p-5 rounded-2xl shadow-2xl overflow-hidden"
            style={{
              top: step.position === 'bottom' ? targetRect.bottom + 20 : 
                   step.position === 'top' ? targetRect.top - 200 : 
                   targetRect.top,
              left: step.position === 'right' ? targetRect.right + 20 : 
                    step.position === 'left' ? targetRect.left - 340 : 
                    targetRect.left,
            }}
          >
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
            
            <div className="flex justify-between items-start mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                </div>
                <h3 className="font-bold text-white text-lg">{step.title}</h3>
              </div>
              <button 
                onClick={handleSkip}
                className="text-slate-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              {step.content}
            </p>
            
            <div className="flex items-center justify-between">
              {/* Progress Dots */}
              <div className="flex gap-1.5">
                {TOUR_STEPS.map((_, idx) => (
                  <div 
                    key={idx}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === stepIndex ? 'w-4 bg-indigo-500' : 'w-1.5 bg-slate-700'
                    }`}
                  />
                ))}
              </div>
              
              <div className="flex gap-2">
                {stepIndex > 0 && (
                  <button 
                    onClick={handlePrev}
                    className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                )}
                <button 
                  onClick={handleNext}
                  className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-[0_0_15px_rgba(79,70,229,0.3)] hover:shadow-[0_0_20px_rgba(79,70,229,0.5)]"
                >
                  {stepIndex === TOUR_STEPS.length - 1 ? (
                    <>Finish <Check className="w-4 h-4 ml-1" /></>
                  ) : (
                    <>Next <ChevronRight className="w-4 h-4 ml-1" /></>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}
