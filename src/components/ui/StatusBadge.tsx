import clsx from 'clsx'
import type { ItemStatus } from '../../types'

/** Подписи и цвета для каждого статуса карточки */
const config: Record<ItemStatus, { label: string; className: string }> = {
  new: { label: 'Новое', className: 'bg-fg/10 text-fg/60' },
  known: { label: 'Знаю', className: 'bg-ok/20 text-ok' },
  review: { label: 'Повторить', className: 'bg-warn/20 text-warn' },
  hard: { label: 'Сложно', className: 'bg-bad/20 text-bad' },
}

/** Маленькая плашка со статусом изучения */
export function StatusBadge({ status }: { status: ItemStatus }) {
  const { label, className } = config[status]
  return (
    <span className={clsx('rounded-full px-2.5 py-1 text-[10px] font-bold', className)}>
      {label}
    </span>
  )
}

/** Три звёздочки-точки: показывают, насколько карточка освоена */
export function StatusDots({ status }: { status: ItemStatus }) {
  const filled = status === 'known' ? 3 : status === 'review' ? 2 : status === 'hard' ? 1 : 0

  return (
    <div className="flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={clsx(
            'h-1.5 w-1.5 rounded-full transition-colors',
            i < filled ? 'bg-accent' : 'bg-fg/20',
          )}
        />
      ))}
    </div>
  )
}
