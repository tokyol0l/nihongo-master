import { useEffect, useRef, useState } from 'react'
import { achievements } from '../data/achievements'
import { useProgressStore } from '../store/useProgressStore'
import { useStats } from './useStats'
import { playUnlock } from '../utils/sound'
import type { Achievement } from '../types'

/**
 * Следит за статистикой и сообщает, когда открылось новое достижение.
 * При первом запуске просто запоминает уже выполненные — чтобы не сыпать
 * уведомлениями о том, что было заработано раньше.
 */
export function useAchievementToasts() {
  const unlocked = useProgressStore((s) => s.unlocked)
  const unlockAchievement = useProgressStore((s) => s.unlockAchievement)
  const stats = useStats()

  const [queue, setQueue] = useState<Achievement[]>([])
  const firstRun = useRef(true)

  const input = {
    learned: stats.totalKnown,
    points: stats.points,
    streak: stats.streak,
    quizzes: stats.quizzes,
    perfectQuizzes: stats.perfectQuizzes,
  }

  // Сравниваем выполненные условия с тем, что уже записано в хранилище
  const done = achievements.filter((a) => a.check(input))
  const doneIds = done.map((a) => a.id).join(',')

  useEffect(() => {
    const fresh = done.filter((a) => !unlocked.includes(a.id))
    if (fresh.length === 0) return

    fresh.forEach((a) => unlockAchievement(a.id))

    // В самый первый раз только записываем, без уведомлений
    if (firstRun.current) {
      firstRun.current = false
      return
    }

    setQueue((q) => [...q, ...fresh])
    playUnlock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doneIds])

  /** Убирает показанное достижение из очереди */
  const dismiss = (id: string) => setQueue((q) => q.filter((a) => a.id !== id))

  return { queue, dismiss }
}
