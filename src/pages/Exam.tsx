import { AnimatePresence, motion } from 'framer-motion'
import { Clock, GraduationCap, Headphones, ScrollText } from 'lucide-react'
import { useState } from 'react'
import { buildExam, isExamPassed } from '../utils/exam'
import type { ExamSection } from '../utils/exam'
import { ExamRunner } from '../components/exam/ExamRunner'
import type { ExamAnswer } from '../components/exam/ExamRunner'
import { ExamResults } from '../components/exam/ExamResults'
import { useProgressStore } from '../store/useProgressStore'

type Stage = 'intro' | 'running' | 'results'

/** Страница пробного экзамена JLPT N5: вступление → прохождение → результаты */
export default function Exam() {
  const [stage, setStage] = useState<Stage>('intro')
  const [sections, setSections] = useState<ExamSection[]>([])
  const [answers, setAnswers] = useState<ExamAnswer[]>([])
  const addExamAttempt = useProgressStore((s) => s.addExamAttempt)

  const start = () => {
    setSections(buildExam())
    setAnswers([])
    setStage('running')
  }

  const finish = (finalAnswers: ExamAnswer[]) => {
    const correct = finalAnswers.filter((a) => a.correct).length
    const total = finalAnswers.length
    const sectionStats = sections.map((section) => {
      const sectionAnswers = finalAnswers.filter((a) => a.sectionId === section.id)
      return {
        id: section.id,
        label: section.title,
        correct: sectionAnswers.filter((a) => a.correct).length,
        total: sectionAnswers.length,
      }
    })

    addExamAttempt({
      id: `exam-${Date.now()}`,
      date: Date.now(),
      correct,
      total,
      passed: isExamPassed(sectionStats, correct, total),
      sections: sectionStats,
    })

    setAnswers(finalAnswers)
    setStage('results')
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={stage}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.25 }}
      >
        {stage === 'intro' && (
          <div className="mx-auto max-w-2xl">
            <div className="mb-6 text-center">
              <div className="jp text-sm text-fg/40">模擬試験</div>
              <h1 className="text-3xl font-bold sm:text-4xl">Пробный экзамен N5</h1>
              <p className="mt-2 text-sm text-fg/50">
                Три раздела как на настоящем JLPT — проверь, готов ли ты
              </p>
            </div>

            <div className="glass space-y-4 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded border border-line bg-surface-2 p-2">
                  <ScrollText size={18} className="text-accent" />
                </span>
                <div>
                  <div className="text-sm font-bold">Кандзи и словарь · 12 вопросов</div>
                  <div className="text-xs text-fg/50">Иероглифы и слова уровня N5</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded border border-line bg-surface-2 p-2">
                  <GraduationCap size={18} className="text-accent" />
                </span>
                <div>
                  <div className="text-sm font-bold">Грамматика · 10 вопросов</div>
                  <div className="text-xs text-fg/50">По всем 25 урокам учебника</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="mt-0.5 rounded border border-line bg-surface-2 p-2">
                  <Headphones size={18} className="text-accent" />
                </span>
                <div>
                  <div className="text-sm font-bold">Аудирование · 10 вопросов</div>
                  <div className="text-xs text-fg/50">Слушаешь и выбираешь, что услышал</div>
                </div>
              </div>
              <div className="flex items-start gap-3 border-t border-line pt-4">
                <span className="mt-0.5 rounded border border-line bg-surface-2 p-2">
                  <Clock size={18} className="text-accent" />
                </span>
                <div>
                  <div className="text-sm font-bold">На каждый вопрос — свой таймер</div>
                  <div className="text-xs text-fg/50">
                    Как на настоящем экзамене — ответ или пропуск сразу ведёт дальше,
                    без подсказок «верно / неверно» по ходу дела
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={start}
              className="mt-6 w-full rounded-lg bg-accent px-6 py-3.5 text-sm font-bold text-white"
            >
              Начать экзамен
            </button>
          </div>
        )}

        {stage === 'running' && (
          <ExamRunner sections={sections} onFinish={finish} onQuit={() => setStage('intro')} />
        )}

        {stage === 'results' && (
          <ExamResults
            sections={sections}
            answers={answers}
            onRestart={start}
            onExit={() => setStage('intro')}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
