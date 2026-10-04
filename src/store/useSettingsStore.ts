import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ThemeId } from '../data/themes'
import { defaultTheme } from '../data/themes'

/** Какой режим приложения сейчас показан */
export type AppMode = 'japanese'

interface SettingsState {
  /** Выбранная тема оформления */
  theme: ThemeId
  /** Показывать ли летающие лепестки сакуры */
  petals: boolean
  /** Играть ли звуки */
  sounds: boolean
  /** Включать ли анимации переходов */
  animations: boolean
  /** Имя голоса для озвучки японского, выбранное вручную в настройках.
   * null — выбирать автоматически (первый подходящий известный хороший голос) */
  voiceName: string | null
  /** Скорость речи: 0.5 — вдвое медленнее, 1 — обычная, 2 — вдвое быстрее */
  voiceRate: number
  /** Громкость речи: 0 — тишина, 1 — максимум */
  voiceVolume: number
  /** Тон голоса: меньше 1 — ниже и мягче, больше 1 — выше и резче */
  voicePitch: number

  setTheme: (theme: ThemeId) => void
  setPetals: (on: boolean) => void
  setSounds: (on: boolean) => void
  setAnimations: (on: boolean) => void
  setVoiceName: (name: string | null) => void
  setVoiceRate: (rate: number) => void
  setVoiceVolume: (volume: number) => void
  setVoicePitch: (pitch: number) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: defaultTheme,
      petals: true,
      sounds: true,
      animations: true,
      voiceName: null,
      voiceRate: 0.85,
      voiceVolume: 1,
      voicePitch: 1,

      setTheme: (theme) => set({ theme }),
      setPetals: (petals) => set({ petals }),
      setSounds: (sounds) => set({ sounds }),
      setAnimations: (animations) => set({ animations }),
      setVoiceName: (voiceName) => set({ voiceName }),
      setVoiceRate: (voiceRate) => set({ voiceRate }),
      setVoiceVolume: (voiceVolume) => set({ voiceVolume }),
      setVoicePitch: (voicePitch) => set({ voicePitch }),
    }),
    { name: 'nihongo-master-settings' },
  ),
)
