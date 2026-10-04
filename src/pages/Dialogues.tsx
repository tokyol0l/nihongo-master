import { motion, AnimatePresence } from 'framer-motion'
import { Volume2, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { dialogues } from '../data/dialogues'
import { speak } from '../utils/speech'

const levelLabel: Record<'easy' | 'medium' | 'hard', string> = {
  easy: 'Просто',
  medium: 'Средне',
  hard: 'Сложно',
}

/** Страница с диалогами для практики слушания и разговора */
export default function Dialogues() {
  const [selectedId, setSelectedId] = useState(dialogues[0]?.id)
  const [expandedLines, setExpandedLines] = useState<Set<number>>(new Set())

  const selected = dialogues.find((d) => d.id === selectedId) ?? dialogues[0]

  function toggleLine(index: number) {
    const next = new Set(expandedLines)
    if (next.has(index)) next.delete(index)
    else next.add(index)
    setExpandedLines(next)
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">会話</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Диалоги</h1>
        <p className="mt-2 text-sm text-fg/50">
          Слушай и учись на реальных диалогах. Нажимай для перевода
        </p>
      </div>

      {/* Список диалогов */}
      <div className="mb-6 grid gap-2 sm:grid-cols-2">
        {dialogues.map((dialogue) => (
          <button
            key={dialogue.id}
            onClick={() => setSelectedId(dialogue.id)}
            className={clsx(
              'glass rounded-lg p-3 text-left transition-colors',
              dialogue.id === selectedId ? 'border-accent bg-accent/10' : 'hover:border-accent',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold">{dialogue.title}</h3>
                <p className="text-xs text-fg/50">{dialogue.situation}</p>
              </div>
              <span className="shrink-0 rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-bold text-fg/60">
                {levelLabel[dialogue.level]}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Диалог */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selected.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.2 }}
          className="glass rounded-lg p-6"
        >
          {/* Заголовок */}
          <div className="mb-6 border-b border-line pb-4">
            <h2 className="text-2xl font-bold">{selected.title}</h2>
            <p className="mt-1 text-sm text-fg/55">{selected.situation}</p>
          </div>

          {/* Фразы диалога */}
          <div className="space-y-4">
            {selected.lines.map((line, i) => (
              <div key={i} className="space-y-2">
                {/* Говорящий */}
                <div className="flex items-center gap-2">
                  <span className="inline-block h-6 w-6 rounded-full bg-accent/20 text-center text-xs font-bold leading-6 text-accent">
                    {line.speaker}
                  </span>
                  <span className="text-xs font-semibold text-fg/60">
                    Персона {line.speaker}
                  </span>
                </div>

                {/* Японский текст с кнопкой аудио */}
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="jp text-lg font-semibold leading-relaxed">{line.jp}</p>
                    <p className="mt-1 text-sm text-fg/50">{line.romaji}</p>
                  </div>
                  <button
                    onClick={() => speak(line.jp)}
                    className="shrink-0 rounded p-2 text-fg/40 transition hover:bg-fg/10 hover:text-accent"
                    aria-label="Послушать"
                  >
                    <Volume2 size={16} />
                  </button>
                </div>

                {/* Кнопка для перевода */}
                <button
                  onClick={() => toggleLine(i)}
                  className="flex w-full items-center gap-2 rounded-lg bg-surface-2/50 px-3 py-2 text-left text-xs font-semibold text-fg/60 transition hover:bg-surface-2"
                >
                  <ChevronDown
                    size={14}
                    className={clsx(
                      'shrink-0 transition-transform',
                      expandedLines.has(i) && 'rotate-180',
                    )}
                  />
                  {expandedLines.has(i) ? 'Скрыть перевод' : 'Показать перевод'}
                </button>

                {/* Перевод */}
                <AnimatePresence>
                  {expandedLines.has(i) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="overflow-hidden"
                    >
                      <p className="rounded-lg bg-ok/10 px-3 py-2 text-sm text-fg/70">{line.ru}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* Новые слова */}
          {selected.vocabulary.length > 0 && (
            <div className="mt-8 border-t border-line pt-6">
              <h3 className="mb-3 font-semibold">Новые слова в этом диалоге:</h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {selected.vocabulary.map((word, i) => (
                  <div
                    key={i}
                    className="flex items-start justify-between gap-2 rounded-lg bg-surface-2/50 p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="jp font-semibold">{word.jp}</p>
                      <p className="text-xs text-fg/50">{word.romaji}</p>
                      <p className="mt-1 text-sm text-fg/70">{word.ru}</p>
                    </div>
                    <button
                      onClick={() => speak(word.jp)}
                      className="shrink-0 rounded p-1.5 text-fg/40 transition hover:bg-fg/10 hover:text-accent"
                      aria-label="Послушать"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
