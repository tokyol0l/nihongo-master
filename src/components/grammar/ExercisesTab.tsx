import { useState } from 'react'
import { RefreshCw, Trophy } from 'lucide-react'
import type { GrammarLesson } from '../../data/grammar'
import { ExerciseItem } from './ExerciseItem'
import { Button } from '../ui/Button'

/** Вкладка «Задания»: список упражнений по уроку с проверкой ответов */
export function ExercisesTab({ lesson }: { lesson: GrammarLesson }) {
  // key нужен, чтобы «Начать заново» полностью пересоздавало все ExerciseItem
  const [round, setRound] = useState(0)
  const [answers, setAnswers] = useState<Record<string, boolean>>({})

  const answeredCount = Object.keys(answers).length
  const correctCount = Object.values(answers).filter(Boolean).length
  const allAnswered = answeredCount === lesson.exercises.length

  const restart = () => {
    setAnswers({})
    setRound((r) => r + 1)
  }

  return (
    <div className="space-y-4" key={round}>
      <div className="glass flex items-center justify-between rounded-lg p-3">
        <span className="text-sm text-fg/60">
          Отвечено {answeredCount} из {lesson.exercises.length}
          {allAnswered && (
            <span className="ml-2 font-semibold text-fg">
              — верно {correctCount} из {lesson.exercises.length}
            </span>
          )}
        </span>
        {allAnswered && (
          <Button variant="ghost" onClick={restart}>
            <RefreshCw size={14} /> Начать заново
          </Button>
        )}
      </div>

      {lesson.exercises.map((exercise, i) => (
        <ExerciseItem
          key={exercise.id}
          exercise={exercise}
          index={i}
          onAnswered={(correct) => setAnswers((a) => ({ ...a, [exercise.id]: correct }))}
        />
      ))}

      {allAnswered && (
        <div className="glass flex items-center gap-3 rounded-lg p-4">
          <Trophy size={20} className="shrink-0 text-accent" />
          <p className="text-sm text-fg/70">
            {correctCount === lesson.exercises.length
              ? 'Все верно! Можно переходить к следующему уроку.'
              : 'Загляни в теорию по тем пунктам, где ошибся, и попробуй ещё раз.'}
          </p>
        </div>
      )}
    </div>
  )
}
