import type { ItemProgress, StudyItem } from '../types'

/** Один день в миллисекундах — чтобы не писать магическое число несколько раз */
const DAY_MS = 24 * 60 * 60 * 1000

/** Начальный коэффициент лёгкости — как в классическом алгоритме SM-2 */
const START_EASE = 2.5
const MIN_EASE = 1.3
const MAX_EASE = 3.0

/**
 * Упрощённый алгоритм интервального повторения (вдохновлён SM-2 / Anki).
 * Верный ответ — интервал растёт в «ease» раз, неверный — сбрасывается
 * на 1 день, а лёгкость карточки немного падает.
 */
export function nextSchedule(
  current: Pick<ItemProgress, 'interval' | 'ease'>,
  isCorrect: boolean,
  now: number = Date.now(),
): Pick<ItemProgress, 'interval' | 'ease' | 'dueAt'> {
  if (isCorrect) {
    const ease = Math.min(MAX_EASE, (current.ease || START_EASE) + 0.1)
    const interval = current.interval <= 0 ? 1 : Math.round(current.interval * ease)
    return { interval, ease, dueAt: now + interval * DAY_MS }
  }

  const ease = Math.max(MIN_EASE, (current.ease || START_EASE) - 0.2)
  return { interval: 1, ease, dueAt: now + DAY_MS }
}

/** Карточки, которые пора повторить: уже видели хоть раз, и срок настал */
export function getDueItems(
  items: StudyItem[],
  progress: Record<string, ItemProgress>,
  excluded: Record<string, true>,
  now: number = Date.now(),
): StudyItem[] {
  return items.filter((item) => {
    if (excluded[item.id]) return false
    const p = progress[item.id]
    if (!p) return false
    const seen = p.correct + p.wrong > 0
    return seen && p.dueAt > 0 && p.dueAt <= now
  })
}
