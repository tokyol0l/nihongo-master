import { motion } from 'framer-motion'
import { Check, Volume2 } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import type { ItemStatus, StudyItem } from '../../types'
import { StatusDots } from '../ui/StatusBadge'
import { playClick } from '../../utils/sound'
import { speak } from '../../utils/speech'

interface FlipCardProps {
  item: StudyItem
  status: ItemStatus
  /** Вызывается, когда нажали «Знаю» / «Повторить» / «Сложно» */
  onRate: (status: ItemStatus) => void
  /** Номер карточки в сетке — нужен для эффекта появления по очереди */
  index?: number
  /** Стоит ли галочка: карточка попадёт в тренировку и тесты */
  selected?: boolean
  /** Переключить галочку. Если не передан, галочка не показывается */
  onToggleSelect?: () => void
}

/** Подбирает размер символа: длинные слова должны помещаться в карточку */
function charSize(char: string): string {
  if (char.length <= 1) return 'text-[120px] leading-none'
  if (char.length === 2) return 'text-[76px] leading-none'
  if (char.length <= 4) return 'text-[52px] leading-tight'
  if (char.length <= 6) return 'text-[38px] leading-tight'
  return 'text-[28px] leading-tight'
}

/** Кнопки оценки, которые появляются на обратной стороне */
const rateButtons: { status: ItemStatus; label: string; className: string }[] = [
  { status: 'known', label: 'Знаю', className: 'bg-ok/20 text-ok hover:bg-ok/30' },
  { status: 'review', label: 'Повторить', className: 'bg-warn/20 text-warn hover:bg-warn/30' },
  { status: 'hard', label: 'Сложно', className: 'bg-bad/20 text-bad hover:bg-bad/30' },
]

/** Карточка с 3D-переворотом: спереди символ, сзади перевод и пример */
export function FlipCard({
  item,
  status,
  onRate,
  index = 0,
  selected = true,
  onToggleSelect,
}: FlipCardProps) {
  const [flipped, setFlipped] = useState(false)

  return (
    <motion.div
      className="perspective relative h-64 w-full"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{
        delay: Math.min(index * 0.03, 0.6),
        type: 'spring',
        stiffness: 300,
        damping: 22,
      }}
      whileHover={{ y: -3 }}
    >
      {/* Галочка: попадает ли карточка в тренировку */}
      {onToggleSelect && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            playClick()
            onToggleSelect()
          }}
          aria-label={selected ? 'Убрать из тренировки' : 'Добавить в тренировку'}
          className={clsx(
            'absolute -left-1.5 -top-1.5 z-20 grid h-6 w-6 place-items-center rounded border transition-colors',
            selected
              ? 'border-transparent bg-accent text-white'
              : 'border-line bg-surface text-transparent hover:border-fg/40',
          )}
        >
          <Check size={15} strokeWidth={3} />
        </button>
      )}

      <motion.div
        className="preserve-3d relative h-full w-full cursor-pointer"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        onClick={() => {
          playClick()
          setFlipped((v) => !v)
        }}
      >
        {/* Лицевая сторона */}
        <div
          className={clsx(
            'backface-hidden glass absolute inset-0 flex flex-col rounded-lg p-4 transition-colors hover:border-fg/25',
            // Снятая галочка показывается пунктиром, но текст остаётся читаемым
            !selected && 'border-dashed',
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-fg/35">
              {item.group}
            </span>
            <StatusDots status={status} />
          </div>

          <div className="flex flex-1 items-center justify-center">
            <span className={clsx('jp font-bold', charSize(item.char))}>
              {item.char}
            </span>
          </div>

          <div className="text-center text-[11px] text-fg/35">нажми, чтобы перевернуть</div>
        </div>

        {/* Обратная сторона */}
        <div
          className="backface-hidden glass absolute inset-0 flex flex-col rounded-3xl p-4"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xl font-extrabold text-sakura">{item.romaji}</div>
              {item.kana && <div className="jp text-xs text-fg/50">{item.kana}</div>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                speak(item.char)
              }}
              className="rounded-xl p-2 text-fg/50 transition hover:bg-fg/10 hover:text-aqua"
              aria-label="Послушать"
            >
              <Volume2 size={16} />
            </button>
          </div>

          {item.meaning && <div className="mt-1 text-sm font-semibold">{item.meaning}</div>}

          {item.example && (
            <div className="mt-2 rounded-2xl bg-fg/5 p-2.5 text-[11px] leading-relaxed">
              <div className="jp text-fg/90">{item.example.jp}</div>
              <div className="text-fg/45">{item.example.romaji}</div>
              <div className="text-fg/70">{item.example.ru}</div>
            </div>
          )}

          <div className="mt-auto grid grid-cols-3 gap-1.5 pt-2">
            {rateButtons.map((button) => (
              <motion.button
                key={button.status}
                whileTap={{ scale: 0.92 }}
                onClick={(e) => {
                  e.stopPropagation()
                  playClick()
                  onRate(button.status)
                  setFlipped(false)
                }}
                className={clsx(
                  'rounded-xl py-2 text-[11px] font-bold transition-colors',
                  button.className,
                )}
              >
                {button.label}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
