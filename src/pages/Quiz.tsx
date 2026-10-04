import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { useLocation } from 'react-router-dom'
import { QuizSetup } from '../components/quiz/QuizSetup'
import type { QuizSettings } from '../components/quiz/QuizSetup'
import { QuizRunner } from '../components/quiz/QuizRunner'
import type { Mistake } from '../components/quiz/QuizRunner'
import { QuizResults } from '../components/quiz/QuizResults'
import { useProgressStore } from '../store/useProgressStore'

/** На каком шаге находится пользователь */
type Stage = 'setup' | 'running' | 'results'

/** Итог только что пройденного теста */
interface Finished {
  correct: number
  total: number
  points: number
  mistakes: Mistake[]
}

/** Страница тестов: настройка → прохождение → результаты */
export default function Quiz() {
  // Если на страницу пришли с главной по кнопке быстрой тренировки,
  // настройки уже переданы и экран выбора можно пропустить
  const location = useLocation()
  const [preset] = useState<QuizSettings | null>(
    () => (location.state as QuizSettings | null) ?? null,
  )

  const [stage, setStage] = useState<Stage>(preset ? 'running' : 'setup')
  const [settings, setSettings] = useState<QuizSettings | null>(preset)
  const [finished, setFinished] = useState<Finished | null>(null)

  const addPoints = useProgressStore((s) => s.addPoints)
  const addQuizResult = useProgressStore((s) => s.addQuizResult)

  const start = (next: QuizSettings) => {
    setSettings(next)
    setFinished(null)
    setStage('running')
  }

  const finish = (correct: number, total: number, points: number, mistakes: Mistake[]) => {
    if (!settings) return

    addPoints(points)
    addQuizResult({
      id: `quiz-${Date.now()}`,
      date: Date.now(),
      category: settings.category,
      mode: settings.mode,
      total,
      correct,
      points,
    })

    setFinished({ correct, total, points, mistakes })
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
        {stage === 'setup' && <QuizSetup onStart={start} />}

        {stage === 'running' && settings && (
          <QuizRunner settings={settings} onFinish={finish} onQuit={() => setStage('setup')} />
        )}

        {stage === 'results' && finished && (
          <QuizResults
            correct={finished.correct}
            total={finished.total}
            points={finished.points}
            mistakes={finished.mistakes}
            onRestart={() => settings && start(settings)}
            onNewQuiz={() => setStage('setup')}
          />
        )}
      </motion.div>
    </AnimatePresence>
  )
}
