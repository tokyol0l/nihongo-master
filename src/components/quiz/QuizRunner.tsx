import { AnimatePresence, motion } from 'framer-motion'
import { Check, Flame, Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import clsx from 'clsx'
import type { QuizSettings } from './QuizSetup'
import type { StudyItem } from '../../types'
import { dataByCategory } from '../../data'
import { buildQuestions, isTypedAnswerCorrect } from '../../utils/quiz'
import { filterBySubset, onlySelected } from '../../utils/subset'
import { playCorrect, playWrong } from '../../utils/sound'
import { speak } from '../../utils/speech'
import { useProgressStore } from '../../store/useProgressStore'
import { ProgressBar } from '../ui/ProgressBar'
import { useMascotStore } from '../../store/useMascotStore'
import { Button } from '../ui/Button'

/** Базовые очки за верный ответ (без множителя) */
const BASE_POINTS = 10

/** Множитель очков за серию правильных ответов подряд */
function comboMultiplier(streak: number): number {
  if (streak >= 5) return 3
  if (streak >= 3) return 2
  return 1
}

/** Ошибка, которую покажем в разборе на экране результатов */
export interface Mistake {
  item: StudyItem
  expected: string
  given: string
}

interface QuizRunnerProps {
  settings: QuizSettings
  onFinish: (correct: number, total: number, points: number, mistakes: Mistake[]) => void
  onQuit: () => void
}

/** Сам процесс прохождения теста: вопрос за вопросом */
export function QuizRunner({ settings, onFinish, onQuit }: QuizRunnerProps) {
  const markAnswer = useProgressStore((s) => s.markAnswer)
  const excluded = useProgressStore((s) => s.excluded)
  const sayMascot = useMascotStore((s) => s.say)

  // Вопросы генерируем один раз на весь тест
  const questions = useMemo(
    () =>
      buildQuestions(
        settings.onlyMarked
          ? onlySelected(
              filterBySubset(dataByCategory[settings.category], settings.subset),
              excluded,
            )
          : filterBySubset(dataByCategory[settings.category], settings.subset),
        settings.mode,
        settings.count,
      ),
    [settings, excluded],
  )

  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState('')
  const [result, setResult] = useState<'correct' | 'wrong' | null>(null)
  const [correctCount, setCorrectCount] = useState(0)
  const [earned, setEarned] = useState(0)
  const [combo, setCombo] = useState(0)
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [timeLeft, setTimeLeft] = useState(settings.seconds)
  const inputRef = useRef<HTMLInputElement>(null)

  const question = questions[index]
  const multiplier = comboMultiplier(combo)

  /** Проверяет ответ, показывает вспышку и через секунду идёт дальше */
  const answer = (given: string) => {
    if (result || !question) return

    const ok =
      question.mode === 'typing'
        ? isTypedAnswerCorrect(given, question.answer)
        : given === question.answer

    setResult(ok ? 'correct' : 'wrong')
    markAnswer(question.item.id, ok)

    // Очки считаем по множителю, который действует на момент ответа
    const gained = ok ? BASE_POINTS * multiplier : 0

    if (ok) {
      setCorrectCount((c) => c + 1)
      setEarned((p) => p + gained)
      setCombo((c) => {
        const next = c + 1
        // На круглых сериях маскот поздравляет отдельно, иначе — обычное «Правильно»
        if (next === 5) sayMascot('5 подряд!', 'streak')
        else if (next === 10) sayMascot('10 подряд, огонь!', 'streak')
        else if (next === 15) sayMascot('15 подряд, ты мастер!', 'streak')
        else sayMascot(multiplier > 1 ? `Верно! +${gained} ×${multiplier}` : `Верно! +${gained}`, 'correct')
        return next
      })
      playCorrect()
    } else {
      setCombo(0)
      setMistakes((m) => [...m, { item: question.item, expected: question.answer, given }])
      sayMascot('Неправильно', 'wrong')
      playWrong()
    }

    window.setTimeout(
      () => {
        if (index + 1 >= questions.length) {
          const finalCorrect = correctCount + (ok ? 1 : 0)
          onFinish(finalCorrect, questions.length, earned + gained, [
            ...mistakes,
            ...(ok ? [] : [{ item: question.item, expected: question.answer, given }]),
          ])
        } else {
          setIndex((i) => i + 1)
          setTyped('')
          setResult(null)
          setTimeLeft(settings.seconds)
        }
      },
      ok ? 700 : 1500,
    )
  }

  // Таймер: когда время кончилось, засчитываем пропуск как ошибку
  useEffect(() => {
    if (settings.seconds === 0 || result) return
    if (timeLeft <= 0) {
      answer('')
      return
    }
    const id = window.setTimeout(() => setTimeLeft((t) => t - 1), 1000)
    return () => window.clearTimeout(id)
    // Пересобираем таймер только когда меняется секунда или появляется ответ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, result, settings.seconds])

  // В режиме «на слух» сразу проигрываем звук нового вопроса
  useEffect(() => {
    if (question?.mode === 'listening' && question) speak(question.item.char)
    if (question?.mode === 'typing') inputRef.current?.focus()
  }, [index, question])

  // Цифрами 1-4 можно отвечать не мышкой, а с клавиатуры
  useEffect(() => {
    if (question?.mode === 'typing') return

    const onKey = (e: KeyboardEvent) => {
      if (result || !question) return
      const slot = Number(e.key)
      if (Number.isNaN(slot) || slot < 1 || slot > question.options.length) return
      answer(question.options[slot - 1])
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!question) return null

  const showChar = question.mode !== 'listening'

  return (
    <div className="mx-auto max-w-2xl">
      {/* Красная вспышка только на ошибку — зелёной больше нет */}
      <AnimatePresence>
        {result === 'wrong' && (
          <motion.div
            className="pointer-events-none fixed inset-0 z-40 bg-bad/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
          />
        )}
      </AnimatePresence>

      {/* Верхняя строка: выход, прогресс, счёт */}
      <div className="mb-5 flex items-center gap-3">
        <button
          onClick={onQuit}
          className="rounded-xl p-2 text-fg/50 transition hover:bg-fg/10 hover:text-fg"
          aria-label="Выйти из теста"
        >
          <X size={18} />
        </button>
        <div className="flex-1">
          <ProgressBar value={(index / questions.length) * 100} showValue={false} />
        </div>
        <span className="text-sm font-bold text-fg/60">
          {index + 1}/{questions.length}
        </span>
        <span className="rounded-xl bg-fg/10 px-3 py-1 text-sm font-extrabold text-ok">
          {earned}
        </span>
      </div>

      {/* Плашка комбо появляется с двух правильных подряд */}
      <AnimatePresence>
        {combo >= 2 && (
          <motion.div
            className="mb-4 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
          >
            <motion.span
              className={clsx(
                'flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-extrabold',
                multiplier === 3
                  ? 'bg-bad text-white'
                  : multiplier === 2
                    ? 'bg-warn text-[#241a00]'
                    : 'bg-fg/10 text-fg/70',
              )}
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 1.4, repeat: Infinity }}
            >
              <Flame size={14} />
              {combo} подряд
              {multiplier > 1 && <span>· очки ×{multiplier}</span>}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Таймер */}
      {settings.seconds > 0 && (
        <div className="mb-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-fg/10">
            <motion.div
              className={clsx(
                'h-full rounded-full',
                timeLeft <= 3 ? 'bg-bad' : 'bg-accent',
              )}
              animate={{ width: `${(timeLeft / settings.seconds) * 100}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        </div>
      )}

      {/* Сам вопрос */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.item.id}
          initial={{ opacity: 0, x: 80 }}
          animate={{
            opacity: 1,
            x: result === 'wrong' ? [0, -10, 10, -8, 8, 0] : 0,
          }}
          exit={{ opacity: 0, x: -80 }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        >
          <div className="glass mb-5 flex min-h-48 flex-col items-center justify-center rounded-3xl p-8">
            {showChar ? (
              <span className="jp text-center text-[90px] font-bold leading-none">
                {question.item.char}
              </span>
            ) : (
              <button
                onClick={() => speak(question.item.char)}
                className="flex flex-col items-center gap-3 text-fg/70 transition hover:text-aqua"
              >
                <motion.span
                  className="rounded-full bg-accent p-7"
                  animate={{ scale: [1, 1.08, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Volume2 size={40} className="text-fg" />
                </motion.span>
                <span className="text-xs">нажми, чтобы послушать ещё раз</span>
              </button>
            )}
          </div>

          {/* Варианты ответа */}
          {question.mode !== 'typing' && (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                {question.options.map((option, slot) => {
                  const isRight = option === question.answer
                  const picked = result !== null
                  return (
                    <motion.button
                      key={option}
                      whileHover={picked ? undefined : { scale: 1.02, y: -2 }}
                      whileTap={picked ? undefined : { scale: 0.97 }}
                      onClick={() => answer(option)}
                      className={clsx(
                        'flex items-center gap-3 rounded-2xl px-4 py-4 text-left font-bold transition-colors',
                        !picked && 'glass hover:bg-fg/10',
                        picked && isRight && 'bg-ok/25 text-ok',
                        picked && !isRight && 'glass-soft opacity-40',
                      )}
                    >
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-fg/10 text-[11px] text-fg/50">
                        {slot + 1}
                      </span>
                      <span className={clsx('flex-1', question.mode === 'listening' && 'jp text-3xl')}>
                        {option}
                      </span>
                    </motion.button>
                  )
                })}
              </div>
              <p className="mt-3 text-center text-[11px] text-fg/30">
                можно отвечать цифрами 1–{question.options.length} на клавиатуре
              </p>
            </>
          )}

          {/* Поле ввода ромадзи */}
          {question.mode === 'typing' && (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                answer(typed)
              }}
              className="space-y-3"
            >
              <input
                ref={inputRef}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={result !== null}
                placeholder="впиши ромадзи, например ka"
                className={clsx(
                  'glass w-full rounded-2xl px-5 py-4 text-center text-lg font-bold outline-none transition-colors',
                  result === 'correct' && 'bg-ok/20 text-ok',
                  result === 'wrong' && 'bg-bad/20 text-bad',
                )}
              />
              <Button full type="submit" disabled={result !== null || typed.trim() === ''}>
                <Check size={16} /> Ответить
              </Button>
            </form>
          )}

          {/* Показываем правильный ответ, если ошибся */}
          <AnimatePresence>
            {result === 'wrong' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-4 rounded-2xl bg-bad/15 p-4 text-center"
              >
                <div className="text-xs text-fg/50">Правильный ответ</div>
                <div className="jp mt-1 text-xl font-extrabold text-bad">{question.answer}</div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
