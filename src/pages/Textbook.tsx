import { useEffect, useRef, useState } from 'react'
import { FileUp, Maximize2, Minimize2, Plus, Trash2, Upload } from 'lucide-react'
import { loadLocalFile, removeLocalFile, saveLocalFile } from '../utils/localFileStore'

/** Список вкладок-учебников хранится тут — просто имена и id, сами файлы в IndexedDB */
const SLOTS_KEY = 'nihongo-master-textbook-slots'
/** Префикс ключа файла в IndexedDB для вкладки с этим id */
const fileKey = (id: string) => `textbook-${id}`
/** Ключ для запомненной страницы каждой вкладки */
const pageKey = (id: string) => `nihongo-master-textbook-page-${id}`

interface TextbookSlot {
  id: string
  name: string
}

function loadSlots(): TextbookSlot[] {
  try {
    const raw = localStorage.getItem(SLOTS_KEY)
    if (!raw) return [{ id: 'default', name: 'Учебник' }]
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [{ id: 'default', name: 'Учебник' }]
  } catch {
    return [{ id: 'default', name: 'Учебник' }]
  }
}

function saveSlots(slots: TextbookSlot[]) {
  localStorage.setItem(SLOTS_KEY, JSON.stringify(slots))
}

/**
 * Страница «Учебник»: просмотр PDF прямо в браузере, без парсинга.
 * Можно держать сразу несколько книг — у каждой своя вкладка сверху,
 * свой файл в этом браузере. Добавить книгу — кнопка «+», переименовать
 * нельзя (удали и создай заново с нужным именем), убрать — корзина.
 *
 * Файлы учебников в проект не входят (чужой коммерческий материал — его
 * нельзя раздавать всем посетителям публичного сайта). Каждый использует
 * свою собственную, уже имеющуюся у него копию — она остаётся только в
 * этом браузере (IndexedDB) и никуда не отправляется.
 */
export default function Textbook() {
  const [slots, setSlots] = useState<TextbookSlot[]>(() => loadSlots())
  const [activeId, setActiveId] = useState(() => loadSlots()[0]?.id ?? 'default')
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [checking, setChecking] = useState(true)
  const [page, setPage] = useState('')
  const [fullscreen, setFullscreen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const active = slots.find((s) => s.id === activeId) ?? slots[0]

  // Следим за полноэкранным режимом снаружи (Esc тоже должен сбрасывать кнопку)
  useEffect(() => {
    const onChange = () => setFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onChange)
    return () => document.removeEventListener('fullscreenchange', onChange)
  }, [])

  function toggleFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      containerRef.current?.requestFullscreen()
    }
  }

  function goToPage(e: React.FormEvent) {
    e.preventDefault()
    const n = parseInt(page, 10)
    if (!n || n < 1 || !fileUrl) return
    localStorage.setItem(pageKey(activeId), String(n))
    // Меняем src целиком, чтобы встроенный просмотрщик точно перескочил
    const base = fileUrl.split('#')[0]
    setFileUrl(`${base}#page=${n}`)
  }

  // Подгружаем файл активной вкладки при каждом переключении
  useEffect(() => {
    let cancelled = false
    setChecking(true)
    setFileUrl(null)

    async function init() {
      const savedPage = localStorage.getItem(pageKey(activeId))
      setPage(savedPage ?? '')
      const hash = savedPage ? `#page=${savedPage}` : ''

      // 1) Уже выбирал файл для этой вкладки раньше
      const stored = await loadLocalFile(fileKey(activeId))
      if (stored && !cancelled) {
        setFileUrl(`${URL.createObjectURL(stored)}${hash}`)
        setChecking(false)
        return
      }

      // 2) Для вкладки по умолчанию — проверяем public/textbook.pdf
      //    (личная сборка разработчика, не отслеживается git'ом)
      if (activeId === 'default') {
        const bundledUrl = `${import.meta.env.BASE_URL}textbook.pdf`
        try {
          const res = await fetch(bundledUrl, { method: 'HEAD' })
          if (res.ok && !cancelled) {
            setFileUrl(`${bundledUrl}${hash}`)
            setChecking(false)
            return
          }
        } catch {
          // файла нет — ничего страшного
        }
      }

      if (!cancelled) setChecking(false)
    }

    init()
    return () => {
      cancelled = true
    }
  }, [activeId])

  async function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file || !active) return

    await saveLocalFile(fileKey(active.id), file)
    setFileUrl(URL.createObjectURL(file))
  }

  function addSlot() {
    const name = window.prompt('Название учебника (например, «Кандзи» или «Грамматика»):')
    if (!name || !name.trim()) return

    const id = `slot-${Date.now()}`
    const next = [...slots, { id, name: name.trim() }]
    setSlots(next)
    saveSlots(next)
    setActiveId(id)
  }

  async function removeSlot(id: string) {
    if (slots.length <= 1) return
    if (!window.confirm('Убрать эту вкладку и её файл?')) return

    await removeLocalFile(fileKey(id))
    const next = slots.filter((s) => s.id !== id)
    setSlots(next)
    saveSlots(next)
    if (activeId === id) setActiveId(next[0].id)
  }

  return (
    <div
      ref={containerRef}
      className={
        fullscreen
          ? 'flex h-screen w-screen flex-col bg-bg p-3'
          : 'mx-auto flex h-[calc(100vh-6rem)] w-full flex-col'
      }
    >
      {!fullscreen && (
        <div className="mb-3">
          <div className="jp text-sm text-fg/40">教科書</div>
          <h1 className="text-3xl font-bold sm:text-4xl">Учебник</h1>
          <p className="mt-1 text-sm text-fg/50">Можно держать несколько книг — переключайся вкладками</p>
        </div>
      )}

      {/* Вкладки учебников */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {slots.map((slot) => (
          <div key={slot.id} className="group relative">
            <button
              onClick={() => setActiveId(slot.id)}
              className={
                slot.id === activeId
                  ? 'rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-white'
                  : 'glass-soft rounded-lg px-3 py-1.5 text-sm font-semibold text-fg/70 transition hover:text-fg'
              }
            >
              {slot.name}
            </button>
            {slots.length > 1 && (
              <button
                onClick={() => removeSlot(slot.id)}
                aria-label={`Убрать «${slot.name}»`}
                className="absolute -right-1.5 -top-1.5 hidden rounded-full bg-bad p-0.5 text-white group-hover:block"
              >
                <Trash2 size={11} />
              </button>
            )}
          </div>
        ))}
        <button
          onClick={addSlot}
          className="glass-soft flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-semibold text-fg/60 transition hover:text-fg"
        >
          <Plus size={14} /> Добавить
        </button>

        <div className="ml-auto flex items-center gap-2">
          {fileUrl && (
            <form onSubmit={goToPage} className="flex items-center gap-1">
              <input
                type="number"
                min={1}
                value={page}
                onChange={(e) => setPage(e.target.value)}
                placeholder="Стр."
                className="glass-soft w-16 rounded-lg px-2 py-1.5 text-sm"
              />
              <button
                type="submit"
                className="glass-soft rounded-lg px-2.5 py-1.5 text-xs font-semibold text-fg/60 transition hover:text-fg"
              >
                Перейти
              </button>
            </form>
          )}
          <button
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Выйти из полноэкранного режима' : 'На весь экран'}
            className="glass-soft rounded-lg p-1.5 text-fg/60 transition hover:text-fg"
          >
            {fullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {checking ? (
        <div className="glass flex flex-1 items-center justify-center rounded-lg">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-fg/15 border-t-sakura" />
        </div>
      ) : fileUrl ? (
        <div className="glass flex-1 overflow-hidden rounded-lg">
          <iframe src={fileUrl} title={active?.name ?? 'Учебник'} className="h-full w-full rounded-lg" />
        </div>
      ) : (
        <div className="glass flex flex-1 flex-col items-center justify-center gap-6 rounded-lg p-8 text-center">
          <div className="rounded-full bg-accent/10 p-5">
            <FileUp size={40} className="text-accent" />
          </div>

          <div className="max-w-md space-y-3">
            <h2 className="text-lg font-bold">Для «{active?.name}» пока нет файла</h2>
            <p className="text-sm text-fg/60">
              У приложения нет своей копии учебника — у каждого должна быть своя, уже купленная.
              Если он у тебя скачан (например, лежит в папке <b>Загрузки</b>), просто выбери этот
              файл ниже. Он не будет никуда загружаться — останется прямо в этом браузере, как
              закладка.
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
