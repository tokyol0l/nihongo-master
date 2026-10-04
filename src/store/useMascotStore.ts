import { create } from 'zustand'

/** Вид реплики — определяет цвет пузыря */
export type MascotMood = 'correct' | 'wrong' | 'streak'

interface MascotState {
  /** Текст в пузыре сейчас, null — пузыря нет */
  text: string | null
  mood: MascotMood
  /** Растёт с каждой репликой — чтобы одинаковый текст подряд тоже переанимировался */
  key: number
  /** Показать реплику маскота */
  say: (text: string, mood: MascotMood) => void
  /** Убрать пузырь */
  clear: () => void
}

/**
 * Общее хранилище для реплик маскота. Нужно, потому что сам маскот
 * живёт в Layout (общем для всех страниц), а поводы что-то сказать
 * возникают глубоко внутри страниц — например, в тесте после ответа.
 */
export const useMascotStore = create<MascotState>()((set) => ({
  text: null,
  mood: 'correct',
  key: 0,
  say: (text, mood) => set((s) => ({ text, mood, key: s.key + 1 })),
  clear: () => set({ text: null }),
}))
