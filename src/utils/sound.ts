/**
 * Звуки без единого mp3-файла: всё генерируется в браузере через Web Audio API.
 * Так приложение не тянет лишние файлы и звук всегда доступен.
 */

let ctx: AudioContext | null = null

/** Выключены ли звуки. Значение подставляет настройка в приложении */
let muted = false

/** Включает или выключает все звуки разом */
export function setMuted(value: boolean): void {
  muted = value
}

/** Достаёт (или создаёт) общий аудио-контекст */
function getContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  if (!ctx) {
    const Ctor = window.AudioContext
    if (!Ctor) return null
    ctx = new Ctor()
  }
  // Браузер «усыпляет» контекст, пока не было клика — будим его
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Проигрывает одну ноту */
function beep(freq: number, duration: number, type: OscillatorType, delay = 0, volume = 0.12): void {
  if (muted) return
  const audio = getContext()
  if (!audio) return

  const osc = audio.createOscillator()
  const gain = audio.createGain()
  const start = audio.currentTime + delay

  osc.type = type
  osc.frequency.setValueAtTime(freq, start)

  // Мягкое появление и затухание, чтобы не щёлкало
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.01)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)

  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start(start)
  osc.stop(start + duration + 0.02)
}

/** Тихий щелчок при нажатии */
export function playClick(): void {
  beep(660, 0.07, 'triangle', 0, 0.06)
}

/** Весёлое «пиу» на правильный ответ */
export function playCorrect(): void {
  beep(660, 0.12, 'sine')
  beep(880, 0.16, 'sine', 0.09)
  beep(1320, 0.2, 'sine', 0.18, 0.09)
}

/** Низкий звук на ошибку */
export function playWrong(): void {
  beep(220, 0.18, 'sawtooth', 0, 0.08)
  beep(160, 0.26, 'sawtooth', 0.1, 0.08)
}

/** Фанфары в конце теста */
export function playFinish(): void {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => beep(freq, 0.26, 'sine', i * 0.12, 0.1))
}

/** Звук разблокировки достижения */
export function playUnlock(): void {
  beep(784, 0.14, 'triangle')
  beep(1047, 0.24, 'triangle', 0.12)
}
