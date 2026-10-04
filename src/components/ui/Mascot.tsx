import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import clsx from 'clsx'
import { useMascotStore } from '../../store/useMascotStore'

interface MascotProps {
  /** Высота в пикселях, ширина подстраивается сама */
  size?: number
  className?: string
  /** Показывать ли пузырь с репликой рядом с маскотом */
  withSpeech?: boolean
}

/** Сколько миллисекунд висит реплика, прежде чем исчезнуть самой */
const SPEECH_LIFETIME_MS = 1800

/** Цвет пузыря в зависимости от настроения реплики */
const bubbleClass: Record<string, string> = {
  correct: 'border-ok/40 bg-ok/15 text-ok',
  wrong: 'border-bad/40 bg-bad/15 text-bad',
  streak: 'border-accent/40 bg-accent/15 text-accent',
}

/**
 * Маскот приложения — гифка с самураем. При withSpeech рядом с ним
 * появляется пузырь с репликой из общего хранилища useMascotStore —
 * так тест (и что угодно ещё) может «попросить» маскота что-то сказать,
 * даже если сам маскот живёт совсем в другом месте дерева компонентов.
 */
export function Mascot({ size = 40, className, withSpeech = false }: MascotProps) {
  const { text, mood, key, clear } = useMascotStore()

  useEffect(() => {
    if (!withSpeech || !text) return
    const id = window.setTimeout(clear, SPEECH_LIFETIME_MS)
    return () => window.clearTimeout(id)
  }, [withSpeech, text, key, clear])

  return (
    <span className="relative inline-block">
      {withSpeech && (
        <AnimatePresence>
          {text && (
            <motion.span
              key={key}
              initial={{ opacity: 0, y: 6, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 400, damping: 24 }}
              className={clsx(
                'absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full whitespace-nowrap',
                'rounded-lg border px-2.5 py-1 text-xs font-bold shadow-lg',
                bubbleClass[mood],
              )}
            >
              {text}
            </motion.span>
          )}
        </AnimatePresence>
      )}
      <img
        src={`${import.meta.env.BASE_URL}mascot.gif`}
        alt=""
        aria-hidden="true"
        draggable={false}
        style={{ height: size, width: 'auto' }}
        className={className}
      />
    </span>
  )
}
