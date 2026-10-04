import { AnimatePresence, motion } from 'framer-motion'
import { Volume2 } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { landmarks } from '../data/japanMap'
import type { Landmark } from '../data/japanMap'
import { prefectures } from '../data/prefectures'
import { speak } from '../utils/speech'

const VIEW_W = 437.33432
const VIEW_H = 516.01587

/** Одна мигающая метка на карте */
function Pin({
  landmark,
  active,
  onClick,
}: {
  landmark: Landmark
  active: boolean
  onClick: () => void
}) {
  return (
    <g
      transform={`translate(${landmark.x} ${landmark.y})`}
      onClick={onClick}
      className="cursor-pointer"
    >
      {active && (
        <motion.circle
          r={4}
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth={1}
          initial={{ r: 4, opacity: 0.8 }}
          animate={{ r: 11, opacity: 0 }}
          transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <circle
        r={active ? 4.5 : 3.2}
        fill={active ? 'var(--color-accent)' : 'var(--color-surface-2)'}
        stroke="var(--color-accent)"
        strokeWidth={active ? 0 : 1}
        className="transition-all"
      />
      <circle r={1.2} fill={active ? 'white' : 'var(--color-accent)'} />
    </g>
  )
}

/** Страница «Карта Японии»: настоящие контуры префектур с достопримечательностями */
export default function JapanMap() {
  const [selectedId, setSelectedId] = useState<string>('tokyo')
  const [hoverPref, setHoverPref] = useState<string | null>(null)
  const selected = landmarks.find((l) => l.id === selectedId) ?? landmarks[0]

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">日本地図</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Карта Японии</h1>
        <p className="mt-2 text-sm text-fg/50">
          Нажимай на точки, чтобы узнать про город или гору — все 47 префектур на настоящих контурах
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,520px)_1fr]">
        {/* Сама карта */}
        <div className="glass rounded-lg p-3 sm:p-4">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="mx-auto h-auto w-full"
            role="img"
            aria-label="Карта Японии по префектурам с метками городов"
          >
            {prefectures.map((pref) => (
              <path
                key={pref.id}
                d={pref.path}
                fill={hoverPref === pref.id ? 'var(--color-accent)' : 'var(--color-surface-2)'}
                fillOpacity={hoverPref === pref.id ? 0.35 : 1}
                stroke="var(--color-accent)"
                strokeOpacity={0.45}
                strokeWidth={0.6}
                onMouseEnter={() => setHoverPref(pref.id)}
                onMouseLeave={() => setHoverPref((v) => (v === pref.id ? null : v))}
              >
                <title>{pref.nameRu}</title>
              </path>
            ))}

            {landmarks.map((landmark) => (
              <Pin
                key={landmark.id}
                landmark={landmark}
                active={landmark.id === selectedId}
                onClick={() => setSelectedId(landmark.id)}
              />
            ))}
          </svg>

          <p className="mt-2 text-center text-[11px] text-fg/35">
            Наведи на область, чтобы увидеть название префектуры
          </p>
        </div>

        {/* Список городов + карточка выбранного места */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {landmarks.map((landmark) => (
              <button
                key={landmark.id}
                onClick={() => setSelectedId(landmark.id)}
                className={clsx(
                  'rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                  landmark.id === selectedId
                    ? 'bg-accent text-white'
                    : 'glass-soft text-fg/60 hover:text-fg',
                )}
              >
                {landmark.name}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selected.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.18 }}
              className="glass rounded-lg p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-fg/45">
                    {selected.region}
                  </span>
                  <h2 className="mt-2 text-2xl font-bold">{selected.name}</h2>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="jp text-lg text-fg/70">{selected.kanji}</span>
                    <span className="text-sm text-fg/40">{selected.romaji}</span>
                    <button
                      onClick={() => speak(selected.kanji)}
                      className="rounded p-1 text-fg/40 transition hover:bg-fg/10 hover:text-accent"
                      aria-label="Послушать"
                    >
                      <Volume2 size={14} />
                    </button>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm leading-relaxed text-fg/70">{selected.description}</p>

              <ul className="mt-4 space-y-2">
                {selected.highlights.map((point, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-fg/65">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                    {point}
                  </li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
