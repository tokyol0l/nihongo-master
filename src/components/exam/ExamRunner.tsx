import { AnimatePresence, motion } from 'framer-motion'
import { Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import type { ExamQuestion, ExamSection } from '../../utils/exam'
import { speak } from '../../utils/speech'
import { playClick } from '../../utils/sound'
import { ProgressBar } from '../ui/ProgressBar'

/** Один отвеченный вопрос — храним для итогового разбора */
export interface ExamAnswer {
  sectionId: string
  question: ExamQuestion
  given: string | null
  correct: boolean
}

interface ExamRunnerProps {
  sections: ExamSection[]
  onFinish: (answers: ExamAnswer[]) => void
  onQuit: () => void
}

/**
 * Проводит через все разделы экзамена по очереди. В отличие от обычного
 * теста — без подсказки «верно/неверно» на каждом вопросе: как и на
 * настоящем экзамене, разбор виден только в самом конце.
 */
export function ExamRunner({ sections, onFinish, onQuit }: ExamRunnerProps) {
  const [sectionIndex, setSectionIndex] = useState(0)
  const [questionIndex, setQuestionIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answers, setAnswers] = useState<ExamAnswer[]>([])
  const [showSectionIntro, setShowSectionIntro] = useState(true)

  const section = sections[sectionIndex]
  const question = section?.questions[questionIndex]
  const [timeLeft, setTimeLeft] = useState(section?.secondsPerQuestion ?? 0)

  const totalQuestions = useMemo(() => sections.reduce((s, sec) => s + sec.questions.length, 0), [sections])
  const answeredSoFar = answers.length

  // В режиме «на слух» сразу озвучиваем вопрос
  useEffect(() => {
    if (showSectionIntro || !question) return
    if (question.isListening) speak(question.prompt)
  }, [question, showSectionIntro])

  // Таймер на вопрос — не успел, значит пропустил
  useEffect(() => {
    // Пропуск по таймеру помечается пустой строкой — она ложная,
    // поэтому сравниваем именно с null, а не проверяем на истинность
    if (showSectionIntro || !question || selected !== null) return
    if (timeLeft <= 0) {
      commit(null)
      return
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, selected, showSectionIntro, question])

  function commit(given: string | null) {
    if (!question || !section) return
    setSelected(given ?? '')

    const nextAnswers = [
      ...answers,
      { sectionId: section.id, question, given, correct: given === question.answer },
    ]

    window.setTimeout(() => {
      setAnswers(nextAnswers)
      setSelected(null)

      if (questionIndex + 1 < section.questions.length) {
        setQuestionIndex((i) => i + 1)
        setTimeLeft(section.secondsPerQuestion)
      } else if (sectionIndex + 1 < sections.length) {
        setSectionIndex((i) => i + 1)
        setQuestionIndex(0)
        setTimeLeft(sections[sectionIndex + 1].secondsPerQuestion)
        setShowSectionIntro(true)
      } else {
        onFinish(nextAnswers)
      }
    }, 350)
  }

  if (!section) return null

  if (showSectionIntro) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <motion.div
          className="glass rounded-lg p-8"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="jp text-sm text-fg/40">{section.kana}</div>
          <h2 className="mt-1 text-2xl font-bold">{section.title}</h2>
          <p className="mt-3 text-sm text-fg/55">
            {section.questions.length} вопросов, по {section.secondsPerQuestion} секунд на каждый
          </p>
          <button
            onClick={() => {
              playClick()
              setShowSectionIntro(false)
            }}
            className="mt-6 rounded-lg bg-accent px-6 py-3 text-sm font-bold text-white"
          >
            {sectionIndex === 0 ? 'Начать раздел' : 'Следующий раздел'}
          </button>
        </motion.div>
      </div>
    )
  }

  if (!question) return null

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onQuit}
          className="rounded-xl p-2 text-fg/50 transition hover:bg-fg/10 hover:text-fg"
          aria-label="Прервать экзамен"
        >
          <X size={18} />
        </button>
        <div className="flex-1">
          <ProgressBar value={(answeredSoFar / totalQuestions) * 100} showValue={false} />
        </div>
        <span className="text-sm font-bold text-fg/60">
          {answeredSoFar + 1}/{totalQuestions}
        </span>
        <span
          className={clsx(
            'rounded-lg px-2.5 py-1 text-xs font-bold',
            timeLeft <= 5 ? 'bg-bad/20 text-bad' : 'bg-fg/10 text-fg/60',
          )}
        >
          {timeLeft}с
        </span>
      </div>

      <div className="mb-1 text-center text-xs font-semibold uppercase tracking-wider text-fg/35">
        {section.title}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <div className="glass mb-6 flex min-h-[140px] flex-col items-center justify-center rounded-lg p-8 text-center">
            {question.isListening ? (
              <button
                onClick={() => speak(question.prompt)}
                className="flex flex-col items-center gap-2 text-accent"
              >
                <Volume2 size={40} />
                <span className="text-xs text-fg/45">Нажми, чтобы послушать ещё раз</span>
              </button>
            ) : (
              <span className="jp text-4xl font-bold sm:text-5xl">{question.prompt}</span>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isPicked = selected !== null && option === selected
              return (
                <button
                  key={option}
                  disabled={selected !== null}
                  onClick={() => {
                    playClick()
                    commit(option)
                  }}
                  className={clsx(
                    'jp rounded-lg border px-4 py-4 text-left text-sm font-semibold transition-colors',
                    isPicked
                      ? 'border-accent bg-accent/15 text-accent'
                      : 'border-line bg-surface hover:border-accent/60',
                    selected !== null && !isPicked && 'opacity-50',
                  )}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
