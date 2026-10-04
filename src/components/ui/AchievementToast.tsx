import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import type { Achievement } from '../../types'
import { useAchievementToasts } from '../../hooks/useAchievementToasts'
import { Mascot } from './Mascot'

/** Сколько секунд висит уведомление, прежде чем уехать само */
const LIFETIME_MS = 4500

/** Одно уведомление об открытом достижении */
function Toast({ achievement, onDone }: { achievement: Achievement; onDone: () => void }) {
  useEffect(() => {
    const id = window.setTimeout(onDone, LIFETIME_MS)
    return () => window.clearTimeout(id)
  }, [onDone])

  return (
    <motion.button
      onClick={onDone}
      layout
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className="glass flex w-72 items-center gap-3 rounded-2xl border-l-2 border-l-warn p-3 text-left"
    >
      <span className="flex shrink-0 flex-col items-center">
        <Mascot size={34} />
        <achievement.icon size={13} className="mt-0.5 text-accent" />
      </span>
      <span className="min-w-0">
        <span className="block text-[10px] font-bold uppercase tracking-wider text-warn">
          Новое достижение
        </span>
        <span className="block truncate text-sm font-extrabold">{achievement.title}</span>
        <span className="block truncate text-[11px] text-fg/50">
          {achievement.description}
        </span>
      </span>
    </motion.button>
  )
}

/** Стопка уведомлений в правом нижнем углу */
export function AchievementToasts() {
  const { queue, dismiss } = useAchievementToasts()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">
      <AnimatePresence>
        {queue.map((achievement) => (
          <div key={achievement.id} className="pointer-events-auto">
            <Toast achievement={achievement} onDone={() => dismiss(achievement.id)} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}
