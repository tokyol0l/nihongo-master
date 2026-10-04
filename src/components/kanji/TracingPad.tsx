import { Eraser, EyeOff, Eye } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import clsx from 'clsx'
import { kanjiStrokes } from '../../data/kanjiStrokes'
import { playClick } from '../../utils/sound'

interface TracingPadProps {
  char: string
  size?: number
}

/**
 * Холст для обводки кандзи от руки — мышью, пальцем или стилусом.
 * Полупрозрачный контур служит ориентиром, его можно спрятать,
 * чтобы проверить себя по памяти.
 */
export function TracingPad({ char, size = 260 }: TracingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawingRef = useRef(false)
  const [showGuide, setShowGuide] = useState(true)
  const data = kanjiStrokes[char]

  // При смене иероглифа холст должен очищаться
  useEffect(() => {
    clear()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [char])

  function getCanvas(): CanvasRenderingContext2D | null {
    const canvas = canvasRef.current
    return canvas ? canvas.getContext('2d') : null
  }

  function pointerPos(e: React.PointerEvent<HTMLCanvasElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - rect.left, y: e.clientY - rect.top }
  }

  function startStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    const ctx = getCanvas()
    if (!ctx) return
    drawingRef.current = true
    const { x, y } = pointerPos(e)
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineWidth = 6
    // Canvas не понимает var(...), поэтому берём уже вычисленное значение переменной темы
    const accent = getComputedStyle(e.currentTarget).getPropertyValue('--color-accent').trim()
    ctx.strokeStyle = accent || '#7c6cf5'
  }

  function moveStroke(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!drawingRef.current) return
    const ctx = getCanvas()
    if (!ctx) return
    const { x, y } = pointerPos(e)
    ctx.lineTo(x, y)
    ctx.stroke()
  }

  function endStroke() {
    drawingRef.current = false
  }

  function clear() {
    const canvas = canvasRef.current
    const ctx = getCanvas()
    if (!canvas || !ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="relative overflow-hidden rounded-lg border border-line bg-surface"
        style={{ width: size, height: size }}
      >
        {/* Направляющие линии и полупрозрачный ориентир */}
        <svg
          viewBox={data?.viewbox ?? '0 0 109 109'}
          width={size}
          height={size}
          className="absolute inset-0"
        >
          <line x1="50%" y1="0" x2="50%" y2="100%" stroke="var(--color-line)" strokeWidth={0.6} />
          <line x1="0" y1="50%" x2="100%" y2="50%" stroke="var(--color-line)" strokeWidth={0.6} />
          {showGuide &&
            data?.strokes.map((d, i) => (
              <path
                key={i}
                d={d}
                fill="none"
                stroke="var(--color-fg)"
                strokeOpacity={0.18}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            ))}
        </svg>

        {/* Сам холст для рисования пальцем/мышью поверх ориентира */}
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          className="absolute inset-0 touch-none"
          onPointerDown={startStroke}
          onPointerMove={moveStroke}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
        />
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => {
            playClick()
            clear()
          }}
          className="glass-soft flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold text-fg/70 transition hover:text-fg"
        >
          <Eraser size={13} /> Стереть
        </button>
        <button
          onClick={() => {
            playClick()
            setShowGuide((v) => !v)
          }}
          className={clsx(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
            showGuide ? 'glass-soft text-fg/70 hover:text-fg' : 'bg-accent text-white',
          )}
        >
          {showGuide ? <EyeOff size={13} /> : <Eye size={13} />}
          {showGuide ? 'Спрятать образец' : 'Показать образец'}
        </button>
      </div>
    </div>
  )
}
