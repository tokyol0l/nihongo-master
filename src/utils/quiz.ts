import type { QuizMode, StudyItem } from '../types'
import { pickRandom, shuffle } from './shuffle'

/** Один вопрос теста */
export interface Question {
  /** Карточка, о которой спрашиваем */
  item: StudyItem
  /** Правильный ответ строкой */
  answer: string
  /** Варианты ответа — только для режимов с выбором */
  options: string[]
  /** Режим этого конкретного вопроса (для смешанного режима) */
  mode: QuizMode
}

/** Что показывать как ответ: для каны — ромадзи, для кандзи и слов — перевод */
export function answerFor(item: StudyItem): string {
  if (item.category === 'hiragana' || item.category === 'katakana') return item.romaji
  return item.meaning ?? item.romaji
}

/** Собирает список вопросов для теста */
export function buildQuestions(pool: StudyItem[], mode: QuizMode, count: number): Question[] {
  const chosen = pickRandom(pool, Math.min(count, pool.length))
  const baseModes: QuizMode[] = ['typing', 'choice', 'listening']

  return chosen.map((item, i) => {
    // В смешанном режиме чередуем режимы
    const itemMode = mode === 'mixed' ? baseModes[i % baseModes.length] : mode

    // В режиме «на слух» варианты — это сами символы, в остальных — переводы
    const answer = itemMode === 'listening' ? item.char : answerFor(item)

    if (itemMode === 'typing') {
      return { item, answer: item.romaji, options: [], mode: itemMode }
    }

    // Три неправильных варианта берём из того же раздела
    const others = pool.filter((other) => other.id !== item.id)
    const wrong = pickRandom(others, 3).map((o) => (itemMode === 'listening' ? o.char : answerFor(o)))

    // Убираем случайные совпадения с правильным ответом
    const unique = Array.from(new Set(wrong.filter((w) => w !== answer)))

    return { item, answer, options: shuffle([answer, ...unique]), mode: itemMode }
  })
}

/** Сравнивает введённый ответ с правильным, не придираясь к регистру и пробелам */
export function isTypedAnswerCorrect(typed: string, expected: string): boolean {
  const clean = (s: string) => s.trim().toLowerCase().replace(/\s+/g, ' ')
  return clean(typed) === clean(expected)
}
