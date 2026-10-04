import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ExamAttempt, ItemProgress, ItemStatus, QuizResult } from '../types'
import { localDateKey } from '../utils/format'
import { nextSchedule } from '../utils/srs'
import { calculateAdaptiveLevel, type AdaptiveLevel } from '../utils/adaptiveLevel'

/** Возвращает сегодняшнюю дату строкой вида 2026-09-27 (по местному времени) */
function today(): string {
  return localDateKey()
}

/** Разница в днях между двумя датами-строками */
function daysBetween(from: string, to: string): number {
  const ms = new Date(to).getTime() - new Date(from).getTime()
  return Math.round(ms / (1000 * 60 * 60 * 24))
}

/** Сколько очков стоит одна заморозка серии */
export const STREAK_FREEZE_COST = 200

/** Пустой прогресс для карточки, которую ещё не открывали */
const emptyProgress: ItemProgress = {
  status: 'new',
  correct: 0,
  wrong: 0,
  seenAt: 0,
  interval: 0,
  ease: 2.5,
  dueAt: 0,
}

interface SentenceLevelStats {
  correct: number
  wrong: number
}

interface ProgressState {
  /** Прогресс по каждой карточке: ключ — id карточки */
  progress: Record<string, ItemProgress>
  /** Накопленные очки */
  points: number
  /** Сколько дней подряд занимаюсь */
  streak: number
  /** Лучший streak за всё время */
  bestStreak: number
  /** День последнего занятия (строка YYYY-MM-DD) */
  lastDay: string | null
  /** Все дни, когда заходил заниматься — для календаря активности */
  studyDays: string[]
  /** История пройденных тестов, новые в начале */
  quizHistory: QuizResult[]
  /** История попыток пробного экзамена JLPT N5, новые в начале */
  examHistory: ExamAttempt[]
  /** Id уже открытых достижений */
  unlocked: string[]
  /**
   * Карточки, снятые галочкой. Хранится именно список исключённых,
   * поэтому по умолчанию выбрано всё — и новые карточки тоже.
   */
  excluded: Record<string, true>
  /** Статистика по уровням сложности в "Собери предложение" */
  sentenceStats: Record<'easy' | 'medium' | 'hard', SentenceLevelStats>
  /** Сколько новых слов/кандзи — цель на неделю */
  weeklyGoal: number
  /** Сколько заморозок серии куплено — спасают streak при пропущенном дне */
  streakFreezes: number

  /** Поставить карточке статус: знаю / повторить / сложно */
  setStatus: (id: string, status: ItemStatus) => void
  /** Отметить ответ в тесте */
  markAnswer: (id: string, isCorrect: boolean) => void
  /** Добавить очки */
  addPoints: (amount: number) => void
  /** Поставить новую недельную цель (сколько карточек выучить) */
  setWeeklyGoal: (goal: number) => void
  /** Купить заморозку серии за очки. Возвращает false, если очков не хватило */
  buyStreakFreeze: () => boolean
  /** Сохранить результат теста */
  addQuizResult: (result: QuizResult) => void
  /** Сохранить результат попытки экзамена */
  addExamAttempt: (attempt: ExamAttempt) => void
  /** Отметить, что сегодня занимался (обновляет streak) */
  touchStreak: () => void
  /** Запомнить открытое достижение */
  unlockAchievement: (id: string) => void
  /** Поставить или снять галочку у одной карточки */
  toggleExcluded: (id: string) => void
  /** Поставить или снять галочку сразу у группы карточек */
  setExcluded: (ids: string[], excluded: boolean) => void
  /** Отметить результат в "Собери предложение" */
  recordSentenceAnswer: (level: 'easy' | 'medium' | 'hard', correct: boolean) => void
  /** Сбросить весь прогресс */
  reset: () => void
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      progress: {},
      points: 0,
      streak: 0,
      bestStreak: 0,
      lastDay: null,
      studyDays: [],
      quizHistory: [],
      examHistory: [],
      unlocked: [],
      excluded: {},
      sentenceStats: {
        easy: { correct: 0, wrong: 0 },
        medium: { correct: 0, wrong: 0 },
        hard: { correct: 0, wrong: 0 },
      },
      weeklyGoal: 20,
      streakFreezes: 0,

      setStatus: (id, status) =>
        set((state) => {
          const current = state.progress[id] ?? emptyProgress
          // Ручная оценка тоже планирует повторение: «Знаю» — как верный
          // ответ, «Сложно» — как ошибку, «Повторить» и «Знаю не до конца» не трогают план
          const schedule =
            status === 'known'
              ? nextSchedule(current, true)
              : status === 'hard'
                ? nextSchedule(current, false)
                : null
          // Запоминаем момент, когда карточка впервые стала «знаю» — для недельной цели
          const justLearned = status === 'known' && current.status !== 'known'

          return {
            progress: {
              ...state.progress,
              [id]: {
                ...current,
                ...schedule,
                status,
                seenAt: Date.now(),
                learnedAt: justLearned ? Date.now() : current.learnedAt,
              },
            },
          }
        }),

      markAnswer: (id, isCorrect) =>
        set((state) => {
          const current = state.progress[id] ?? emptyProgress
          const correct = current.correct + (isCorrect ? 1 : 0)
          const wrong = current.wrong + (isCorrect ? 0 : 1)

          // Два верных ответа подряд без ошибок — считаем, что знаю.
          // Ошибся — карточка уходит в «сложные».
          let status: ItemStatus = current.status
          if (isCorrect && correct >= 2 && current.status !== 'known') status = 'known'
          if (isCorrect && current.status === 'new') status = 'review'
          if (!isCorrect) status = 'hard'

          const schedule = nextSchedule(current, isCorrect)
          const justLearned = status === 'known' && current.status !== 'known'

          return {
            progress: {
              ...state.progress,
              [id]: {
                status,
                correct,
                wrong,
                seenAt: Date.now(),
                learnedAt: justLearned ? Date.now() : current.learnedAt,
                ...schedule,
              },
            },
          }
        }),

      addPoints: (amount) => set((state) => ({ points: state.points + amount })),

      setWeeklyGoal: (weeklyGoal) => set({ weeklyGoal }),

      buyStreakFreeze: () => {
        let bought = false
        set((state) => {
          if (state.points < STREAK_FREEZE_COST) return state
          bought = true
          return {
            points: state.points - STREAK_FREEZE_COST,
            streakFreezes: state.streakFreezes + 1,
          }
        })
        return bought
      },

      addQuizResult: (result) =>
        set((state) => ({ quizHistory: [result, ...state.quizHistory].slice(0, 50) })),

      addExamAttempt: (attempt) =>
        set((state) => ({ examHistory: [attempt, ...state.examHistory].slice(0, 20) })),

      touchStreak: () =>
        set((state) => {
          const day = today()
          if (state.lastDay === day) return state

          // Занимался вчера — серия растёт. Пропустил день, но есть
          // заморозка — серия спасена и расходуется одна заморозка.
          // Иначе серия начинается заново.
          const gap = state.lastDay ? daysBetween(state.lastDay, day) : null
          const missedButFrozen = gap !== null && gap > 1 && state.streakFreezes > 0
          const streak = gap === 1 || missedButFrozen ? state.streak + 1 : 1

          return {
            lastDay: day,
            streak,
            bestStreak: Math.max(state.bestStreak, streak),
            streakFreezes: missedButFrozen ? state.streakFreezes - 1 : state.streakFreezes,
            // Копим дни для календаря, храним примерно за год
            studyDays: [...state.studyDays, day].slice(-400),
          }
        }),

      unlockAchievement: (id) =>
        set((state) =>
          state.unlocked.includes(id) ? state : { unlocked: [...state.unlocked, id] },
        ),

      toggleExcluded: (id) =>
        set((state) => {
          const next = { ...state.excluded }
          if (next[id]) delete next[id]
          else next[id] = true
          return { excluded: next }
        }),

      setExcluded: (ids, excluded) =>
        set((state) => {
          const next = { ...state.excluded }
          ids.forEach((id) => {
            if (excluded) next[id] = true
            else delete next[id]
          })
          return { excluded: next }
        }),

      recordSentenceAnswer: (level, correct) =>
        set((state) => ({
          sentenceStats: {
            ...state.sentenceStats,
            [level]: {
              correct: state.sentenceStats[level].correct + (correct ? 1 : 0),
              wrong: state.sentenceStats[level].wrong + (correct ? 0 : 1),
            },
          },
        })),

      reset: () =>
        set({
          progress: {},
          points: 0,
          streak: 0,
          bestStreak: 0,
          lastDay: null,
          studyDays: [],
          quizHistory: [],
          examHistory: [],
          unlocked: [],
          excluded: {},
          sentenceStats: {
            easy: { correct: 0, wrong: 0 },
            medium: { correct: 0, wrong: 0 },
            hard: { correct: 0, wrong: 0 },
          },
          weeklyGoal: 20,
          streakFreezes: 0,
        }),
    }),
    { name: 'nihongo-master-progress' },
  ),
)

/** Достаёт прогресс карточки, даже если её ещё не трогали */
export function getItemProgress(
  progress: Record<string, ItemProgress>,
  id: string,
): ItemProgress {
  return progress[id] ?? emptyProgress
}

/** Вычисляет, сколько карточек выучено всего */
export function getLearnedCount(progress: Record<string, ItemProgress>): number {
  return Object.values(progress).filter(
    (p) => p.status === 'known' && p.seenAt > 0,
  ).length
}

/** Timestamp начала текущей календарной недели (понедельник, 00:00 по местному времени) */
function startOfWeek(): number {
  const now = new Date()
  const day = now.getDay() // 0 — воскресенье, 1 — понедельник, ...
  const diffToMonday = day === 0 ? 6 : day - 1
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
  return monday.getTime()
}

/** Сколько карточек стало «знаю» за текущую неделю (с понедельника) — для недельной цели */
export function getWeeklyLearnedCount(progress: Record<string, ItemProgress>): number {
  const since = startOfWeek()
  return Object.values(progress).filter(
    (p) => p.status === 'known' && !!p.learnedAt && p.learnedAt >= since,
  ).length
}

/** Вычисляет адаптивный уровень на основе текущего прогресса */
export function computeAdaptiveLevel(state: ProgressState): AdaptiveLevel {
  // Подсчитываем выученные карточки по категориям
  const learned = {
    hiragana: Object.values(state.progress).filter((p) => p.status === 'known').length,
    katakana: 0, // В прогрессе хранятся все вместе, нужно было бы фильтровать по id
    kanji: 0,
    vocabulary: 0,
  }

  // Считаем успешность в тестах
  const allAnswers = Object.values(state.progress)
    .filter((p) => p.correct + p.wrong > 0)
    .map((p) => ({
      correct: p.correct,
      total: p.correct + p.wrong,
    }))

  const totalCorrect = allAnswers.reduce((sum, a) => sum + a.correct, 0)
  const totalAnswers = allAnswers.reduce((sum, a) => sum + a.total, 0)
  const quizSuccessRate = totalAnswers > 0 ? totalCorrect / totalAnswers : 0.5

  // Примерное количество пройденных уроков грамматики (по прогрессу)
  const grammarLessons = Object.entries(state.progress)
    .filter(([id]) => id.startsWith('l') && parseInt(id.slice(1)) <= 30)
    .filter(([, p]) => p.status === 'known' || p.correct > 0).length

  return calculateAdaptiveLevel({
    learned,
    grammarLessons,
    quizSuccessRate,
    streak: state.streak,
  })
}
