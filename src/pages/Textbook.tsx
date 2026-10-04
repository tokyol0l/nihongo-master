import { useEffect, useRef, useState } from 'react'
import { FileUp, RotateCcw, Upload } from 'lucide-react'
import { loadLocalFile, removeLocalFile, saveLocalFile } from '../utils/localFileStore'

const STORAGE_KEY = 'textbook'

/**
 * Страница «Учебник»: просмотр PDF прямо в браузере, без парсинга.
 *
 * Сам файл учебника в проект не входит (это чужой коммерческий материал —
 * его нельзя раздавать всем посетителям публичного сайта). Вместо этого
 * каждый использует свою собственную, уже имеющуюся у него копию:
 * - на личном компьютере разработчика файл может лежать в public/textbook.pdf
 *   (не отслеживается git'ом) — тогда он подхватывается автоматически;
 * - у любого другого человека приложение просто предложит один раз
 *   выбрать свой PDF с диска. Файл остаётся только в этом браузере
 *   (IndexedDB) и никуда не отправляется — ни на сервер, ни куда-либо ещё.
 */
export default function Textbook() {
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [source, setSource] = useState<'bundled' | 'local' | null>(null)
  const [checking, setChecking] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false

    async function init() {
      // 1) Уже выбирал файл раньше — он сохранён в этом браузере
      const stored = await loadLocalFile(STORAGE_KEY)
      if (stored && !cancelled) {
        setFileUrl(URL.createObjectURL(stored))
        setSource('local')
        setChecking(false)
        return
      }

      // 2) На этом компьютере файл лежит в public/ (личная сборка разработчика)
      try {
        const res = await fetch('/textbook.pdf', { method: 'HEAD' })
        if (res.ok && !cancelled) {
          setFileUrl('/textbook.pdf')
          setSource('bundled')
          setChecking(false)
          return
        }
      } catch {
        // игнорируем — просто нет файла
      }

      if (!cancelled) setChecking(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [])

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    await saveLocalFile(STORAGE_KEY, file)
    setFileUrl(URL.createObjectURL(file))
    setSource('local')
  }

  async function forgetFile() {
    await removeLocalFile(STORAGE_KEY)
    setFileUrl(null)
    setSource(null)
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-7rem)] max-w-6xl flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="jp text-sm text-fg/40">教科書</div>
          <h1 className="text-3xl font-bold sm:text-4xl">Учебник</h1>
          <p className="mt-1 text-sm text-fg/50">Открой свой PDF учебника — он останется только у тебя в браузере</p>
        </div>

        {fileUrl && source === 'local' && (
          <button
            onClick={forgetFile}
            className="glass-soft flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold text-fg/70 transition hover:text-fg"
          >
            <RotateCcw size={14} /> Выбрать другой файл
          </button>
        )}
      </div>

      {checking ? (
        <div className="glass flex flex-1 items-center justify-center rounded-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-fg/15 border-t-sakura" />
        </div>
      ) : fileUrl ? (
        <div className="glass flex-1 overflow-hidden rounded-lg">
          <iframe src={fileUrl} title="Учебник" className="h-full w-full rounded-lg" />
        </div>
      ) : (
        <div className="glass flex flex-1 flex-col items-center justify-center gap-6 rounded-lg p-8 text-center">
          <div className="rounded-full bg-accent/10 p-5">
            <FileUp size={40} className="text-accent" />
          </div>

          <div className="max-w-md space-y-3">
            <h2 className="text-lg font-bold">Учебника пока нет</h2>
            <p className="text-sm text-fg/60">
              У приложения нет своей копии учебника — у каждого должна быть своя, уже купленная.
              Если он у тебя скачан (например, лежит в папке <b>Загрузки</b>), просто выбери этот
              файл ниже. Он не будет никуда загружаться — останется прямо в этом браузере, как
              закладка.
            </p>
            <p className="text-xs text-fg/40">
              Подойдёт любой PDF с учебником — имя файла не важно.
            </p>
          </div>

          <button
            onClick={() => inputRef.current?.click()}
            className="flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-bold text-white transition hover:opacity-90"
          >
            <Upload size={16} /> Выбрать файл учебника
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChosen}
          />
        </div>
      )}
    </div>
  )
}
