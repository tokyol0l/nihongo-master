import { dataByCategory } from '../data'
import { grammarLessons } from '../data/grammar'
import { buildQuestions } from './quiz'
import { pickRandom } from './shuffle'

/** Сколько вопросов в каждом разделе пробного экзамена */
const VOCAB_KANJI_COUNT = 12
const GRAMMAR_COUNT = 10
const LISTENING_COUNT = 10

/** Один вопрос экзамена — любой раздел приведён к одному виду для общего рендера */
export interface ExamQuestion {
  id: string
  /** Что показать крупно: кандзи, слово или грамматический вопрос с пропуском */
  prompt: string
  /** Если true — prompt не показываем текстом, а только озвучиваем */
  isListening: boolean
  options: string[]
  answer: string
  /** Разбор верного ответа — показываем в конце на экране результатов */
  explain: string
}

/** Один раздел экзамена: название, время на вопрос и сами вопросы */
export interface ExamSection {
  id: string
  title: string
  kana: string
  secondsPerQuestion: number
  questions: ExamQuestion[]
}

/** Собирает пробный экзамен из карточек и заданий, уже проверенных в приложении */
export function buildExam(): ExamSection[] {
  const vocabKanjiPool = [...dataByCategory.kanji, ...dataByCategory.vocabulary]
  const vkQuestions: ExamQuestion[] = buildQuestions(vocabKanjiPool, 'choice', VOCAB_KANJI_COUNT).map(
    (q, i) => ({
      id: `vk-${i}`,
      prompt: q.item.char,
      isListening: false,
      options: q.options,
      answer: q.answer,
      explain: `${q.item.char} (${q.item.romaji}) — ${q.item.meaning ?? q.item.romaji}`,
    }),
  )

  const grammarPool = grammarLessons.flatMap((lesson) =>
    lesson.exercises
      .filter((e) => e.type === 'choice' && e.options && e.options.length > 0)
      .map((e) => ({ ...e, lessonNumber: lesson.number })),
  )
  const grammarChosen = pickRandom(grammarPool, Math.min(GRAMMAR_COUNT, grammarPool.length))
  const gQuestions: ExamQuestion[] = grammarChosen.map((e, i) => ({
    id: `g-${i}`,
    prompt: e.question,
    isListening: false,
    options: e.options ?? [],
    answer: e.answer,
    explain: `Урок ${e.lessonNumber}: ${e.hint}`,
  }))

  const listenPool = [
    ...dataByCategory.hiragana,
    ...dataByCategory.katakana,
    ...dataByCategory.vocabulary,
  ]
  const lQuestions: ExamQuestion[] = buildQuestions(listenPool, 'listening', LISTENING_COUNT).map(
    (q, i) => ({
      id: `l-${i}`,
      prompt: q.item.char,
      isListening: true,
      options: q.options,
      answer: q.answer,
      explain: q.item.meaning
        ? `${q.item.char} (${q.item.romaji}) — ${q.item.meaning}`
        : `${q.item.char} (${q.item.romaji})`,
    }),
  )

  return [
    {
      id: 'vocab',
      title: 'Кандзи и словарь',
      kana: '文字・語彙',
      secondsPerQuestion: 20,
      questions: vkQuestions,
    },
    {
      id: 'grammar',
      title: 'Грамматика',
      kana: '文法',
      secondsPerQuestion: 25,
      questions: gQuestions,
    },
    {
      id: 'listening',
      title: 'Аудирование',
      kana: '聴解',
      secondsPerQuestion: 15,
      questions: lQuestions,
    },
  ]
}

/** Порог «сдал» — упрощённый, не официальная методика подсчёта баллов JLPT */
const PASS_OVERALL = 0.6
const PASS_PER_SECTION = 0.4

/** Проверяет, сдан ли экзамен: нужен процент по каждому разделу и в целом */
export function isExamPassed(
  sections: { correct: number; total: number }[],
  correct: number,
  total: number,
): boolean {
  if (total === 0) return false
  const overallOk = correct / total >= PASS_OVERALL
  const sectionsOk = sections.every((s) => s.total === 0 || s.correct / s.total >= PASS_PER_SECTION)
  return overallOk && sectionsOk
}
