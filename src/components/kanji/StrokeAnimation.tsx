import { motion } from 'framer-motion'
import { kanjiStrokes } from '../../data/kanjiStrokes'

/** Сколько секунд занимает один штрих в анимации */
const STROKE_DURATION = 0.5

interface StrokeAnimationProps {
  char: string
  /** Ключ меняется, чтобы перезапустить анимацию сначала */
  playKey: number
  size?: number
}

/**
 * Показывает, как рисуется кандзи: штрихи появляются по одному в
 * правильном порядке письма. Данные — из открытого датасета KanjiVG,
 * без изменений.
 */
export function StrokeAnimation({ char, playKey, size = 220 }: StrokeAnimationProps) {
  const data = kanjiStrokes[char]

  if (!data) {
    return (
      <div
        className="jp flex items-center justify-center text-fg/30"
        style={{ width: size, height: size }}
      >
        {char}
      </div>
    )
  }

  return (
    <svg viewBox={data.viewbox} width={size} height={size}>
      {/* Направляющие линии — крест по центру, как в прописях */}
      <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--color-line)" strokeWidth={0.6} />
      <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--color-line)" strokeWidth={0.6} />

      {/* Полупрозрачный контур всего иероглифа — ориентир */}
      {data.strokes.map((d, i) => (
        <path
          key={`ghost-${i}`}
          d={d}
          fill="none"
          stroke="var(--color-fg)"
          strokeOpacity={0.12}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}

      {/* Штрихи, которые дорисовываются по очереди */}
      {data.strokes.map((d, i) => (
        <motion.path
          key={`${playKey}-${i}`}
          d={d}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={3.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          style={{ strokeDasharray: 1 }}
          initial={{ strokeDashoffset: 1 }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: STROKE_DURATION,
            delay: i * STROKE_DURATION,
            ease: 'easeInOut',
          }}
        />
      ))}

      {/* Номера штрихов */}
      {data.starts.map(([x, y], i) => (
        <motion.text
          key={`n-${playKey}-${i}`}
          x={x - 4}
          y={y - 3}
          fontSize={7}
          fill="var(--color-accent)"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.85 }}
          transition={{ delay: i * STROKE_DURATION, duration: 0.15 }}
        >
          {i + 1}
        </motion.text>
      ))}
    </svg>
  )
}
