import { Check, Download, Snowflake, Upload, Volume2 } from 'lucide-react'
import clsx from 'clsx'
import { useEffect, useRef, useState } from 'react'
import { themes } from '../data/themes'
import { useSettingsStore } from '../store/useSettingsStore'
import { useProgressStore, STREAK_FREEZE_COST } from '../store/useProgressStore'
import { applyBackup, downloadBackup, parseBackup } from '../utils/backup'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { listJapaneseVoices, pickBestJapaneseVoice, speakWithVoice, speechSupported } from '../utils/speech'

/** Переключатель «включено / выключено» */
function Switch({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: boolean
  onChange: (next: boolean) => void
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className="glass flex w-full items-center gap-4 rounded-lg p-4 text-left transition-colors hover:border-fg/25"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{label}</span>
        <span className="block text-xs text-fg/45">{hint}</span>
      </span>
      <span
        className={clsx(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          value ? 'bg-accent' : 'bg-fg/20',
        )}
      >
        <span
          className={clsx(
            'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all',
            value ? 'left-[1.375rem]' : 'left-0.5',
          )}
        />
      </span>
    </button>
  )
}

/** Ползунок с подписью и текущим значением — для скорости и громкости голоса */
function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
  onAfterChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (next: number) => void
  /** Срабатывает когда отпустили ползунок — удобно для тестовой озвучки */
  onAfterChange?: () => void
}) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-fg/50">{format(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerUp={onAfterChange}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-fg/15 accent-accent"
      />
    </div>
  )
}

/** Страница настроек: выбор темы и мелкие переключатели */
export default function Settings() {
  const {
    theme,
    petals,
    sounds,
    animations,
    voiceName,
    voiceRate,
    voiceVolume,
    voicePitch,
    setTheme,
    setPetals,
    setSounds,
    setAnimations,
    setVoiceName,
    setVoiceRate,
    setVoiceVolume,
    setVoicePitch,
  } = useSettingsStore()
  const points = useProgressStore((s) => s.points)
  const streakFreezes = useProgressStore((s) => s.streakFreezes)
  const buyStreakFreeze = useProgressStore((s) => s.buyStreakFreeze)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [pendingBackup, setPendingBackup] = useState<ReturnType<typeof parseBackup>>(null)
  const [importError, setImportError] = useState(false)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>(() => listJapaneseVoices())
  const [shopMessage, setShopMessage] = useState<string | null>(null)

  // Голоса браузер подгружает асинхронно — список может быть пустым при первой отрисовке
  useEffect(() => {
    if (!speechSupported()) return
    const update = () => setVoices(listJapaneseVoices())
    update()
    window.speechSynthesis.addEventListener('voiceschanged', update)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])

  function handleFileChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = '' // чтобы можно было выбрать тот же файл ещё раз
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const backup = parseBackup(String(reader.result))
      if (!backup) {
        setImportError(true)
        return
      }
      setImportError(false)
      setPendingBackup(backup)
    }
    reader.readAsText(file)
  }

  function confirmImport() {
    if (!pendingBackup) return
    applyBackup(pendingBackup)
    // Перезагружаем страницу, чтобы все хранилища заново прочитали localStorage
    window.location.reload()
  }

  /** Озвучивает тестовую фразу тем голосом, который реально будет использоваться */
  function testCurrentVoice() {
    const voice = pickBestJapaneseVoice()
    if (voice) speakWithVoice('こんにちは。これはテストです。', voice)
  }

  function handleBuyFreeze() {
    const ok = buyStreakFreeze()
    setShopMessage(ok ? 'Заморозка куплена' : 'Не хватает очков')
    window.setTimeout(() => setShopMessage(null), 2500)
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <div className="jp text-sm text-fg/40">設定</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Настройки</h1>
      </div>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg/40">
          Магазин
        </h2>

        <div className="glass flex flex-wrap items-center gap-4 rounded-lg p-4">
          <span className="rounded-lg bg-aqua/15 p-2.5 text-aqua">
            <Snowflake size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-bold">Заморозка серии</div>
            <div className="text-xs text-fg/50">
              Если пропустишь день, одна заморозка спасёт streak. Сейчас есть:{' '}
              <b>{streakFreezes}</b>
            </div>
          </div>
          <Button
            variant="ghost"
            disabled={points < STREAK_FREEZE_COST}
            onClick={handleBuyFreeze}
          >
            Купить за {STREAK_FREEZE_COST} очков
          </Button>
        </div>

        {shopMessage && (
          <p className="text-xs text-fg/50">
            {shopMessage} {!shopMessage.includes('куплена') && `(у тебя ${points} очков)`}
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg/40">
          Голос озвучки
        </h2>

        {!speechSupported() ? (
          <p className="rounded-lg bg-bad/10 px-3 py-3 text-sm text-bad">
            Этот браузер вообще не умеет озвучивать текст.
          </p>
        ) : voices.length === 0 ? (
          <div className="space-y-2">
            <p className="rounded-lg bg-warn/10 px-3 py-3 text-sm text-warn">
              Браузер не нашёл ни одного японского голоса — поэтому озвучка звучит криво или
              молчит.
            </p>
            <p className="text-xs text-fg/50">
              Это чинится не в приложении, а в системе:
              <br />
              • Проще всего — открой это же приложение в <b>Microsoft Edge</b>, у него есть
              встроенные естественные японские голоса (Nanami, Keita).
              <br />
              • Или в Windows: Параметры → Время и язык → Язык и регион → добавить{' '}
              <b>японский</b> язык (поставится голос для чтения).
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-fg/50">
              Браузер нашёл {voices.length} японск{voices.length === 1 ? 'ий' : 'их'} голос
              {voices.length === 1 ? '' : 'а'}. Нажми на голос, чтобы его услышать и выбрать:
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setVoiceName(null)}
                className={clsx(
                  'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                  voiceName === null
                    ? 'bg-accent text-white'
                    : 'glass-soft text-fg/60 hover:text-fg',
                )}
              >
                Авто
              </button>
              {voices.map((v) => (
                <button
                  key={v.name}
                  onClick={() => {
                    setVoiceName(v.name)
                    speakWithVoice('こんにちは。これはテストです。', v)
                  }}
                  className={clsx(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors',
                    voiceName === v.name
                      ? 'bg-accent text-white'
                      : 'glass-soft text-fg/70 hover:text-fg',
                  )}
                >
                  <Volume2 size={12} />
                  {v.name}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-fg/35">
              «Авто» сам подбирает лучший известный голос (Nanami, Keita и похожие), если он есть.
            </p>
          </div>
        )}

        {speechSupported() && voices.length > 0 && (
          <>
            <Slider
              label="Скорость речи"
              value={voiceRate}
              min={0.5}
              max={1.5}
              step={0.05}
              format={(v) => `${v.toFixed(2)}×`}
              onChange={setVoiceRate}
              onAfterChange={testCurrentVoice}
            />
            <Slider
              label="Громкость"
              value={voiceVolume}
              min={0}
              max={1}
              step={0.05}
              format={(v) => `${Math.round(v * 100)}%`}
              onChange={setVoiceVolume}
              onAfterChange={testCurrentVoice}
            />
            <Slider
              label="Тон (мягче / резче)"
              value={voicePitch}
              min={0.7}
              max={1.3}
              step={0.05}
              format={(v) => (v < 1 ? `ниже −${Math.round((1 - v) * 100)}%` : v > 1 ? `выше +${Math.round((v - 1) * 100)}%` : 'обычный')}
              onChange={setVoicePitch}
              onAfterChange={testCurrentVoice}
            />
            <p className="text-[11px] text-fg/35">
              Чуть ниже тон и чуть медленнее речь — звучит мягче и живее, не так «роботически».
              Попробуй тон около −10% вместе со скоростью 0.8–0.9×. Ползунок сразу проигрывает
              тестовую фразу, когда отпускаешь его.
            </p>
          </>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-fg/40">
          Тема оформления
        </h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {themes.map((item) => (
            <button
              key={item.id}
              onClick={() => setTheme(item.id)}
              className={clsx(
                'glass flex gap-4 rounded-lg p-4 text-left transition-colors',
                theme === item.id ? 'border-accent' : 'hover:border-fg/25',
              )}
            >
              {/* Три полоски — фон, карточка, акцент выбранной темы */}
              <span className="flex h-14 w-14 shrink-0 overflow-hidden rounded border border-line">
                {item.swatch.map((color) => (
                  <span key={color} className="flex-1" style={{ backgroundColor: color }} />
                ))}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{item.name}</span>
                  {theme === item.id && <Check size={14} className="text-accent" />}
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-fg/50">
                  {item.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg/40">
          Что показывать
        </h2>

        <Switch
          label="Лепестки сакуры на фоне"
          hint="Летающие лепестки. Цвет подстраивается под тему"
          value={petals}
          onChange={setPetals}
        />
        <Switch
          label="Звуки"
          hint="Щелчки, сигналы правильного и неправильного ответа"
          value={sounds}
          onChange={setSounds}
        />
        <Switch
          label="Анимации переходов"
          hint="Плавное появление страниц. Выключи, если мешает"
          value={animations}
          onChange={setAnimations}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-fg/40">
          Резервная копия
        </h2>
        <p className="text-xs text-fg/45">
          Весь прогресс хранится только в этом браузере. Очистка кэша или переустановка браузера
          сотрёт его без возврата — скачай копию на всякий случай.
        </p>

        <div className="flex flex-wrap gap-3">
          <Button variant="ghost" onClick={downloadBackup}>
            <Download size={16} /> Скачать копию
          </Button>
          <Button variant="ghost" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} /> Загрузить копию
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleFileChosen}
          />
        </div>

        {importError && (
          <p className="text-xs text-bad">
            Это не похоже на файл резервной копии Nihongo Master. Попробуй другой файл.
          </p>
        )}
      </section>

      <Modal
        open={pendingBackup !== null}
        onClose={() => setPendingBackup(null)}
        title="Загрузить эту копию?"
      >
        <p className="text-sm text-fg/60">
          {pendingBackup &&
            `Копия от ${new Date(pendingBackup.exportedAt).toLocaleString('ru-RU')}. `}
          Весь текущий прогресс в этом браузере будет заменён тем, что в файле. Отменить это
          будет нельзя.
        </p>
        <div className="mt-5 flex gap-2">
          <Button full variant="danger" onClick={confirmImport}>
            Да, загрузить
          </Button>
          <Button full variant="ghost" onClick={() => setPendingBackup(null)}>
            Отмена
          </Button>
        </div>
      </Modal>
    </div>
  )
}
