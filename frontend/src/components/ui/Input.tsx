import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  icon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, rightElement, onFocus, onBlur, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    // Check if the input has a value to keep the label floating
    const hasValue = props.value !== undefined && props.value !== ''

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      onFocus?.(e)
    }

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      onBlur?.(e)
    }

    return (
      <div className={cn("relative w-full", className)}>
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 z-10 pointer-events-none">
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn(
              "block w-full rounded-xl bg-slate-900/50 border border-slate-700/50 text-white placeholder-transparent focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50 transition-all duration-200 outline-none peer",
              icon ? "pl-10" : "pl-4",
              rightElement ? "pr-10" : "pr-4",
              "pt-6 pb-2", // extra padding top for the floating label
              error && "border-red-500 focus:border-red-500 focus:ring-red-500/50",
              className
            )}
            placeholder={label} // used for peer-placeholder-shown logic in css
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          <motion.label
            initial={false}
            animate={{
              y: isFocused || hasValue || props.defaultValue ? -12 : 0,
              scale: isFocused || hasValue || props.defaultValue ? 0.75 : 1,
              opacity: isFocused || hasValue || props.defaultValue ? 0.8 : 0.5
            }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={cn(
              "absolute text-sm text-slate-300 pointer-events-none origin-[0]",
              icon ? "left-10" : "left-4",
              "top-4" // center when not floating
            )}
          >
            {label}
          </motion.label>

          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {rightElement}
            </div>
          )}
        </div>
        
        {/* Error Message with Animation */}
        <div className="h-5 mt-1 overflow-hidden">
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: error ? 1 : 0, y: error ? 0 : -10 }}
            className="text-xs text-red-400 font-medium"
          >
            {error}
          </motion.p>
        </div>
      </div>
    )
  }
)

Input.displayName = 'Input'
