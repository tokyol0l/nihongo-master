import { motion } from 'framer-motion'
import { useMemo } from 'react'

/** Описание одного лепестка */
interface Petal {
  id: number
  left: number
  size: number
  duration: number
  delay: number
  drift: number
  opacity: number
}

/** Сколько лепестков летает по экрану */
const PETAL_COUNT = 16

/** Плавающие лепестки сакуры на фоне. Всегда розовые — иначе это уже не сакура */
export function SakuraBackground() {
  // Параметры считаем один раз, чтобы лепестки не «прыгали» при перерисовке
  const petals = useMemo<Petal[]>(
    () =>
      Array.from({ length: PETAL_COUNT }, (_, id) => ({
        id,
        left: Math.random() * 100,
        size: 8 + Math.random() * 12,
        duration: 14 + Math.random() * 14,
        delay: Math.random() * 14,
        drift: (Math.random() - 0.5) * 160,
        opacity: 0.18 + Math.random() * 0.3,
      })),
    [],
  )

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      {petals.map((petal) => (
        <motion.div
          key={petal.id}
          className="absolute rounded-[100%_0_100%_0]"
          style={{
            left: `${petal.left}%`,
            background: petal.id % 2 === 0 ? '#ff8fb1' : '#ffc0d4',
            width: petal.size,
            height: petal.size,
            opacity: petal.opacity,
          }}
          initial={{ y: -60, rotate: 0 }}
          animate={{
            y: ['-10vh', '110vh'],
            x: [0, petal.drift, 0],
            rotate: [0, 360],
          }}
          transition={{
            duration: petal.duration,
            delay: petal.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  )
}
