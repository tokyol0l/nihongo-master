import { motion } from 'framer-motion'

interface ProgressBarProps {
  /** Значение от 0 до 100 */
  value: number
  /** Подпись слева */
  label?: string
  /** Показывать процент справа */
  showValue?: boolean
}

/** Тонкая полоска прогресса с градиентом */
export function ProgressBar({ value, label, showValue = true }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value))

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-2 flex items-baseline justify-between text-xs text-fg/60">
          {label && <span>{label}</span>}
          {showValue && <span className="font-bold text-fg/85">{clamped}%</span>}
        </div>
      )}
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-fg/10">
        <motion.div
          className="h-full rounded-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${clamped}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  )
}
