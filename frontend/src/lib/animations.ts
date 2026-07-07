import { Variants } from 'framer-motion'

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 100, 
      duration: 0.6 
    } 
  }
}

export const fadeDown: Variants = {
  hidden: { opacity: 0, y: -30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      damping: 25, 
      stiffness: 100, 
      duration: 0.6 
    } 
  }
}

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

export const cardHover: Variants = {
  rest: { 
    scale: 1,
    y: 0,
    boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)"
  },
  hover: { 
    scale: 1.02,
    y: -5,
    boxShadow: "0px 20px 40px rgba(91, 110, 244, 0.1)",
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 20
    }
  }
}

export const textReveal: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(10px)" },
  visible: (custom: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      delay: custom * 0.05,
      type: "spring",
      damping: 20,
      stiffness: 100
    }
  })
}

// Ensure 60fps performance by using only GPU-accelerated properties
export const floating: Variants = {
  rest: { y: 0 },
  floating: {
    y: [0, -10, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}
