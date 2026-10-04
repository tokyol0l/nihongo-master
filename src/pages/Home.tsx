import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  Flame,
  GraduationCap,
  Keyboard,
  Languages,
  Map,
  MapPinned,
  ScrollText,
  Sparkles,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { CircularProgress } from '../components/ui/CircularProgress'
import { useStats } from '../hooks/useStats'
import { useRoadmap } from '../hooks/useRoadmap'
import { allItems, categoryDescriptions, categoryTitles } from '../data'
import { plural } from '../utils/format'
import type { QuizSettings } from '../components/quiz/QuizSetup'
import type { Category } from '../types'
import { Button } from '../components/ui/Button'
import { useProgressStore, getWeeklyLearnedCount } from '../store/useProgressStore'
import { getDueItems } from '../utils/srs'
import { Target } from 'lucide-react'

/** Карточка-раздел на главной */
interface SectionCard {
  to: string
  title: string
  kana: string
  description: string
  icon: LucideIcon
  /** Раздел с карточками — для него покажем прогресс. У тестов и статистики его нет */
  category?: Category
}

const sections: SectionCard[] = [
  {
    to: '/hiragana',
    title: categoryTitles.hiragana,
    kana: 'ひらがな',
    description: categoryDescriptions.hiragana,
    category: 'hiragana',
    icon: Type,
  },
  {
    to: '/katakana',
    title: categoryTitles.katakana,
    kana: 'カタカナ',
    description: categoryDescriptions.katakana,
    category: 'katakana',
    icon: Languages,
  },
  {
    to: '/kanji',
    title: categoryTitles.kanji,
    kana: '漢字',
    description: categoryDescriptions.kanji,
    category: 'kanji',
    icon: GraduationCap,
  },
  {
    to: '/vocabulary',
    title: categoryTitles.vocabulary,
    kana: '単語',
    description: categoryDescriptions.vocabulary,
    category: 'vocabulary',
    icon: BookOpen,
  },
  {
    to: '/grammar',
    title: 'Грамматика',
    kana: '文法',
    description: 'Теория и задания по всем 25 урокам учебника',
    icon: ScrollText,
  },
  {
    to: '/japan-map',
    title: 'Карта Японии',
    kana: '日本地図',
    description: 'Города и достопримечательности на карте',
    icon: MapPinned,
  },
  {
    to: '/roadmap',
    title: 'Дорожная карта',
    kana: 'ロードマップ',
    description: 'Путь до уровня N5 по шагам',
    icon: Map,
  },
  {
    to: '/quiz',
    title: 'Тесты',
    kana: 'テスト',
    description: 'Три режима: выбор, ввод и на слух',
    icon: Brain,
  },
  {
    to: '/stats',
    title: 'Статистика',
    kana: '統計',
    description: 'Прогресс, серия дней и достижения',
    icon: BarChart3,
  },
]

/** Главная страница: заголовок, общий прогресс и карточки разделов */
export default function Home() {
  const stats = useStats()
  const navigate = useNavigate()
  const { current } = useRoadmap()
  const progress = useProgressStore((s) => s.progress)
  const excluded = useProgressStore((s) => s.excluded)
  const weeklyGoal = useProgressStore((s) => s.weeklyGoal)
  const setWeeklyGoal = useProgressStore((s) => s.setWeeklyGoal)
  const dueCount = getDueItems(allItems, progress, excluded).length
  const weeklyLearned = getWeeklyLearnedCount(progress)
  const weeklyPercent = Math.min(100, Math.round((weeklyLearned / weeklyGoal) * 100))
  const weeklyDone = weeklyLearned >= weeklyGoal

  /** Сразу открывает тренировку ввода чтения, минуя экран настроек */
  const startDrill = (category: Category, subset: QuizSettings['subset']) => {
    const settings: QuizSettings = {
      category,
      mode: 'typing',
      count: 20,
      seconds: 0,
      subset,
      onlyMarked: true,
    }
    navigate('/quiz', { state: settings })
  }

  return (
    <div className="mx-auto max-w-6xl">
      {/* Заголовок */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <h1 className="jp text-4xl font-bold sm:text-5xl">日本語 Master</h1>
        <motion.p
          className="mt-3 text-sm text-fg/50 sm:text-base"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Учим японский с нуля: азбуки, иероглифы, слова и тесты
        </motion.p>
      </motion.div>

      {/* Общий прогресс */}
      <motion.div
        className="glass mb-8 flex flex-col items-center gap-6 rounded-3xl p-6 sm:flex-row sm:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <CircularProgress value={stats.totalPercent} size={150} caption="всего изучено" />

        <div className="grid flex-1 grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="glass-soft rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold">{stats.totalKnown}</div>
            <div className="text-[11px] text-fg/45">знаков выучено</div>
          </div>
          <div className="glass-soft rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-warn">
              <Sparkles size={18} /> {stats.points}
            </div>
            <div className="text-[11px] text-fg/45">очков</div>
          </div>
          <div className="glass-soft rounded-2xl p-4 text-center">
            <div className="flex items-center justify-center gap-1 text-2xl font-extrabold text-sakura">
              <Flame size={18} /> {stats.streak}
            </div>
            <div className="text-[11px] text-fg/45">
              {plural(stats.streak, 'день подряд', 'дня подряд', 'дней подряд')}
            </div>
          </div>
          <div className="glass-soft rounded-2xl p-4 text-center">
            <div className="text-2xl font-extrabold text-aqua">{stats.quizzes}</div>
            <div className="text-[11px] text-fg/45">
              {plural(stats.quizzes, 'тест пройден', 'теста пройдено', 'тестов пройдено')}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Цель на неделю: сколько новых слов/кандзи/каны выучить */}
      <motion.div
        className="glass mb-4 rounded-lg p-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.16 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Target size={16} className={weeklyDone ? 'text-ok' : 'text-accent'} />
            <span className="text-sm font-bold">
              {weeklyDone
                ? 'Цель на неделю выполнена'
                : `Цель на неделю: ${weeklyLearned} из ${weeklyGoal} слов`}
            </span>
          </div>
          <div className="flex gap-1">
            {[10, 20, 30, 50].map((n) => (
              <button
                key={n}
                onClick={() => setWeeklyGoal(n)}
                className={clsx(
                  'rounded px-2 py-1 text-[11px] font-bold transition-colors',
                  weeklyGoal === n
                    ? 'bg-accent text-white'
                    : 'bg-fg/10 text-fg/50 hover:text-fg',
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-fg/10">
          <div
            className={clsx('h-full rounded-full', weeklyDone ? 'bg-ok' : 'bg-accent')}
            style={{ width: `${weeklyPercent}%` }}
          />
        </div>
      </motion.div>

      {/* Напоминание о карточках, для которых подошёл срок повторения */}
      {dueCount > 0 && (
        <motion.div
          className="glass mb-4 flex flex-wrap items-center gap-4 rounded-lg border-ok/30 p-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
        >
          <span className="rounded bg-ok/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-ok">
            Пора повторить
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">
              {dueCount} {plural(dueCount, 'карточка', 'карточки', 'карточек')} ждут повторения
            </div>
            <div className="text-xs text-fg/45">Самое эффективное время для запоминания</div>
          </div>
          <Link
            to="/review"
            className="flex items-center gap-1 rounded bg-ok px-3 py-2 text-xs font-bold text-white"
          >
            Повторить <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* Следующий шаг по дорожной карте */}
      {current && (
        <motion.div
          className="glass mb-4 flex flex-wrap items-center gap-4 rounded-lg p-4"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22 }}
        >
          <span className="rounded bg-accent/15 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-accent">
            Следующий шаг
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">{current.step.title}</div>
            <div className="text-xs text-fg/45">
              {current.step.hint} · выучено {current.known} из {current.total}
            </div>
          </div>
          <Link
            to={current.step.to}
            className="flex items-center gap-1 rounded bg-accent px-3 py-2 text-xs font-bold text-white"
          >
            Идти <ArrowRight size={13} />
          </Link>
        </motion.div>
      )}

      {/* Быстрая тренировка: сразу печатать чтение, без настроек */}
      <motion.div
        className="glass mb-8 rounded-3xl p-5 sm:p-6"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-start gap-4">
          <span className="rounded border border-line bg-surface-2 p-2.5">
            <Keyboard size={20} className="text-accent" />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold">Впиши чтение с клавиатуры</h2>
            <p className="mt-1 text-sm text-fg/50">
              Показывается знак — печатаешь его чтение латиницей и жмёшь Enter. 20 знаков подряд.
            </p>
          </div>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-4">
          <Button onClick={() => startDrill('hiragana', 'basic')}>Хирагана: основные</Button>
          <Button variant="ghost" onClick={() => startDrill('hiragana', 'dakuten')}>
            Хирагана: дакутэн
          </Button>
          <Button variant="ghost" onClick={() => startDrill('katakana', 'basic')}>
            Катакана: основные
          </Button>
          <Button variant="ghost" onClick={() => startDrill('katakana', 'dakuten')}>
            Катакана: дакутэн
          </Button>
        </div>
      </motion.div>

      {/* Карточки разделов */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((section, i) => (
          <motion.div
            key={section.to}
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.06, type: 'spring', stiffness: 260, damping: 22 }}
            whileHover={{ y: -2 }}
          >
            <Link
              to={section.to}
              className="glass block h-full rounded-lg p-4 transition-colors hover:border-fg/25"
            >
              <div className="flex items-start gap-4">
                <span className="rounded border border-line bg-surface-2 p-2.5">
                  <section.icon size={20} className="text-accent" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="jp text-[11px] text-fg/35">{section.kana}</div>
                  <h2 className="text-lg font-extrabold">{section.title}</h2>
                  <p className="mt-1 text-xs leading-relaxed text-fg/50">
                    {section.description}
                  </p>

                  {/* У разделов с карточками сразу видно, сколько уже выучено */}
                  {(() => {
                    const stat = stats.categories.find((c) => c.category === section.category)
                    if (!stat) return null
                    return (
                      <div className="mt-3">
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-fg/10">
                          <div
                            className="h-full rounded-full bg-accent"
                            style={{ width: `${stat.percent}%` }}
                          />
                        </div>
                        <div className="mt-1.5 text-[11px] text-fg/40">
                          выучено {stat.known} из {stat.total}
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
