import { motion } from 'framer-motion'
import { Play, Volume2 } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { dataByCategory } from '../data'
import { groupByRow } from '../utils/subset'
import { StrokeAnimation } from '../components/kanji/StrokeAnimation'
import { TracingPad } from '../components/kanji/TracingPad'
import { kanjiStrokes } from '../data/kanjiStrokes'
import { speak } from '../utils/speech'
import { playClick } from '../utils/sound'

const kanjiRows = groupByRow(dataByCategory.kanji)

/** Страница «Прописи кандзи»: смотрим порядок черт и обводим от руки */
export default function KanjiWriting() {
  const [selectedId, setSelectedId] = useState(dataByCategory.kanji[0]?.id)
  const [playKey, setPlayKey] = useState(0)

  const item = dataByCategory.kanji.find((k) => k.id === selectedId) ?? dataByCategory.kanji[0]
  const hasStrokes = Boolean(kanjiStrokes[item?.char ?? ''])

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">書き方</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Прописи кандзи</h1>
        <p className="mt-2 text-sm text-fg/50">
          Смотри порядок черт и обводи иероглиф от руки — настоящие данные о письме, а не догадки
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(0,320px)]">
        {/* Панели анимации и обводки */}
        <div className="glass rounded-lg p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="jp text-4xl font-bold">{item?.char}</div>
              <div className="mt-1 text-sm text-fg/50">
                {item?.romaji} — {item?.meaning}
              </div>
            </div>
            <button
              onClick={() => item && speak(item.char)}
              className="rounded-lg p-2 text-fg/40 transition hover:bg-fg/10 hover:text-accent"
              aria-label="Послушать"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {!hasStrokes ? (
            <div className="mt-6 rounded-lg bg-surface-2 p-6 text-center text-sm text-fg/50">
              Для этого знака пока нет данных о порядке черт
            </div>
          ) : (
            <div className="mt-6 flex flex-col items-center gap-8 sm:flex-row sm:items-start sm:justify-center">
              <div className="flex flex-col items-center gap-3">
                <StrokeAnimation char={item.char} playKey={playKey} size={220} />
                <button
                  onClick={() => {
                    playClick()
                    setPlayKey((k) => k + 1)
                  }}
                  className="glass-soft flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-fg/70 transition hover:text-fg"
                >
                  <Play size={13} /> Показать порядок
                </button>
              </div>

              <TracingPad char={item.char} size={220} />
            </div>
          )}
        </div>

        {/* Список кандзи по темам */}
        <div className="glass max-h-[600px] overflow-y-auto rounded-lg p-4">
          {kanjiRows.map((row) => (
            <div key={row.name} className="mb-4">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg/40">
                {row.name}
              </h3>
              <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8 lg:grid-cols-6">
                {row.items.map((k) => (
                  <motion.button
                    key={k.id}
                    onClick={() => {
                      setSelectedId(k.id)
                      setPlayKey((v) => v + 1)
                    }}
                    whileTap={{ scale: 0.92 }}
                    className={clsx(
                      'jp flex aspect-square items-center justify-center rounded text-lg font-semibold transition-colors',
                      k.id === selectedId
                        ? 'bg-accent text-white'
                        : 'bg-surface-2 text-fg/70 hover:text-fg',
                    )}
                  >
                    {k.char}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
