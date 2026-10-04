/**
 * Озвучка японского через встроенный синтезатор речи браузера.
 * Нужна для режима теста «на слух» и кнопки «Послушать» на карточках.
 *
 * Качество голоса целиком зависит от браузера и системы:
 * - В Microsoft Edge есть встроенные облачные голоса Nanami/Keita —
 *   звучат естественно и правильно читают кандзи.
 * - В Chrome/Firefox чаще доступен только базовый офлайн-голос (хуже),
 *   если в Windows не установлен японский языковой пакет.
 *
 * Пользователь может сам выбрать голос из списка в Настройках — тогда
 * используется он, а не автоматический подбор.
 */

import { useSettingsStore } from '../store/useSettingsStore'

/** Пауза перед началом озвучки — чтобы успеть посмотреть на знак */
const START_DELAY_MS = 400

/** Отложенный запуск озвучки, чтобы можно было отменить его новым нажатием */
let pendingTimer: number | null = null

/** Голоса, которые звучат заметно естественнее обычного офлайн-голоса */
const PREFERRED_VOICE_NAMES = ['Nanami', 'Keita', 'Ayumi', 'Ichiro', 'O-Ren']

/** Есть ли вообще синтезатор в этом браузере */
export function speechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

/** Список всех японских голосов, которые видит браузер прямо сейчас */
export function listJapaneseVoices(): SpeechSynthesisVoice[] {
  if (!speechSupported()) return []
  return window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ja'))
}

/**
 * Выбирает голос для озвучки: если пользователь выбрал голос вручную
 * в Настройках — берём его, иначе подбираем сами (известные хорошие,
 * потом любой японский).
 */
export function pickBestJapaneseVoice(): SpeechSynthesisVoice | null {
  const japanese = listJapaneseVoices()
  if (japanese.length === 0) return null

  const chosenName = useSettingsStore.getState().voiceName
  if (chosenName) {
    const chosen = japanese.find((v) => v.name === chosenName)
    if (chosen) return chosen
  }

  const preferred = japanese.find((v) =>
    PREFERRED_VOICE_NAMES.some((name) => v.name.includes(name)),
  )
  return preferred ?? japanese[0]
}

/** Останавливает и речь, и отложенный запуск */
export function stopSpeaking(): void {
  if (pendingTimer !== null) {
    window.clearTimeout(pendingTimer)
    pendingTimer = null
  }
  if (speechSupported()) window.speechSynthesis.cancel()
}

/** Произносит текст конкретным голосом прямо сейчас, без паузы и без сохранения выбора.
 * Нужно для прослушивания голосов в Настройках перед тем, как выбрать один из них.
 * Скорость и громкость берутся из текущих настроек (слайдеров). */
export function speakWithVoice(text: string, voice: SpeechSynthesisVoice): void {
  if (!speechSupported()) return

  stopSpeaking()
  const { voiceRate, voiceVolume, voicePitch } = useSettingsStore.getState()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'ja-JP'
  utterance.rate = voiceRate
  utterance.volume = voiceVolume
  utterance.pitch = voicePitch
  utterance.voice = voice
  window.speechSynthesis.speak(utterance)
}

/** Произносит японский текст вслух — с небольшой паузой, своей скоростью и громкостью */
export function speak(text: string): void {
  if (!speechSupported()) return

  // Новое нажатие отменяет предыдущую озвучку и её паузу
  stopSpeaking()

  pendingTimer = window.setTimeout(() => {
    pendingTimer = null

    const { voiceRate, voiceVolume, voicePitch } = useSettingsStore.getState()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'ja-JP'
    utterance.rate = voiceRate
    utterance.volume = voiceVolume
    utterance.pitch = voicePitch

    const voice = pickBestJapaneseVoice()
    if (voice) utterance.voice = voice

    window.speechSynthesis.speak(utterance)
  }, START_DELAY_MS)
}
