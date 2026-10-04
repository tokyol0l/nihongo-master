import { motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import type { GrammarLesson } from '../../data/grammar'
import { speak } from '../../utils/speech'
import { FuriganaText } from '../ui/FuriganaText'

/** Вкладка «Теория»: карточки грамматических пунктов урока */
export function TheoryTab({ lesson }: { lesson: GrammarLesson }) {
  return (
    <div className="space-y-4">
      {lesson.points.map((point, i) => (
        <motion.div
          key={point.id}
          className="glass rounded-lg p-4 sm:p-5"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <div className="jp mb-1 inline-block rounded bg-surface-2 px-2.5 py-1 text-sm font-bold text-accent">
            {point.pattern}
          </div>
          <h3 className="mt-1 text-base font-bold">{point.title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-fg/70">{point.explanation}</p>

          <div className="mt-3 space-y-2">
            {point.examples.map((ex, exIndex) => (
              <div
                key={exIndex}
                className="flex items-start gap-2 rounded bg-surface-2 p-3 text-sm"
              >
                <button
                  onClick={() => speak(ex.jp)}
                  className="mt-0.5 shrink-0 rounded p-1 text-fg/40 transition hover:bg-fg/10 hover:text-accent"
                  aria-label="Послушать"
                >
                  <Volume2 size={14} />
                </button>
                <div className="min-w-0">
                  <FuriganaText text={ex.jp} className="jp font-semibold" />
                  <div className="text-xs text-fg/45">{ex.romaji}</div>
                  <div className="text-xs text-fg/65">{ex.ru}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  )
}
