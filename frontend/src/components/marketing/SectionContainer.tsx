import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

interface SectionContainerProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(
  ({ children, className, noPadding = false, ...props }, ref) => {
    return (
      <section 
        ref={ref}
        className={cn(
          "relative z-10 w-full",
          !noPadding && "py-24 md:py-32 px-6",
          className
        )}
        {...props}
      >
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </section>
    )
  }
)
SectionContainer.displayName = 'SectionContainer'
