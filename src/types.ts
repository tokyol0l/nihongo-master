import type { LucideIcon } from 'lucide-react'

/** Разделы приложения, по которым разложены все данные */
export type Category = 'hiragana' | 'katakana' | 'kanji' | 'vocabulary'

/** Пример использования символа или слова */
export interface Example {
  /** Японский текст */
  jp: string
  /** Чтение латиницей */
  romaji: string
  /** Перевод на русский */
  ru: string
}

/** Одна карточка: символ каны, кандзи или слово */
export interface StudyItem {
  /** Уникальный id, например "hira-a" или "kanji-day" */
  id: string
  /** Раздел, к которому относится карточка */
  category: Category
  /** Japanese: сам символ или слово */
  char: string
  /** Чтение латиницей (ромадзи) */
  romaji: string
  /** Чтение каной — есть у кандзи и слов */
  kana?: string
  /** Перевод на русский */
  meaning?: string
  /** Группа: строка каны («k», «s»…) или тема слова */
  group: string
  /** Только у каны: основной знак или с дакутэн/хандакутэн */
  subset?: KanaSubset
  /** Пример использования */
  example?: Example
}

/** Часть азбуки: основные знаки или озвончённые (дакутэн и хандакутэн) */
export type KanaSubset = 'basic' | 'dakuten'

/** Как пользователь оценил карточку */
export type ItemStatus = 'new' | 'known' | 'review' | 'hard'

/** Прогресс по одной карточке */
export interface ItemProgress {
  status: ItemStatus
  /** Сколько раз ответил верно */
  correct: number
  /** Сколько раз ошибся */
  wrong: number
  /** Когда последний раз видел (timestamp) */
  seenAt: number
  /** Интервал до следующего повторения, в днях — ядро интервального повторения */
  interval: number
  /** Коэффициент лёгкости: растёт от верных ответов, падает от ошибок */
  ease: number
  /** Когда карточка снова станет «пора повторить» (timestamp). 0 — ещё не планировалась */
  dueAt: number
  /** Когда карточка впервые стала «знаю» (timestamp). Нужно для недельной цели */
  learnedAt?: number
}

/** Режимы теста */
export type QuizMode = 'choice' | 'typing' | 'listening' | 'mixed'

/** Результат одного пройденного теста */
export interface QuizResult {
  id: string
  date: number
  category: Category
  mode: QuizMode
  total: number
  correct: number
  /** Сколько очков заработано */
  points: number
}

/** Результат одного раздела пробного экзамена */
export interface ExamSectionResult {
  id: string
  label: string
  correct: number
  total: number
}

/** Итог одной попытки пробного экзамена JLPT N5 */
export interface ExamAttempt {
  id: string
  date: number
  correct: number
  total: number
  /** Сдал ли — по упрощённому порогу, не официальная методика JLPT */
  passed: boolean
  sections: ExamSectionResult[]
}

/** Достижение */
export interface Achievement {
  id: string
  title: string
  description: string
  /** Иконка достижения */
  icon: LucideIcon
  /** Функция проверки — выполнено ли достижение */
  check: (stats: AchievementInput) => boolean
}

/** Данные, по которым проверяются достижения */
export interface AchievementInput {
  learned: number
  points: number
  streak: number
  quizzes: number
  perfectQuizzes: number
}
