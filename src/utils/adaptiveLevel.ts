/** Уровень сложности (1 = начинающий, 5 = продвинутый) */
export type AdaptiveLevel = 1 | 2 | 3 | 4 | 5

export interface AdaptiveLevelInput {
  /** Сколько карточек выучено по каждой категории */
  learned: Record<'hiragana' | 'katakana' | 'kanji' | 'vocabulary', number>
  /** Количество выученных грамматических тем (уроков) */
  grammarLessons: number
  /** Процент успеха в тестах */
  quizSuccessRate: number
  /** Количество дней занятий подряд */
  streak: number
}

/** Вычисляет адаптивный уровень пользователя (1-5) на основе прогресса */
export function calculateAdaptiveLevel(input: AdaptiveLevelInput): AdaptiveLevel {
  const totalLearned =
    input.learned.hiragana + input.learned.katakana + input.learned.kanji + input.learned.vocabulary

  // Вычисляем оценку по разным критериям (0-100)
  const learnedScore = Math.min(100, (totalLearned / 150) * 100) // ~150 = почти всё
  const grammarScore = Math.min(100, (input.grammarLessons / 30) * 100) // 30 уроков = максимум
  const quizScore = input.quizSuccessRate * 100
  const streakScore = Math.min(100, (input.streak / 30) * 100) // 30 дней = максимум

  // Объединяем в общую оценку
  const totalScore = (learnedScore + grammarScore + quizScore + streakScore) / 4

  // Преобразуем в уровень 1-5
  if (totalScore < 20) return 1 // Начинающий
  if (totalScore < 40) return 2 // Элементарный
  if (totalScore < 60) return 3 // Средний
  if (totalScore < 80) return 4 // Продвинутый
  return 5 // Мастер
}

/** Фильтрует карточки по адаптивному уровню */
export function filterByAdaptiveLevel<T extends { level?: 'easy' | 'medium' | 'hard' }>(
  items: T[],
  adaptiveLevel: AdaptiveLevel,
): T[] {
  if (!items.some((i) => i.level)) {
    // Если нет уровней, возвращаем все
    return items
  }

  switch (adaptiveLevel) {
    case 1:
    case 2:
      // Начинающие видят только easy
      return items.filter((i) => !i.level || i.level === 'easy')
    case 3:
      // Средний уровень: easy + medium
      return items.filter((i) => !i.level || i.level === 'easy' || i.level === 'medium')
    case 4:
    case 5:
      // Продвинутые видят всё
      return items
  }
}

/** Возвращает лейбл для уровня */
export function getLevelLabel(level: AdaptiveLevel): string {
  const labels: Record<AdaptiveLevel, string> = {
    1: 'Начинающий 🌱',
    2: 'Элементарный 📚',
    3: 'Средний 🎯',
    4: 'Продвинутый 🚀',
    5: 'Мастер 👑',
  }
  return labels[level]
}

/** Возвращает цвет для уровня в CSS классах */
export function getLevelColor(level: AdaptiveLevel): string {
  const colors: Record<AdaptiveLevel, string> = {
    1: 'text-cyan-400',
    2: 'text-blue-400',
    3: 'text-purple-400',
    4: 'text-pink-400',
    5: 'text-yellow-400',
  }
  return colors[level]
}
