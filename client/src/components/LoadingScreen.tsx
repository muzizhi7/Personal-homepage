import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

export default function LoadingScreen() {
  const [gone, setGone] = useState(false)
  useEffect(() => {
    const id = setTimeout(() => setGone(true), 900)
    return () => clearTimeout(id)
  }, [])
  if (gone) return null
  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-surface"
      animate={{ opacity: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      onAnimationComplete={() => setGone(true)}
    >
      <motion.div
        className="h-10 w-10 rounded-full"
        style={{
          background: 'conic-gradient(from 0deg, var(--accent), var(--accent-2), var(--accent))',
        }}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
      />
    </motion.div>
  )
}
