/** Перемешивает массив (алгоритм Фишера — Йетса) и возвращает новый */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Берёт случайные n элементов массива */
export function pickRandom<T>(items: readonly T[], n: number): T[] {
  return shuffle(items).slice(0, n)
}
