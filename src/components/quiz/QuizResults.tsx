import { motion } from 'framer-motion'
import { RefreshCw, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Mistake } from './QuizRunner'
import { Button } from '../ui/Button'
import { CircularProgress } from '../ui/CircularProgress'
import { playFinish } from '../../utils/sound'
import { percent } from '../../utils/format'

interface QuizResultsProps {
  correct: number
  total: number
  points: number
  mistakes: Mistake[]
  onRestart: () => void
  onNewQuiz: () => void
}

/** Подбирает похвалу по проценту правильных ответов */
function praise(value: number): string {
  if (value === 100) return 'Идеально! 完璧!'
  if (value >= 80) return 'Отличный результат!'
  if (value >= 60) return 'Неплохо, но есть куда расти'
  if (value >= 40) return 'Надо ещё потренироваться'
  return 'Не сдавайся, попробуй ещё раз'
}

/** Экран результатов с анимированным счётом и разбором ошибок */
export function QuizResults({
  correct,
  total,
  points,
  mistakes,
  onRestart,
  onNewQuiz,
}: QuizResultsProps) {
  const score = percent(correct, total)
  // Число очков «докручивается» от нуля — так приятнее смотреть
  const [shown, setShown] = useState(0)

  useEffect(() => {
    playFinish()
    const step = Math.max(1, Math.round(points / 30))
    const id = window.setInterval(() => {
      setShown((v) => {
        if (v + step >= points) {
          window.clearInterval(id)
          return points
        }
        return v + step
      })
    }, 30)
    return () => window.clearInterval(id)
  }, [points])

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        className="glass rounded-3xl p-6 text-center sm:p-8"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
      >
        <div className="jp text-sm text-fg/40">結果</div>
        <h2 className="mb-6 text-2xl font-black">
          {praise(score)}
        </h2>

        <CircularProgress value={score} size={170} thickness={12} caption="правильных" />

        <div className="mt-6 grid grid-cols-3 gap-3">
          <div className="glass-soft rounded-2xl p-3">
            <div className="text-xl font-extrabold text-ok">{correct}</div>
            <div className="text-[11px] text-fg/45">верно</div>
          </div>
          <div className="glass-soft rounded-2xl p-3">
            <div className="text-xl font-extrabold text-bad">{total - correct}</div>
            <div className="text-[11px] text-fg/45">ошибок</div>
          </div>
          <div className="glass-soft rounded-2xl p-3">
            <div className="flex items-center justify-center gap-1 text-xl font-extrabold text-warn">
              <Sparkles size={16} /> {shown}
            </div>
            <div className="text-[11px] text-fg/45">очков</div>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button full onClick={onRestart}>
            <RefreshCw size={16} /> Ещё раз
          </Button>
          <Button full variant="ghost" onClick={onNewQuiz}>
            Другие настройки
          </Button>
        </div>
      </motion.div>

      {/* Разбор ошибок */}
      {mistakes.length > 0 && (
        <div className="glass mt-6 rounded-3xl p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-fg/40">
            Разбор ошибок
          </h3>
          <div className="space-y-2">
            {mistakes.map((mistake, i) => (
              <motion.div
                key={mistake.item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass-soft flex items-center gap-4 rounded-2xl p-3"
              >
                <span className="jp w-14 shrink-0 text-center text-3xl font-bold">
                  {mistake.item.char}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-ok">{mistake.expected}</div>
                  {mistake.item.meaning && mistake.item.meaning !== mistake.expected && (
                    <div className="truncate text-xs text-fg/50">{mistake.item.meaning}</div>
                  )}
                </div>
                {mistake.given && (
                  <span className="shrink-0 text-xs text-bad line-through">{mistake.given}</span>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
