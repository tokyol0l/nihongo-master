import { AnimatePresence, motion } from 'framer-motion'
import { Check, RefreshCw, RotateCcw, TrendingUp, X } from 'lucide-react'
import { useState, useMemo } from 'react'
import clsx from 'clsx'
import { sentencePuzzles } from '../data/sentencePuzzles'
import type { SentencePuzzle } from '../data/sentencePuzzles'
import { shuffle, pickRandom } from '../utils/shuffle'
import { playClick, playCorrect, playWrong } from '../utils/sound'
import { ProgressBar } from '../components/ui/ProgressBar'
import { Button } from '../components/ui/Button'
import { useProgressStore } from '../store/useProgressStore'

/** Сколько предложений в одной игровой сессии */
const SESSION_SIZE = 10

const levelLabel: Record<SentencePuzzle['level'], string> = {
  easy: 'Просто',
  medium: 'Средне',
  hard: 'Сложно',
}

/** Один тег-плитка со словом */
function Tile({
  text,
  onClick,
  disabled,
}: {
  text: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <motion.button
      layout
      onClick={onClick}
      disabled={disabled}
      whileTap={{ scale: 0.95 }}
      className={clsx(
        'jp rounded-lg border border-line bg-surface px-3 py-2.5 text-base font-semibold transition-colors',
        disabled ? 'opacity-40' : 'hover:border-accent',
      )}
    >
      {text}
    </motion.button>
  )
}

/** Определяет, какие уровни сложности показывать на основе успешности */
function getAvailableLevels(stats: Record<'easy' | 'medium' | 'hard', { correct: number; wrong: number }>): ('easy' | 'medium' | 'hard')[] {
  const easyTotal = stats.easy.correct + stats.easy.wrong
  const mediumTotal = stats.medium.correct + stats.medium.wrong
  const hardTotal = stats.hard.correct + stats.hard.wrong

  const easySuccessRate = easyTotal > 0 ? stats.easy.correct / easyTotal : 0.5
  const mediumSuccessRate = mediumTotal > 0 ? stats.medium.correct / mediumTotal : 0.5

  const levels: ('easy' | 'medium' | 'hard')[] = ['easy']

  // Если простые хорошо идут (>70%) и есть средние, добавляем средние
  if (easySuccessRate > 0.7 && mediumTotal > 0) {
    levels.push('medium')
  }

  // Если средние хорошо идут (>70%) и есть сложные, добавляем сложные
  if (mediumSuccessRate > 0.7 && hardTotal > 0) {
    levels.push('hard')
  }

  // Если все идёт плохо, фокусируемся только на простых
  if (mediumSuccessRate < 0.4 && easySuccessRate < 0.5) {
    return ['easy']
  }

  return levels
}

/** Страница-игра «Собери предложение» из слов-плиток в правильном порядке */
export default function SentenceBuilder() {
  const sentenceStats = useProgressStore((s) => s.sentenceStats)
  const recordSentenceAnswer = useProgressStore((s) => s.recordSentenceAnswer)

  // Определяем доступные уровни на основе статистики
  const availableLevels = useMemo(() => getAvailableLevels(sentenceStats), [sentenceStats])

  // Выбираем из доступных уровней
  const availablePuzzles = useMemo(
    () => sentencePuzzles.filter((p) => availableLevels.includes(p.level)),
    [availableLevels],
  )

  const [session] = useState<SentencePuzzle[]>(() => pickRandom(availablePuzzles, SESSION_SIZE))
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [pool, setPool] = useState<string[]>(() => shuffle(session[0]?.tiles ?? []))
  const [checked, setChecked] = useState<boolean | null>(null)
  const [finished, setFinished] = useState(false)

  const puzzle = session[index]

  function loadPuzzle(i: number) {
    const p = session[i]
    setPicked([])
    setPool(shuffle(p.tiles))
    setChecked(null)
  }

  function pick(tile: string, fromPoolIndex: number) {
    if (checked !== null) return
    playClick()
    setPicked((p) => [...p, tile])
    setPool((p) => p.filter((_, i) => i !== fromPoolIndex))
  }

  function unpick(tile: string, fromPickedIndex: number) {
    if (checked !== null) return
    playClick()
    setPool((p) => [...p, tile])
    setPicked((p) => p.filter((_, i) => i !== fromPickedIndex))
  }

  function check() {
    const isCorrect = picked.join('') === puzzle.tiles.join('')
    setChecked(isCorrect)
    if (isCorrect) {
      setScore((s) => s + 1)
      playCorrect()
    } else {
      playWrong()
    }
    // Записываем результат в статистику
    recordSentenceAnswer(puzzle.level, isCorrect)
  }

  function next() {
    if (index + 1 >= session.length) {
      setFinished(true)
      return
    }
    const nextIndex = index + 1
    setIndex(nextIndex)
    loadPuzzle(nextIndex)
  }

  function restart() {
    setIndex(0)
    setScore(0)
    setFinished(false)
    loadPuzzle(0)
  }

  if (finished) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <motion.div
          className="glass rounded-lg p-8"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="jp text-sm text-fg/40">できました</div>
          <h2 className="mt-1 text-2xl font-bold">Готово!</h2>
          <p className="mt-3 text-4xl font-bold text-accent">
            {score}/{session.length}
          </p>
          <p className="mt-2 text-sm text-fg/55">предложений собрано верно</p>
          <Button full onClick={restart} className="mt-6">
            <RefreshCw size={16} /> Ещё раз
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">文を作ろう</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Собери предложение</h1>
        <p className="mt-2 text-sm text-fg/50">
          Расставь плитки по порядку, чтобы получилось верное предложение
        </p>

        {/* Показываем адаптивный уровень и статистику */}
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {availableLevels.map((level: 'easy' | 'medium' | 'hard') => {
            const stats = sentenceStats[level]
            const total = stats.correct + stats.wrong
            const rate = total > 0 ? Math.round((stats.correct / total) * 100) : 0
            const label: Record<string, string> = { easy: 'Просто', medium: 'Средне', hard: 'Сложно' }
            const levelLabel = label[level] || level
            return (
              <div
                key={level}
                className="flex items-center gap-2 rounded-lg bg-surface-2 px-3 py-1.5 text-xs font-semibold"
              >
                <TrendingUp size={12} className="text-accent" />
                <span>{levelLabel}</span>
                {total > 0 && <span className="text-fg/50">({rate}%)</span>}
              </div>
            )
          })}
        </div>
      </div>

      <div className="mb-5 flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={(index / session.length) * 100} showValue={false} />
        </div>
        <span className="text-sm font-bold text-fg/60">
          {index + 1}/{session.length}
        </span>
        <span className="rounded-lg bg-fg/10 px-2.5 py-1 text-xs font-bold text-ok">{score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={puzzle.id}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <div className="mb-4 flex items-center justify-between">
            <span className="rounded bg-surface-2 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-fg/45">
              {levelLabel[puzzle.level]}
            </span>
            <span className="text-xs text-fg/40">{puzzle.ru}</span>
          </div>

          {/* Собранное предложение */}
          <div className="glass mb-4 flex min-h-[76px] flex-wrap items-center gap-2 rounded-lg p-4">
            {picked.length === 0 && (
              <span className="text-sm text-fg/30">Нажимай на плитки снизу по порядку</span>
            )}
            {picked.map((tile, i) => (
              <Tile key={`${tile}-${i}`} text={tile} onClick={() => unpick(tile, i)} />
            ))}
          </div>

          {/* Банк плиток */}
          <div className="mb-6 flex flex-wrap gap-2">
            {pool.map((tile, i) => (
              <Tile key={`${tile}-${i}`} text={tile} onClick={() => pick(tile, i)} />
            ))}
          </div>

          {checked !== null && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={clsx(
                'mb-4 flex items-start gap-2 rounded-lg p-4 text-sm',
                checked ? 'bg-ok/10 text-ok' : 'bg-bad/10 text-bad',
              )}
            >
              {checked ? <Check size={16} className="mt-0.5 shrink-0" /> : <X size={16} className="mt-0.5 shrink-0" />}
              <span>
                {!checked && <span className="jp font-semibold">{puzzle.tiles.join('')} — </span>}
                {puzzle.romaji} · {puzzle.ru}
              </span>
            </motion.div>
          )}

          <div className="flex gap-3">
            {checked === null ? (
              <>
                <Button
                  full
                  disabled={picked.length !== puzzle.tiles.length}
                  onClick={check}
                >
                  Проверить
                </Button>
                {picked.length > 0 && (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      playClick()
                      setPool(shuffle(puzzle.tiles))
                      setPicked([])
                    }}
                  >
                    <RotateCcw size={16} />
                  </Button>
                )}
              </>
            ) : (
              <Button full onClick={next}>
                Дальше
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
