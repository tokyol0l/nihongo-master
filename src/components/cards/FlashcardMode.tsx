import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw, Volume2, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import type { ItemStatus, StudyItem } from '../../types'
import { shuffle } from '../../utils/shuffle'
import { playClick } from '../../utils/sound'
import { speak } from '../../utils/speech'
import { ProgressBar } from '../ui/ProgressBar'

interface FlashcardModeProps {
  items: StudyItem[]
  onClose: () => void
  onRate: (id: string, status: ItemStatus) => void
}

/** Кнопки оценки под карточкой */
const rateButtons: { status: ItemStatus; label: string; className: string }[] = [
  { status: 'known', label: 'Знаю', className: 'bg-ok/20 text-ok hover:bg-ok/30' },
  { status: 'review', label: 'Повторить', className: 'bg-warn/20 text-warn hover:bg-warn/30' },
  { status: 'hard', label: 'Сложно', className: 'bg-bad/20 text-bad hover:bg-bad/30' },
]

/** Полноэкранный режим флеш-карточек: одна большая карточка за раз */
export function FlashcardMode({ items, onClose, onRate }: FlashcardModeProps) {
  // Перемешиваем один раз на весь сеанс
  const deck = useMemo(() => shuffle(items), [items])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  // Куда «уезжает» карточка: вперёд или назад
  const [direction, setDirection] = useState(1)

  const card = deck[index]

  const go = (step: number) => {
    setDirection(step)
    setFlipped(false)
    setIndex((i) => Math.min(Math.max(i + step, 0), deck.length - 1))
  }

  // Управление с клавиатуры: стрелки листают, пробел переворачивает
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') go(1)
      if (e.key === 'ArrowLeft') go(-1)
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') {
        e.preventDefault()
        setFlipped((v) => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  if (!card) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-bg p-6 text-center">
        <p className="text-fg/70">Не отмечено ни одной карточки — тренировать нечего.</p>
        <button
          onClick={onClose}
          className="glass rounded-2xl px-5 py-2.5 text-sm font-bold transition hover:bg-fg/10"
        >
          Вернуться и отметить
        </button>
      </div>
    )
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col bg-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Верхняя панель */}
      <div className="flex items-center gap-4 p-4">
        <button
          onClick={onClose}
          className="rounded-xl p-2 text-fg/60 transition hover:bg-fg/10 hover:text-fg"
          aria-label="Выйти"
        >
          <X size={20} />
        </button>
        <div className="flex-1">
          <ProgressBar value={((index + 1) / deck.length) * 100} showValue={false} />
        </div>
        <span className="text-sm font-bold text-fg/60">
          {index + 1} / {deck.length}
        </span>
      </div>

      {/* Карточка */}
      <div className="flex flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={card.id}
            custom={direction}
            initial={{ opacity: 0, x: direction * 120, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction * -120, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26 }}
            className="perspective w-full max-w-md"
          >
            <motion.div
              className="preserve-3d relative h-[22rem] w-full cursor-pointer"
              animate={{ rotateY: flipped ? 180 : 0 }}
              transition={{ type: 'spring', stiffness: 260, damping: 22 }}
              onClick={() => {
                playClick()
                setFlipped((v) => !v)
              }}
            >
              {/* Лицо */}
              <div className="backface-hidden glass absolute inset-0 flex flex-col items-center justify-center rounded-lg p-6">
                <span className="jp text-center text-[110px] font-bold leading-none">
                  {card.char}
                </span>
                <span className="mt-6 text-xs text-fg/35">нажми или пробел — перевернуть</span>
              </div>

              {/* Оборот */}
              <div
                className="backface-hidden glass absolute inset-0 flex flex-col justify-center gap-3 rounded-lg p-6 text-center"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="text-3xl font-extrabold text-sakura">{card.romaji}</div>
                {card.kana && <div className="jp text-sm text-fg/50">{card.kana}</div>}
                {card.meaning && <div className="text-lg font-semibold">{card.meaning}</div>}
                {card.example && (
                  <div className="mt-2 rounded-2xl bg-fg/5 p-3 text-sm">
                    <div className="jp">{card.example.jp}</div>
                    <div className="text-fg/45">{card.example.romaji}</div>
                    <div className="text-fg/70">{card.example.ru}</div>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    speak(card.char)
                  }}
                  className="mx-auto mt-1 flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-fg/60 transition hover:bg-fg/10 hover:text-aqua"
                >
                  <Volume2 size={16} /> Послушать
                </button>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Нижняя панель: оценка и листание */}
      <div className="mx-auto w-full max-w-md space-y-3 p-4">
        <div className="grid grid-cols-3 gap-2">
          {rateButtons.map((button) => (
            <motion.button
              key={button.status}
              whileTap={{ scale: 0.94 }}
              onClick={() => {
                playClick()
                onRate(card.id, button.status)
                if (index < deck.length - 1) go(1)
              }}
              className={clsx('rounded-2xl py-3 text-sm font-bold transition-colors', button.className)}
            >
              {button.label}
            </motion.button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={() => go(-1)}
            disabled={index === 0}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-fg/60 transition hover:bg-fg/10 disabled:opacity-30"
          >
            <ChevronLeft size={18} /> Назад
          </button>
          <button
            onClick={() => {
              setFlipped(false)
              setIndex(0)
            }}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-fg/60 transition hover:bg-fg/10"
          >
            <RotateCcw size={16} /> Сначала
          </button>
          <button
            onClick={() => go(1)}
            disabled={index === deck.length - 1}
            className="flex items-center gap-1 rounded-xl px-3 py-2 text-sm text-fg/60 transition hover:bg-fg/10 disabled:opacity-30"
          >
            Дальше <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
