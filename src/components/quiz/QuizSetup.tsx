import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Check, Ear, Keyboard, ListChecks, Play } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useState } from 'react'
import type { Category, KanaSubset, QuizMode } from '../../types'
import { categoryTitles, dataByCategory } from '../../data'
import { Button } from '../ui/Button'
import { speechSupported } from '../../utils/speech'
import { filterBySubset, hasSubsets, onlySelected, subsetLabels } from '../../utils/subset'
import { useProgressStore } from '../../store/useProgressStore'

/** Настройки, с которыми запускается тест */
export interface QuizSettings {
  category: Category
  mode: QuizMode
  count: number
  /** Ограничение времени на вопрос в секундах, 0 — без таймера */
  seconds: number
  /** Для азбук: какую часть брать. null — все знаки */
  subset: KanaSubset | null
  /** Брать только карточки, отмеченные галочкой в разделе */
  onlyMarked: boolean
}

const modes: { value: QuizMode; label: string; hint: string; icon: LucideIcon }[] = [
  {
    value: 'mixed',
    label: 'Смешанный (всё сразу)',
    hint: 'Чередуются ввод, выбор и слух — максимальная тренировка',
    icon: Play,
  },
  {
    value: 'typing',
    label: 'Ввод чтения с клавиатуры',
    hint: 'Показан знак — печатаешь чтение латиницей, например ji',
    icon: Keyboard,
  },
  {
    value: 'choice',
    label: 'Выбор перевода',
    hint: 'Показан символ — выбери правильный вариант',
    icon: ListChecks,
  },
  {
    value: 'listening',
    label: 'На слух',
    hint: 'Звучит слово — выбери нужный символ',
    icon: Ear,
  },
]

const counts = [10, 20, 30, 50]
const timers = [0, 10, 20]

/** Экран настройки теста перед запуском */
export function QuizSetup({ onStart }: { onStart: (settings: QuizSettings) => void }) {
  const [category, setCategory] = useState<Category>('hiragana')
  const [mode, setMode] = useState<QuizMode>('typing')
  const [subset, setSubset] = useState<KanaSubset | null>('basic')
  const [count, setCount] = useState(10)
  const [seconds, setSeconds] = useState(0)
  const [onlyMarked, setOnlyMarked] = useState(true)
  const excluded = useProgressStore((st) => st.excluded)

  const showSubsets = hasSubsets(category)
  const bySubset = filterBySubset(dataByCategory[category], showSubsets ? subset : null)
  const pool = onlyMarked ? onlySelected(bySubset, excluded) : bySubset
  const poolSize = pool.length
  // Для вопросов с вариантами нужно минимум четыре карточки
  const tooFew = poolSize < (mode === 'typing' || mode === 'mixed' ? 1 : 4)
  const canListen = speechSupported()

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">テスト</div>
        <h1 className="text-3xl font-black sm:text-4xl">
          <span>Тесты</span>
        </h1>
        <p className="mt-2 text-sm text-fg/50">Настрой тест и проверь себя</p>
      </div>

      <div className="glass space-y-6 rounded-3xl p-5 sm:p-7">
        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg/40">Раздел</h2>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {(Object.keys(dataByCategory) as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={clsx(
                  'relative rounded-2xl px-3 py-3 text-sm font-bold transition-colors',
                  category === c ? 'text-fg' : 'glass-soft text-fg/55 hover:text-fg',
                )}
              >
                {category === c && (
                  <motion.div
                    layoutId="quiz-category"
                    className="absolute inset-0 rounded-2xl bg-accent"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
                <span className="relative z-10">{categoryTitles[c]}</span>
              </button>
            ))}
          </div>
        </section>

        {/* У азбук можно учить отдельно основные знаки и отдельно озвончённые */}
        {showSubsets && (
          <section>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg/40">
              Какие знаки
            </h2>
            <div className="flex flex-wrap gap-2">
              {([null, 'basic', 'dakuten'] as (KanaSubset | null)[]).map((value) => (
                <button
                  key={value ?? 'all'}
                  onClick={() => setSubset(value)}
                  className={clsx(
                    'rounded-2xl px-4 py-2.5 text-sm font-bold transition-colors',
                    subset === value
                      ? 'bg-accent text-white'
                      : 'glass-soft text-fg/55 hover:text-fg',
                  )}
                >
                  {value === null ? 'Все знаки' : subsetLabels[value]}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-fg/35">
              {subset === 'basic'
                ? 'В тесте попадутся только 46 основных знаков — が, ば и подобные не встретятся.'
                : subset === 'dakuten'
                  ? 'Только знаки с дакутэн и хандакутэн: が, ざ, だ, ば, ぱ.'
                  : 'Все 71 знак вперемешку.'}
            </p>
          </section>
        )}

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg/40">Режим</h2>
          <div className="space-y-2">
            {modes.map((m) => {
              const disabled = m.value === 'listening' && !canListen
              return (
                <button
                  key={m.value}
                  disabled={disabled}
                  onClick={() => setMode(m.value)}
                  className={clsx(
                    'flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition-all',
                    mode === m.value
                      ? 'border border-accent bg-surface'
                      : 'glass-soft hover:bg-surface-2',
                    disabled && 'cursor-not-allowed opacity-40',
                  )}
                >
                  <m.icon size={18} className={mode === m.value ? 'text-sakura' : 'text-fg/40'} />
                  <span className="flex-1">
                    <span className="block text-sm font-bold">{m.label}</span>
                    <span className="block text-xs text-fg/45">
                      {disabled ? 'Браузер не умеет озвучивать текст' : m.hint}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg/40">
            Сколько вопросов
          </h2>
          <div className="flex flex-wrap gap-2">
            {counts.map((c) => (
              <button
                key={c}
                onClick={() => setCount(c)}
                disabled={c > poolSize}
                className={clsx(
                  'rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors',
                  count === c
                    ? 'bg-accent text-white'
                    : 'glass-soft text-fg/55 hover:text-fg',
                  c > poolSize && 'cursor-not-allowed opacity-30',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg/40">
            Таймер на вопрос
          </h2>
          <div className="flex flex-wrap gap-2">
            {timers.map((t) => (
              <button
                key={t}
                onClick={() => setSeconds(t)}
                className={clsx(
                  'rounded-2xl px-5 py-2.5 text-sm font-bold transition-colors',
                  seconds === t
                    ? 'bg-accent text-white'
                    : 'glass-soft text-fg/55 hover:text-fg',
                )}
              >
                {t === 0 ? 'Без таймера' : `${t} сек`}
              </button>
            ))}
          </div>
        </section>

        {/* Учитывать ли галочки, расставленные в разделе */}
        <section>
          <button
            onClick={() => setOnlyMarked((v) => !v)}
            className="glass-soft flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left"
          >
            <span
              className={clsx(
                'grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors',
                onlyMarked
                  ? 'border-transparent bg-accent text-white'
                  : 'border-fg/25 text-transparent',
              )}
            >
              <Check size={14} strokeWidth={3} />
            </span>
            <span className="flex-1">
              <span className="block text-sm font-bold">Только отмеченные карточки</span>
              <span className="block text-xs text-fg/45">
                Берутся те, у которых стоит галочка в разделе — сейчас подходит {poolSize}
              </span>
            </span>
          </button>
        </section>

        {tooFew && (
          <p className="rounded-2xl bg-bad/15 p-3 text-center text-xs text-bad">
            Карточек слишком мало. Отметь ещё несколько в разделе или сними галочку выше.
          </p>
        )}

        <Button full shimmer disabled={tooFew} onClick={() => onStart({
            category,
            mode,
            count: Math.min(count, poolSize),
            seconds,
            subset: showSubsets ? subset : null,
            onlyMarked,
          })}>
          <Play size={16} /> Начать тест
        </Button>
      </div>
    </div>
  )
}
