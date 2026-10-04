import { useProgressStore } from '../store/useProgressStore'
import { motion } from 'framer-motion'
import { Award, Flame, Star, TrendingUp } from 'lucide-react'

/** Страница с историей прогресса и графиками */
export default function Progress() {
  const { points, streak, bestStreak, studyDays, quizHistory } = useProgressStore()

  // Вычисляем статистику
  const averageDaily = studyDays.length > 0 ? Math.round(points / studyDays.length) : 0
  const totalQuizzes = quizHistory.length
  const perfectQuizzes = quizHistory.filter((q) => q.correct === q.total).length
  const avgQuizScore =
    quizHistory.length > 0
      ? Math.round(
          (quizHistory.reduce((sum, q) => sum + (q.correct / q.total) * 100, 0) / quizHistory.length) * 10,
        ) / 10
      : 0

  // Последние 7 дней активности
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (6 - i))
    const dateStr = date.toISOString().split('T')[0]
    const hasStudied = studyDays.includes(dateStr)
    return { date: dateStr, studied: hasStudied }
  })

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">進捗</div>
        <h1 className="text-3xl font-bold sm:text-4xl">История прогресса</h1>
        <p className="mt-2 text-sm text-fg/50">Посмотри, как ты развиваешься</p>
      </div>

      {/* Основные статистики */}
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Star size={16} className="text-warn" />
            <span className="text-xs text-fg/60">Очки</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{points}</div>
          <p className="mt-1 text-xs text-fg/50">{averageDaily} в день</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Flame size={16} className="text-sakura" />
            <span className="text-xs text-fg/60">Серия</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{streak}</div>
          <p className="mt-1 text-xs text-fg/50">Лучшая: {bestStreak}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={16} className="text-ok" />
            <span className="text-xs text-fg/60">Тесты</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{avgQuizScore}%</div>
          <p className="mt-1 text-xs text-fg/50">{totalQuizzes} пройдено</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass rounded-lg p-4"
        >
          <div className="flex items-center gap-2">
            <Award size={16} className="text-accent" />
            <span className="text-xs text-fg/60">Идеальные</span>
          </div>
          <div className="mt-2 text-2xl font-bold">{perfectQuizzes}</div>
          <p className="mt-1 text-xs text-fg/50">100% правильных</p>
        </motion.div>
      </div>

      {/* Календарь активности на последние 7 дней */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass mb-6 rounded-lg p-5"
      >
        <h2 className="mb-4 font-semibold">Последние 7 дней</h2>
        <div className="flex gap-1">
          {last7Days.map((day, i) => (
            <div
              key={i}
              className="flex flex-1 flex-col items-center gap-1"
            >
              <div
                className={`h-8 w-full rounded transition-colors ${
                  day.studied ? 'bg-accent' : 'bg-surface-2'
                }`}
                title={day.studied ? `Занимался ${day.date}` : `Не занимался ${day.date}`}
              />
              <span className="text-[10px] text-fg/50">
                {new Date(day.date).toLocaleDateString('ru', { weekday: 'short' }).slice(0, 2)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* История тестов */}
      {quizHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="glass rounded-lg p-5"
        >
          <h2 className="mb-4 font-semibold">Последние тесты</h2>
          <div className="space-y-2">
            {quizHistory.slice(0, 5).map((quiz, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-surface-2/50 px-3 py-2.5 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {quiz.category} • {quiz.mode}
                  </p>
                  <p className="text-xs text-fg/50">
                    {new Date(quiz.date).toLocaleDateString('ru')}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold">{quiz.correct}/{quiz.total}</p>
                  <p className="text-xs text-fg/50">
                    {Math.round((quiz.correct / quiz.total) * 100)}%
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
