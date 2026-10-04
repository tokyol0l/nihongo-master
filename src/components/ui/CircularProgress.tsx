import { motion } from 'framer-motion'

interface CircularProgressProps {
  /** Значение от 0 до 100 */
  value: number
  /** Диаметр в пикселях */
  size?: number
  /** Толщина кольца */
  thickness?: number
  /** Подпись под числом */
  caption?: string
}

/** Круговой прогресс-бар с градиентной обводкой */
export function CircularProgress({
  value,
  size = 140,
  thickness = 10,
  caption,
}: CircularProgressProps) {
  const clamped = Math.max(0, Math.min(100, value))
  const radius = (size - thickness) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped / 100)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
          stroke="#303039"
          fill="none"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={thickness}
          stroke="#e5484d"
          strokeLinecap="round"
          fill="none"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-extrabold">{clamped}%</span>
        {caption && <span className="mt-0.5 text-[11px] text-fg/55">{caption}</span>}
      </div>
    </div>
  )
}
