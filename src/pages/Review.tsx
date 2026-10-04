import { AnimatePresence, motion } from 'framer-motion'
import { Check, Sparkles, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import { allItems } from '../data'
import { useProgressStore } from '../store/useProgressStore'
import { getDueItems } from '../utils/srs'
import { buildQuestions } from '../utils/quiz'
import type { Question } from '../utils/quiz'
import { playCorrect, playWrong, playClick } from '../utils/sound'
import { ProgressBar } from '../components/ui/ProgressBar'

/** Сколько карточек повторяем за один заход максимум */
const SESSION_CAP = 30

/** Страница «Повторение»: карточки, у которых подошёл срок по интервальному повторению */
export default function Review() {
  const progress = useProgressStore((s) => s.progress)
  const excluded = useProgressStore((s) => s.excluded)
  const markAnswer = useProgressStore((s) => s.markAnswer)
  const addPoints = useProgressStore((s) => s.addPoints)

  const dueItems = useMemo(
    () => getDueItems(allItems, progress, excluded),
    // Пересчитываем список только при реальном открытии страницы —
    // иначе отвеченная карточка исчезала бы прямо посреди сессии
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const [questions] = useState<Question[]>(() =>
    buildQuestions(dueItems, 'choice', Math.min(dueItems.length, SESSION_CAP)),
  )
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [earned, setEarned] = useState(0)
  const [finished, setFinished] = useState(false)

  const question = questions[index]

  function answer(given: string) {
    if (selected !== null || !question) return
    const ok = given === question.answer
    setSelected(given)
    markAnswer(question.item.id, ok)

    if (ok) {
      setCorrectCount((c) => c + 1)
      setEarned((p) => p + 10)
      addPoints(10)
      playCorrect()
    } else {
      playWrong()
    }

    window.setTimeout(() => {
      if (index + 1 >= questions.length) {
        setFinished(true)
      } else {
        setIndex((i) => i + 1)
        setSelected(null)
      }
    }, 900)
  }

  if (dueItems.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <div className="glass rounded-lg p-8">
          <Sparkles size={28} className="mx-auto text-accent" />
          <h1 className="mt-3 text-2xl font-bold">Повторять пока нечего</h1>
          <p className="mt-2 text-sm text-fg/55">
            Карточки появятся здесь, когда для них подойдёт срок — он считается от того, как
            давно и насколько уверенно ты отвечал по ним в тестах.
          </p>
        </div>
      </div>
    )
  }

  if (finished || !question) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <motion.div
          className="glass rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Check size={28} className="mx-auto text-ok" />
          <h2 className="mt-3 text-2xl font-bold">Повторение пройдено</h2>
          <p className="mt-3 text-4xl font-bold text-accent">
            {correctCount}/{questions.length}
          </p>
          <p className="mt-2 text-sm text-fg/55">+{earned} очков</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <h1 className="text-3xl font-bold sm:text-4xl">Повторение</h1>
        <p className="mt-2 text-sm text-fg/50">Карточки, для которых подошёл срок</p>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={(index / questions.length) * 100} showValue={false} />
        </div>
        <span className="text-sm font-bold text-fg/60">
          {index + 1}/{questions.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={question.item.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <div className="glass mb-6 flex min-h-[140px] items-center justify-center rounded-lg p-8">
            <span className="jp text-5xl font-bold">{question.item.char}</span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {question.options.map((option) => {
              const isPicked = selected === option
              const showRight = selected !== null && option === question.answer
              return (
                <button
                  key={option}
                  disabled={selected !== null}
                  onClick={() => {
                    playClick()
                    answer(option)
                  }}
                  className={clsx(
                    'jp rounded-lg border px-4 py-4 text-left text-sm font-semibold transition-colors',
                    showRight && 'border-ok bg-ok/10 text-ok',
                    isPicked && !showRight && 'border-bad bg-bad/10 text-bad',
                    !isPicked && !showRight && 'border-line bg-surface hover:border-accent/60',
                    selected !== null && !isPicked && !showRight && 'opacity-50',
                  )}
                >
                  {option}
                  {isPicked && !showRight && <X size={14} className="ml-2 inline" />}
                </button>
              )
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
