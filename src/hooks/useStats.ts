import { useMemo } from 'react'
import { useProgressStore } from '../store/useProgressStore'
import { allItems, dataByCategory } from '../data'
import type { Category, ItemStatus } from '../types'

/** Статистика по одному разделу */
export interface CategoryStats {
  category: Category
  total: number
  known: number
  review: number
  hard: number
  /** Процент изученного (только статус «знаю») */
  percent: number
}

/** Считает, сколько карточек в каждом статусе по каждому разделу */
export function useStats() {
  const progress = useProgressStore((s) => s.progress)
  const points = useProgressStore((s) => s.points)
  const streak = useProgressStore((s) => s.streak)
  const bestStreak = useProgressStore((s) => s.bestStreak)
  const quizHistory = useProgressStore((s) => s.quizHistory)
  const studyDays = useProgressStore((s) => s.studyDays)

  return useMemo(() => {
    const categories = (Object.keys(dataByCategory) as Category[]).map<CategoryStats>(
      (category) => {
        const items = dataByCategory[category]
        const count = (status: ItemStatus) =>
          items.filter((item) => progress[item.id]?.status === status).length

        const known = count('known')
        return {
          category,
          total: items.length,
          known,
          review: count('review'),
          hard: count('hard'),
          percent: items.length === 0 ? 0 : Math.round((known / items.length) * 100),
        }
      },
    )

    // Точность по всем ответам в тестах
    let attempts = 0
    let right = 0
    for (const item of allItems) {
      const p = progress[item.id]
      if (!p) continue
      attempts += p.correct + p.wrong
      right += p.correct
    }

    // Что стоит подтянуть: карточки с наибольшей долей ошибок
    const weakest = allItems
      .map((item) => {
        const p = progress[item.id]
        const tries = p ? p.correct + p.wrong : 0
        return { item, tries, accuracy: tries === 0 ? 100 : Math.round((p!.correct / tries) * 100) }
      })
      .filter((row) => row.tries >= 2 && row.accuracy < 100)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 12)

    const totalItems = categories.reduce((sum, c) => sum + c.total, 0)
    const totalKnown = categories.reduce((sum, c) => sum + c.known, 0)
    const perfectQuizzes = quizHistory.filter((q) => q.correct === q.total && q.total > 0).length

    return {
      categories,
      totalItems,
      totalKnown,
      totalPercent: totalItems === 0 ? 0 : Math.round((totalKnown / totalItems) * 100),
      points,
      streak,
      bestStreak,
      quizzes: quizHistory.length,
      perfectQuizzes,
      quizHistory,
      attempts,
      right,
      accuracy: attempts === 0 ? 0 : Math.round((right / attempts) * 100),
      weakest,
      studyDays,
    }
  }, [progress, points, streak, bestStreak, quizHistory, studyDays])
}
