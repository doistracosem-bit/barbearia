import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.19, 1, 0.22, 1]

export default function Reveal({ children, className = '', delay = 0, as = 'div', ...props }) {
  const reduced = useReducedMotion()

  if (reduced) {
    const Tag = as
    return (
      <Tag className={className} {...props}>
        {children}
      </Tag>
    )
  }

  const MotionTag = motion[as] ?? motion(as)

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.8, ease: EASE, delay }}
      {...props}
    >
      {children}
    </MotionTag>
  )
}
