import { AnimatePresence, motion } from 'framer-motion'
import { CheckSquare, Layers, Search, Square } from 'lucide-react'
import { useMemo, useState } from 'react'
import clsx from 'clsx'
import type { Category, ItemStatus, KanaSubset, StudyItem } from '../../types'
import { categoryKana, categoryTitles, dataByCategory } from '../../data'
import { getItemProgress, useProgressStore } from '../../store/useProgressStore'
import { FlipCard } from './FlipCard'
import { FlashcardMode } from './FlashcardMode'
import { ProgressBar } from '../ui/ProgressBar'
import { Button } from '../ui/Button'
import { percent } from '../../utils/format'
import { filterBySubset, groupByRow, hasSubsets, onlySelected, subsetLabels } from '../../utils/subset'
import { RowHeader } from './RowHeader'

/**
 * Карточек показываем не все сразу, а порциями: у каждой своя пружинная
 * анимация появления и 3D-трансформ, и когда таких карточек 500+
 * (например, весь словарь), браузер начинает заметно тормозить.
 */
const PAGE_SIZE = 60

/** Возможные фильтры списка карточек */
type Filter = 'all' | 'known' | 'unknown' | 'hard'

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'known', label: 'Изученные' },
  { value: 'unknown', label: 'Не изученные' },
  { value: 'hard', label: 'Сложные' },
]

/** Подходит ли карточка под выбранный фильтр */
function matchesFilter(status: ItemStatus, filter: Filter): boolean {
  if (filter === 'all') return true
  if (filter === 'known') return status === 'known'
  if (filter === 'hard') return status === 'hard'
  return status !== 'known'
}

/** Страница изучения одного раздела: поиск, фильтры и сетка карточек */
export function StudySection({ category }: { category: Category }) {
  const items = dataByCategory[category]
  const progress = useProgressStore((s) => s.progress)
  const setStatus = useProgressStore((s) => s.setStatus)
  const excluded = useProgressStore((s) => s.excluded)
  const toggleExcluded = useProgressStore((s) => s.toggleExcluded)
  const setExcluded = useProgressStore((s) => s.setExcluded)

  const [filter, setFilter] = useState<Filter>('all')
  const [query, setQuery] = useState('')
  const [subset, setSubset] = useState<KanaSubset | null>(null)
  // Колода запоминается в момент открытия, чтобы оценки не перетасовывали её на ходу
  const [flashDeck, setFlashDeck] = useState<StudyItem[] | null>(null)
  // Сколько карточек показано в каждой группе — остальные не монтируются вообще.
  // Сбрасываем на первую порцию прямо при рендере, если фильтр/поиск/набор
  // поменялись — это принятый в React способ, без лишнего прохода через эффект.
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const resetKey = `${filter}|${query}|${subset}`
  const [prevResetKey, setPrevResetKey] = useState(resetKey)
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey)
    setVisibleCount(PAGE_SIZE)
  }

  const showSubsets = hasSubsets(category)

  // Отбираем карточки по части азбуки, фильтру и строке поиска
  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase()
    return filterBySubset(items, showSubsets ? subset : null).filter((item) => {
      const status = getItemProgress(progress, item.id).status
      if (!matchesFilter(status, filter)) return false
      if (!needle) return true
      return (
        item.char.includes(needle) ||
        item.romaji.toLowerCase().includes(needle) ||
        (item.meaning ?? '').toLowerCase().includes(needle)
      )
    })
  }, [items, progress, filter, query, subset, showSubsets])

  const learned = items.filter((i) => getItemProgress(progress, i.id).status === 'known').length
  // Отмеченные карточки — только они идут в тренировку и в тесты
  const selectedItems = onlySelected(items, excluded)

  /** Ставит или снимает галочку сразу у списка карточек */
  const toggleMany = (list: StudyItem[]) => {
    const allSelected = list.every((item) => !excluded[item.id])
    setExcluded(
      list.map((item) => item.id),
      allSelected,
    )
  }

  /** Блоки, на которые делится сетка карточек */
  const groups = useMemo(() => {
    // У кандзи и словаря деления нет — там одна общая сетка
    if (!showSubsets) return [{ key: 'all', title: null, hint: null, items: visible }]

    // Если выбран конкретный набор, показываем только его, без заголовка
    if (subset) return [{ key: subset, title: null, hint: null, items: visible }]

    return [
      {
        key: 'basic',
        title: 'Основные знаки',
        hint: 'Базовая азбука — с них начинают',
        items: visible.filter((item) => item.subset === 'basic'),
      },
      {
        key: 'dakuten',
        title: 'Дакутэн и хандакутэн',
        hint: 'Те же знаки со значком озвончения: が, ざ, だ, ば, ぱ',
        items: visible.filter((item) => item.subset === 'dakuten'),
      },
    ].filter((group) => group.items.length > 0)
  }, [visible, showSubsets, subset])

  return (
    <div className="mx-auto max-w-6xl">
      {/* Шапка раздела */}
      <div className="glass mb-6 rounded-3xl p-5 sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="jp text-sm text-fg/40">{categoryKana[category]}</div>
            <h1 className="text-3xl font-black sm:text-4xl">
              <span>{categoryTitles[category]}</span>
            </h1>
            <p className="mt-1 text-sm text-fg/50">
              Выучено {learned} из {items.length}
            </p>
          </div>

          <Button
            onClick={() => setFlashDeck(onlySelected(visible.length > 0 ? visible : items, excluded))}
            disabled={selectedItems.length === 0}
          >
            <Layers size={16} /> Тренировать отмеченные
          </Button>
        </div>

        <div className="mt-5">
          <ProgressBar value={percent(learned, items.length)} label="Прогресс раздела" />
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-fg/10 pt-4">
          <span className="text-xs text-fg/50">
            В тренировку отмечено{' '}
            <span className="font-bold text-fg">{selectedItems.length}</span> из {items.length}
          </span>
          <button
            onClick={() => setExcluded(items.map((i) => i.id), false)}
            className="glass-soft flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-fg/70 transition hover:text-fg"
          >
            <CheckSquare size={13} /> Отметить всё
          </button>
          <button
            onClick={() => setExcluded(items.map((i) => i.id), true)}
            className="glass-soft flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold text-fg/70 transition hover:text-fg"
          >
            <Square size={13} /> Снять всё
          </button>
        </div>
      </div>

      {/* Основные знаки или озвончённые — только для азбук */}
      {showSubsets && (
        <div className="mb-3 flex flex-wrap gap-2">
          {([null, 'basic', 'dakuten'] as (KanaSubset | null)[]).map((value) => (
            <button
              key={value ?? 'all'}
              onClick={() => setSubset(value)}
              className={clsx(
                'rounded-2xl px-4 py-2 text-xs font-bold transition-colors',
                subset === value ? 'bg-accent text-white' : 'glass-soft text-fg/55 hover:text-fg',
              )}
            >
              {value === null ? 'Все знаки' : subsetLabels[value]}
            </button>
          ))}
        </div>
      )}

      {/* Фильтры и поиск */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={clsx(
              'relative rounded-2xl px-4 py-2 text-xs font-bold transition-colors',
              filter === f.value ? 'text-fg' : 'text-fg/50 hover:text-fg/80',
            )}
          >
            {filter === f.value && (
              <motion.div
                layoutId="filter-active"
                className="absolute inset-0 rounded-2xl bg-accent"
                transition={{ type: 'spring', stiffness: 380, damping: 30 }}
              />
            )}
            <span className="relative z-10">{f.label}</span>
          </button>
        ))}

        <div className="glass-soft ml-auto flex items-center gap-2 rounded-2xl px-3 py-2">
          <Search size={14} className="text-fg/40" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Поиск"
            className="w-28 bg-transparent text-xs text-fg outline-none placeholder:text-fg/30 sm:w-40"
          />
        </div>
      </div>

      {/* Сетка карточек, разбитая на блоки */}
      {visible.length === 0 ? (
        <div className="glass rounded-3xl p-10 text-center text-fg/50">
          Тут пока пусто. Поменяй фильтр или очисти поиск.
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map((group) => {
            const groupLearned = group.items.filter(
              (item) => getItemProgress(progress, item.id).status === 'known',
            ).length

            // Показываем только первую порцию карточек группы — остальные
            // не мешают браузеру, пока их не попросили показать
            const shown = group.items.slice(0, visibleCount)
            const hiddenCount = group.items.length - shown.length

            return (
              <section key={group.key}>
                {group.title && (
                  <div className="mb-4 flex flex-wrap items-end justify-between gap-3 border-b border-fg/10 pb-3">
                    <div>
                      <h2 className="text-xl font-extrabold">{group.title}</h2>
                      <p className="mt-0.5 text-xs text-fg/40">{group.hint}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-xs text-fg/45">
                        выучено {groupLearned} из {group.items.length}
                      </span>
                      <button
                        onClick={() => toggleMany(group.items)}
                        className="glass-soft rounded-xl px-3 py-1.5 text-xs font-bold text-fg/70 transition hover:text-fg"
                      >
                        Отметить весь блок
                      </button>
                      <button
                        onClick={() => setFlashDeck(onlySelected(group.items, excluded))}
                        disabled={group.items.every((item) => excluded[item.id])}
                        className="glass-soft rounded-xl px-3 py-1.5 text-xs font-bold text-fg/70 transition hover:text-fg disabled:opacity-30"
                      >
                        Тренировать блок
                      </button>
                    </div>
                  </div>
                )}

                {/* Внутри блока карточки разложены по рядам, у каждого своя галочка */}
                <div className="space-y-6">
                  {groupByRow(shown).map((row) => (
                    <div key={`${group.key}-${row.name}`}>
                      <RowHeader
                        name={row.name}
                        total={row.items.length}
                        selected={row.items.filter((item) => !excluded[item.id]).length}
                        onToggle={() => toggleMany(row.items)}
                      />
                      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {row.items.map((item, i) => (
                          <FlipCard
                            key={item.id}
                            item={item}
                            index={i}
                            status={getItemProgress(progress, item.id).status}
                            onRate={(status) => setStatus(item.id, status)}
                            selected={!excluded[item.id]}
                            onToggleSelect={() => toggleExcluded(item.id)}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {hiddenCount > 0 && (
                  <div className="mt-6 flex justify-center">
                    <button
                      onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                      className="glass-soft rounded-xl px-5 py-2.5 text-sm font-bold text-fg/70 transition hover:text-fg"
                    >
                      Показать ещё {Math.min(hiddenCount, PAGE_SIZE)} (осталось {hiddenCount})
                    </button>
                  </div>
                )}
              </section>
            )
          })}
        </div>
      )}

      {/* Полноэкранные флеш-карточки */}
      <AnimatePresence>
        {flashDeck && (
          <FlashcardMode items={flashDeck} onClose={() => setFlashDeck(null)} onRate={setStatus} />
        )}
      </AnimatePresence>
    </div>
  )
}
