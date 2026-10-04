import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Check, Lock } from 'lucide-react'
import clsx from 'clsx'
import { useRoadmap } from '../hooks/useRoadmap'
import type { StepState } from '../hooks/useRoadmap'

/** Как выглядит кружок шага в каждом состоянии */
const circleStyles: Record<StepState, string> = {
  done: 'border-ok bg-ok text-white',
  current: 'border-accent bg-accent text-white',
  locked: 'border-line bg-surface text-fg/30',
}

/** Страница «Дорожная карта»: весь путь до N5 по шагам */
export default function Roadmap() {
  const { steps } = useRoadmap()
  const doneCount = steps.filter((s) => s.state === 'done').length

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-8 text-center">
        <div className="jp text-sm text-fg/40">ロードマップ</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Дорожная карта</h1>
        <p className="mt-2 text-sm text-fg/50">
          Путь до уровня N5 по шагам. Пройдено {doneCount} из {steps.length}
        </p>
      </div>

      <div className="relative">
        {/* Пунктирная линия, вдоль которой стоят шаги */}
        <div className="absolute bottom-6 left-6 top-6 w-px border-l border-dashed border-line sm:left-1/2" />

        <div className="space-y-4">
          {steps.map((item, i) => {
            const locked = item.state === 'locked'

            return (
              <motion.div
                key={item.step.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="relative flex items-start gap-4 sm:gap-6"
              >
                {/* Кружок с номером или галочкой */}
                <div
                  className={clsx(
                    'relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 text-sm font-bold',
                    circleStyles[item.state],
                    'sm:absolute sm:left-1/2 sm:-translate-x-1/2',
                  )}
                >
                  {item.state === 'done' ? (
                    <Check size={20} strokeWidth={3} />
                  ) : locked ? (
                    <Lock size={16} />
                  ) : (
                    i + 1
                  )}
                </div>

                {/* Карточка шага: слева или справа от линии */}
                <div
                  className={clsx(
                    'glass min-w-0 flex-1 rounded-lg p-4 sm:w-[calc(50%-3rem)] sm:flex-none',
                    i % 2 === 0 ? 'sm:mr-auto' : 'sm:ml-auto',
                    item.state === 'current' && 'border-accent',
                    locked && 'opacity-60',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="text-sm font-bold">{item.step.title}</h2>
                      <p className="mt-0.5 text-xs text-fg/45">{item.step.hint}</p>
                    </div>
                    {item.state === 'current' && (
                      <Link
                        to={item.step.to}
                        className="flex shrink-0 items-center gap-1 rounded bg-accent px-2.5 py-1.5 text-xs font-bold text-white"
                      >
                        Идти <ArrowRight size={12} />
                      </Link>
                    )}
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-fg/10">
                      <div
                        className={clsx(
                          'h-full rounded-full',
                          item.state === 'done' ? 'bg-ok' : 'bg-accent',
                        )}
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[11px] text-fg/45">
                      {item.known} / {item.total}
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
