import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { GrammarExercise } from '../../data/grammar'
import { playCorrect, playWrong } from '../../utils/sound'
import { FuriganaText } from '../ui/FuriganaText'

/** Сравнение ответа без внимания к пробелам вокруг */
function normalize(s: string): string {
  return s.trim()
}

interface ExerciseItemProps {
  exercise: GrammarExercise
  index: number
  onAnswered: (correct: boolean) => void
}

/** Одно задание: вопрос с выбором варианта или полем ввода */
export function ExerciseItem({ exercise, index, onAnswered }: ExerciseItemProps) {
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)

  const isCorrect =
    checked &&
    normalize(exercise.type === 'choice' ? (picked ?? '') : typed) === normalize(exercise.answer)

  const check = (value: string) => {
    if (checked) return
    setChecked(true)
    const ok = normalize(value) === normalize(exercise.answer)
    onAnswered(ok)
    if (ok) playCorrect()
    else playWrong()
  }

  return (
    <motion.div
      className="glass rounded-lg p-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <FuriganaText text={exercise.question} className="jp mb-3 text-base font-semibold" />

      {exercise.type === 'choice' && exercise.options && (
        <div className="grid gap-2 sm:grid-cols-3">
          {exercise.options.map((option) => {
            const selected = picked === option
            const showRight = checked && option === exercise.answer
            const showWrong = checked && selected && option !== exercise.answer
            return (
              <button
                key={option}
                disabled={checked}
                onClick={() => {
                  setPicked(option)
                  check(option)
                }}
                className={clsx(
                  'jp rounded-lg border px-3 py-2.5 text-sm font-semibold transition-colors',
                  !checked && 'border-line bg-surface hover:border-accent',
                  showRight && 'border-ok bg-ok/10 text-ok',
                  showWrong && 'border-bad bg-bad/10 text-bad',
                  checked && !showRight && !showWrong && 'border-line bg-surface opacity-50',
                )}
              >
                <FuriganaText text={option} />
              </button>
            )
          })}
        </div>
      )}

      {exercise.type === 'fill' && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            check(typed)
          }}
          className="flex gap-2"
        >
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={checked}
            placeholder="впиши ответ"
            className={clsx(
              'jp flex-1 rounded-lg border px-3 py-2.5 text-sm outline-none transition-colors',
              !checked && 'border-line bg-surface focus:border-accent',
              checked && isCorrect && 'border-ok bg-ok/10 text-ok',
              checked && !isCorrect && 'border-bad bg-bad/10 text-bad',
            )}
          />
          <button
            type="submit"
            disabled={checked || typed.trim() === ''}
            className="rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-40"
          >
            Ответить
          </button>
        </form>
      )}

      {checked && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className={clsx(
            'mt-3 flex items-start gap-2 rounded-lg p-3 text-xs',
            isCorrect ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad',
          )}
        >
          {isCorrect ? (
            <Check size={14} className="mt-0.5 shrink-0" />
          ) : (
            <X size={14} className="mt-0.5 shrink-0" />
          )}
          <span>
            {!isCorrect && (
              <span className="font-semibold">
                Правильный ответ: <FuriganaText text={exercise.answer} className="jp" />.{' '}
              </span>
            )}
            {exercise.hint}
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}
