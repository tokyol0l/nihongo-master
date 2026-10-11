import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react'
import * as pdfjsLib from 'pdfjs-dist'
import type { PDFDocumentProxy, RenderTask } from 'pdfjs-dist'
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl

const CMAP_URL = `${import.meta.env.BASE_URL}pdfjs/cmaps/`
const STANDARD_FONT_URL = `${import.meta.env.BASE_URL}pdfjs/standard_fonts/`

interface PdfViewerProps {
  /** Blob- или обычный URL PDF-файла, без #page=N — страницей управляет сам компонент */
  src: string
  /** С какой страницы открыть (если известна сохранённая позиция) */
  initialPage?: number
  /** Вызывается при каждой смене страницы — для сохранения позиции снаружи */
  onPageChange?: (page: number, totalPages: number) => void
}

/**
 * Собственный просмотрщик PDF на pdfjs-dist (вместо встроенного в браузер),
 * чтобы точно знать текущую страницу и уметь её запоминать — встроенный
 * просмотрщик браузера такой возможности не даёт.
 */
export default function PdfViewer({ src, initialPage, onPageChange }: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const docRef = useRef<PDFDocumentProxy | null>(null)
  const renderTaskRef = useRef<RenderTask | null>(null)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [numPages, setNumPages] = useState(0)
  const [pageNum, setPageNum] = useState(1)
  const [pageInput, setPageInput] = useState('')
  const [scale, setScale] = useState(1.3)

  // Загружаем документ при смене файла.
  // Эффект в StrictMode (dev) запускается дважды подряд с немедленной
  // отменой первого запуска — без флага cancelled отменённая первая
  // загрузка успевала бы записать ошибку поверх успеха второй.
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setNumPages(0)
    docRef.current = null

    const loadingTask = pdfjsLib.getDocument({
      url: src,
      cMapUrl: CMAP_URL,
      cMapPacked: true,
      standardFontDataUrl: STANDARD_FONT_URL,
    })

    loadingTask.promise
      .then((doc) => {
        if (cancelled) return
        docRef.current = doc
        setNumPages(doc.numPages)
        const start = initialPage && initialPage >= 1 && initialPage <= doc.numPages ? initialPage : 1
        setPageNum(start)
        setLoading(false)
      })
      .catch((err: unknown) => {
        if (cancelled) return
        const message = err instanceof Error ? err.message : 'Не удалось открыть файл'
        setError(message)
        setLoading(false)
      })

    return () => {
      cancelled = true
      loadingTask.destroy()
    }
    // initialPage читаем только при смене файла, не отслеживаем отдельно
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src])

  // Рисуем текущую страницу на canvas
  useEffect(() => {
    const doc = docRef.current
    const canvas = canvasRef.current
    if (!doc || !canvas || loading) return

    let cancelled = false

    doc.getPage(pageNum).then((page) => {
      if (cancelled) return
      const viewport = page.getViewport({ scale })
      canvas.width = viewport.width
      canvas.height = viewport.height
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      renderTaskRef.current?.cancel()
      const task = page.render({ canvasContext: ctx, viewport, canvas })
      renderTaskRef.current = task
      task.promise.catch(() => {
        // отменённый рендер — ожидаемо при быстром листании
      })
    })

    return () => {
      cancelled = true
    }
  }, [pageNum, scale, loading])

  // Сообщаем наружу о смене страницы (не при самой загрузке документа)
  useEffect(() => {
    if (!loading && numPages > 0) onPageChange?.(pageNum, numPages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageNum, loading, numPages])

  function goPrev() {
    setPageNum((p) => Math.max(1, p - 1))
  }
  function goNext() {
    setPageNum((p) => Math.min(numPages, p + 1))
  }
  function submitPage(e: React.FormEvent) {
    e.preventDefault()
    const n = parseInt(pageInput, 10)
    if (n >= 1 && n <= numPages) setPageNum(n)
    setPageInput('')
  }
  function zoomIn() {
    setScale((s) => Math.min(3, +(s + 0.2).toFixed(2)))
  }
  function zoomOut() {
    setScale((s) => Math.max(0.5, +(s - 0.2).toFixed(2)))
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowLeft') goPrev()
    if (e.key === 'ArrowRight') goNext()
  }

  if (error) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-sm font-semibold text-bad">Не удалось открыть PDF</p>
        <p className="text-xs text-fg/50">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col" tabIndex={0} onKeyDown={onKeyDown}>
      <div className="flex flex-1 items-center justify-center overflow-auto bg-fg/5 p-4">
        {loading ? (
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-fg/15 border-t-sakura" />
        ) : (
          <canvas ref={canvasRef} className="shadow-lg" />
        )}
      </div>

      {!loading && numPages > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-3 border-t border-fg/10 px-3 py-2">
          <button
            onClick={goPrev}
            disabled={pageNum <= 1}
            className="glass-soft rounded-lg p-1.5 text-fg/60 transition hover:text-fg disabled:opacity-30"
            aria-label="Предыдущая страница"
          >
            <ChevronLeft size={16} />
          </button>

          <form onSubmit={submitPage} className="flex items-center gap-1 text-sm">
            <input
              type="number"
              min={1}
              max={numPages}
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              placeholder={String(pageNum)}
              className="glass-soft w-14 rounded-lg px-2 py-1 text-center text-sm"
            />
            <span className="text-fg/50">/ {numPages}</span>
          </form>

          <button
            onClick={goNext}
            disabled={pageNum >= numPages}
            className="glass-soft rounded-lg p-1.5 text-fg/60 transition hover:text-fg disabled:opacity-30"
            aria-label="Следующая страница"
          >
            <ChevronRight size={16} />
          </button>

          <div className="mx-1 h-4 w-px bg-fg/10" />

          <button
            onClick={zoomOut}
            className="glass-soft rounded-lg p-1.5 text-fg/60 transition hover:text-fg"
            aria-label="Уменьшить"
          >
            <ZoomOut size={16} />
          </button>
          <span className="w-10 text-center text-xs text-fg/50">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="glass-soft rounded-lg p-1.5 text-fg/60 transition hover:text-fg"
            aria-label="Увеличить"
          >
            <ZoomIn size={16} />
          </button>
        </div>
      )}
    </div>
  )
}
