import { motion } from 'framer-motion'
import clsx from 'clsx'
import type { ReactNode } from 'react'
import { playClick } from '../../utils/sound'

/** Варианты оформления кнопки */
export type ButtonVariant = 'primary' | 'success' | 'warning' | 'danger' | 'ghost'

interface ButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: ButtonVariant
  /** Растянуть на всю ширину */
  full?: boolean
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
  /** Бегущий блик — только для главной кнопки */
  shimmer?: boolean
}

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-white hover:opacity-90',
  success: 'bg-ok text-white hover:opacity-90',
  warning: 'bg-warn text-white hover:opacity-90',
  danger: 'bg-bad text-white hover:opacity-90',
  ghost: 'border border-line bg-surface text-fg/80 hover:bg-surface-2 hover:text-fg',
}

/** Кнопка с пружинкой при нажатии и мягким свечением */
export function Button({
  children,
  onClick,
  variant = 'primary',
  full = false,
  disabled = false,
  type = 'button',
  className,
  shimmer = false,
}: ButtonProps) {
  return (
    <motion.button
      type={type}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 22 }}
      onClick={() => {
        if (disabled) return
        playClick()
        onClick?.()
      }}
      className={clsx(
        'relative rounded-lg px-4 py-2.5 text-sm font-semibold',
        'transition-colors select-none cursor-pointer',
        variants[variant],
        full && 'w-full',
        disabled && 'opacity-40 cursor-not-allowed',
        shimmer && 'shimmer',
        className,
      )}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">{children}</span>
    </motion.button>
  )
}
