import { motion } from 'framer-motion'
import { Award, RefreshCw, XCircle } from 'lucide-react'
import type { ExamAnswer } from './ExamRunner'
import type { ExamSection } from '../../utils/exam'
import { isExamPassed } from '../../utils/exam'
import { Button } from '../ui/Button'
import { CircularProgress } from '../ui/CircularProgress'
import { percent } from '../../utils/format'

interface ExamResultsProps {
  sections: ExamSection[]
  answers: ExamAnswer[]
  onRestart: () => void
  onExit: () => void
}

/** Экран результатов пробного экзамена: общий счёт, разбивка по разделам и ошибки */
export function ExamResults({ sections, answers, onRestart, onExit }: ExamResultsProps) {
  const correct = answers.filter((a) => a.correct).length
  const total = answers.length
  const score = percent(correct, total)

  const sectionStats = sections.map((section) => {
    const sectionAnswers = answers.filter((a) => a.sectionId === section.id)
    return {
      id: section.id,
      title: section.title,
      correct: sectionAnswers.filter((a) => a.correct).length,
      total: sectionAnswers.length,
    }
  })

  const passed = isExamPassed(sectionStats, correct, total)
  const mistakes = answers.filter((a) => !a.correct)

  return (
    <div className="mx-auto max-w-2xl">
      <motion.div
        className="glass rounded-lg p-6 text-center sm:p-8"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="jp text-sm text-fg/40">結果</div>
        <h2 className="mb-1 mt-1 text-2xl font-bold">
          {passed ? 'Пробный экзамен сдан' : 'Пока не хватает баллов'}
        </h2>
        <p className="mb-6 text-xs text-fg/45">
          Упрощённая прикидка: не официальная методика подсчёта JLPT
        </p>

        <CircularProgress value={score} size={170} thickness={12} caption="правильных" />

        <div
          className={
            'mx-auto mt-6 flex w-fit items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold ' +
            (passed ? 'bg-ok/15 text-ok' : 'bg-bad/15 text-bad')
          }
        >
          {passed ? <Award size={16} /> : <XCircle size={16} />}
          {passed ? 'Сдал бы N5' : 'Пока не сдал бы N5'}
        </div>

        <div className="mt-6 grid grid-cols-3 gap-3">
          {sectionStats.map((s) => (
            <div key={s.id} className="glass-soft rounded-lg p-3">
              <div className="text-lg font-bold">
                {s.correct}/{s.total}
              </div>
              <div className="text-[11px] leading-tight text-fg/45">{s.title}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <Button full onClick={onRestart}>
            <RefreshCw size={16} /> Пройти ещё раз
          </Button>
          <Button full variant="ghost" onClick={onExit}>
            Выйти
          </Button>
        </div>
      </motion.div>

      {mistakes.length > 0 && (
        <div className="glass mt-6 rounded-lg p-5 sm:p-6">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wider text-fg/40">
            Разбор ошибок
          </h3>
          <div className="space-y-2">
            {mistakes.map((mistake, i) => (
              <motion.div
                key={mistake.question.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass-soft rounded-lg p-3"
              >
                <div className="flex items-center gap-3">
                  {!mistake.question.isListening && (
                    <span className="jp w-14 shrink-0 text-center text-2xl font-bold">
                      {mistake.question.prompt}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold text-ok">{mistake.question.answer}</div>
                    {mistake.given && (
                      <span className="text-xs text-bad line-through">{mistake.given}</span>
                    )}
                  </div>
                </div>
                <p className="mt-2 text-xs leading-relaxed text-fg/50">{mistake.question.explain}</p>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
