import { useMemo } from 'react'
import { roadmap } from '../data/roadmap'
import type { RoadmapStep } from '../data/roadmap'
import { useProgressStore } from '../store/useProgressStore'

/** Состояние шага на дорожной карте */
export type StepState = 'done' | 'current' | 'locked'

/** Шаг вместе с посчитанным прогрессом */
export interface RoadmapProgress {
  step: RoadmapStep
  known: number
  total: number
  percent: number
  state: StepState
}

/** Шаг считается пройденным, когда выучено не меньше этой доли карточек */
const DONE_THRESHOLD = 0.9

/** Считает, какие шаги пройдены, какой идёт сейчас, а какие ещё закрыты */
export function useRoadmap(): { steps: RoadmapProgress[]; current: RoadmapProgress | null } {
  const progress = useProgressStore((s) => s.progress)

  return useMemo(() => {
    // Сначала считаем прогресс каждого шага
    const counted = roadmap.map((step) => {
      const known = step.items.filter((item) => progress[item.id]?.status === 'known').length
      const total = step.items.length
      return {
        step,
        known,
        total,
        percent: total === 0 ? 0 : Math.round((known / total) * 100),
        done: total > 0 && known / total >= DONE_THRESHOLD,
      }
    })

    // Текущий шаг — первый непройденный, всё после него закрыто
    const currentIndex = counted.findIndex((row) => !row.done)

    const steps = counted.map<RoadmapProgress>((row, i) => ({
      step: row.step,
      known: row.known,
      total: row.total,
      percent: row.percent,
      state: row.done ? 'done' : i === currentIndex ? 'current' : 'locked',
    }))

    return { steps, current: currentIndex === -1 ? null : steps[currentIndex] }
  }, [progress])
}
