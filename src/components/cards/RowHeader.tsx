import { Check, Minus } from 'lucide-react'
import clsx from 'clsx'

interface RowHeaderProps {
  /** Название ряда или темы */
  name: string
  /** Сколько карточек в ряду отмечено */
  selected: number
  /** Сколько всего карточек в ряду */
  total: number
  /** Нажали на галочку ряда */
  onToggle: () => void
}

/** Заголовок ряда с галочкой, которая отмечает сразу весь ряд */
export function RowHeader({ name, selected, total, onToggle }: RowHeaderProps) {
  const all = selected === total
  const none = selected === 0

  return (
    <div className="mb-3 flex items-center gap-3">
      <button
        onClick={onToggle}
        aria-label={all ? `Снять весь ряд ${name}` : `Отметить весь ряд ${name}`}
        className={clsx(
          'grid h-6 w-6 shrink-0 place-items-center rounded-md border transition-colors',
          all && 'border-transparent bg-accent text-white',
          !all && !none && 'border-transparent bg-accent/50 text-white',
          none && 'border-line text-transparent hover:border-fg/40',
        )}
      >
        {none ? <Check size={14} strokeWidth={3} /> : all ? <Check size={14} strokeWidth={3} /> : <Minus size={14} strokeWidth={3} />}
      </button>

      <h3 className="text-sm font-bold text-fg/80">{name}</h3>

      <span className="text-xs text-fg/35">
        {selected} из {total}
      </span>

      <div className="ml-2 h-px flex-1 bg-line" />
    </div>
  )
}
