import { motion } from 'framer-motion'
import { Flame, History, Sparkles, Trash2, Trophy } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { CircularProgress } from '../components/ui/CircularProgress'
import { ActivityCalendar } from '../components/ui/ActivityCalendar'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { useStats } from '../hooks/useStats'
import { useProgressStore } from '../store/useProgressStore'
import { achievements } from '../data/achievements'
import { categoryTitles } from '../data'
import { formatDate, percent, plural } from '../utils/format'
import type { QuizMode } from '../types'

/** Названия режимов теста для истории */
const modeNames: Record<QuizMode, string> = {
  choice: 'Выбор перевода',
  typing: 'Ввод ромадзи',
  listening: 'На слух',
  mixed: 'Смешанный',
}

/** Страница статистики: прогресс, серия, история тестов и достижения */
export default function Stats() {
  const stats = useStats()
  const reset = useProgressStore((s) => s.reset)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Достижение считается открытым, если его условие выполнено прямо сейчас
  const achievementInput = {
    learned: stats.totalKnown,
    points: stats.points,
    streak: stats.streak,
    quizzes: stats.quizzes,
    perfectQuizzes: stats.perfectQuizzes,
  }

  const unlockedCount = achievements.filter((a) => a.check(achievementInput)).length

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="text-center">
        <div className="jp text-sm text-fg/40">統計</div>
        <h1 className="text-3xl font-black sm:text-4xl">
          <span>Статистика</span>
        </h1>
      </div>

      {/* Верхние показатели */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="glass flex items-center gap-4 rounded-3xl p-5">
          <span className="rounded border border-line bg-surface-2 p-2.5">
            <Flame size={20} className="text-accent" />
          </span>
          <div>
            <div className="text-2xl font-extrabold">{stats.streak}</div>
            <div className="text-xs text-fg/45">
              {plural(stats.streak, 'день подряд', 'дня подряд', 'дней подряд')} · рекорд{' '}
              {stats.bestStreak}
            </div>
          </div>
        </div>

        <div className="glass flex items-center gap-4 rounded-3xl p-5">
          <span className="rounded border border-line bg-surface-2 p-2.5">
            <Sparkles size={20} className="text-accent" />
          </span>
          <div>
            <div className="text-2xl font-extrabold">{stats.points}</div>
            <div className="text-xs text-fg/45">очков всего</div>
          </div>
        </div>

        <div className="glass flex items-center gap-4 rounded-3xl p-5">
          <span className="rounded border border-line bg-surface-2 p-2.5">
            <Trophy size={20} className="text-accent" />
          </span>
          <div>
            <div className="text-2xl font-extrabold">
              {unlockedCount} / {achievements.length}
            </div>
            <div className="text-xs text-fg/45">достижений открыто</div>
          </div>
        </div>
      </div>

      {/* Точность ответов */}
      <div className="glass rounded-lg p-5 sm:p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg/40">
          Точность ответов
        </h2>
        <div className="grid grid-cols-3 divide-x divide-line">
          <div className="px-2 text-center">
            <div className="text-2xl font-bold">{stats.attempts}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-fg/40">попыток</div>
          </div>
          <div className="px-2 text-center">
            <div className="text-2xl font-bold text-ok">{stats.right}</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-fg/40">верно</div>
          </div>
          <div className="px-2 text-center">
            <div className="text-2xl font-bold text-accent">{stats.accuracy}%</div>
            <div className="mt-0.5 text-[11px] uppercase tracking-wider text-fg/40">точность</div>
          </div>
        </div>
      </div>

      {/* Календарь занятий */}
      <div className="glass rounded-lg p-5 sm:p-6">
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg/40">
          Активность за полгода
        </h2>
        <ActivityCalendar days={stats.studyDays} />
        <p className="mt-3 text-[11px] text-fg/40">
          Квадратик закрашивается в тот день, когда ты заходил заниматься.
        </p>
      </div>

      {/* Что подтянуть */}
      {stats.weakest.length > 0 && (
        <div className="glass rounded-lg p-5 sm:p-6">
          <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg/40">
            Что стоит подтянуть
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-6">
            {stats.weakest.map(({ item, accuracy }) => (
              <div key={item.id} className="glass-soft rounded p-2.5 text-center">
                <div className="jp truncate text-2xl font-bold">{item.char}</div>
                <div className="truncate text-[10px] text-fg/45">{item.romaji}</div>
                <div
                  className={clsx(
                    'mt-1.5 inline-block rounded px-1.5 py-0.5 text-[10px] font-bold',
                    accuracy < 50 ? 'bg-bad/20 text-bad' : 'bg-warn/20 text-warn',
                  )}
                >
                  {accuracy}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Прогресс по разделам */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-fg/40">
          Прогресс по разделам
        </h2>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.categories.map((c, i) => (
            <motion.div
              key={c.category}
              className="flex flex-col items-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
            >
              <CircularProgress value={c.percent} size={120} caption={categoryTitles[c.category]} />
              <div className="mt-3 text-center text-xs text-fg/45">
                {c.known} из {c.total}
              </div>
              <div className="mt-1 flex gap-3 text-[11px]">
                <span className="text-warn">повторить: {c.review}</span>
                <span className="text-bad">сложных: {c.hard}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Достижения */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="mb-5 text-sm font-bold uppercase tracking-wider text-fg/40">
          Достижения
        </h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {achievements.map((achievement, i) => {
            const unlocked = achievement.check(achievementInput)
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  // Открытое достижение слегка «дышит» при появлении
                  rotate: unlocked ? [0, -4, 4, 0] : 0,
                }}
                transition={{ delay: i * 0.04, type: 'spring', stiffness: 260, damping: 20 }}
                className={clsx(
                  'rounded-2xl p-4 text-center transition-all',
                  unlocked ? 'border border-accent bg-surface' : 'glass-soft opacity-35',
                )}
              >
                <achievement.icon size={24} className={clsx("mx-auto", unlocked ? "text-accent" : "text-fg/40")} />
                <div className="mt-2 text-xs font-extrabold">{achievement.title}</div>
                <div className="mt-1 text-[10px] leading-snug text-fg/45">
                  {achievement.description}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* История тестов */}
      <div className="glass rounded-3xl p-5 sm:p-6">
        <h2 className="mb-5 flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-fg/40">
          <History size={16} /> Последние тесты
        </h2>

        {stats.quizHistory.length === 0 ? (
          <p className="text-sm text-fg/45">
            Тестов пока нет. Пройди первый — он появится здесь.
          </p>
        ) : (
          <div className="space-y-2">
            {stats.quizHistory.slice(0, 10).map((quiz, i) => {
              const score = percent(quiz.correct, quiz.total)
              return (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass-soft flex flex-wrap items-center gap-3 rounded-2xl p-3"
                >
                  <span
                    className={clsx(
                      'w-14 shrink-0 rounded-xl py-1.5 text-center text-sm font-extrabold',
                      score >= 80 ? 'bg-ok/20 text-ok' : score >= 50 ? 'bg-warn/20 text-warn' : 'bg-bad/20 text-bad',
                    )}
                  >
                    {score}%
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold">{categoryTitles[quiz.category]}</div>
                    <div className="text-[11px] text-fg/45">
                      {modeNames[quiz.mode]} · {formatDate(quiz.date)}
                    </div>
                  </div>
                  <span className="text-xs text-fg/50">
                    {quiz.correct}/{quiz.total}
                  </span>
                  <span className="text-xs font-bold text-warn">+{quiz.points}</span>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Сброс прогресса */}
      <div className="flex justify-center pb-4">
        <Button variant="ghost" onClick={() => setConfirmOpen(true)}>
          <Trash2 size={16} /> Сбросить весь прогресс
        </Button>
      </div>

      <Modal open={confirmOpen} onClose={() => setConfirmOpen(false)} title="Точно сбросить?">
        <p className="text-sm text-fg/60">
          Все выученные знаки, очки, серия дней и история тестов исчезнут. Отменить это будет
          нельзя.
        </p>
        <div className="mt-5 flex gap-2">
          <Button
            full
            variant="danger"
            onClick={() => {
              reset()
              setConfirmOpen(false)
            }}
          >
            Да, сбросить
          </Button>
          <Button full variant="ghost" onClick={() => setConfirmOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>
    </div>
  )
}
