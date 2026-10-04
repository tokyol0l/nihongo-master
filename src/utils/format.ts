/** Склоняет русское существительное по числу: 1 день, 2 дня, 5 дней */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod100 = n % 100
  const mod10 = n % 10
  if (mod100 >= 11 && mod100 <= 14) return many
  if (mod10 === 1) return one
  if (mod10 >= 2 && mod10 <= 4) return few
  return many
}

/** Дата в формате «27 сентября, 14:05» */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleString('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Процент, округлённый до целого */
export function percent(part: number, total: number): number {
  if (total === 0) return 0
  return Math.round((part / total) * 100)
}

/**
 * Дата в местном календаре пользователя в виде YYYY-MM-DD.
 * Специально не через toISOString() — тот переводит в UTC и в вечерние
 * часы (или ранним утром, смотря по часовому поясу) сдвигает день
 * не в ту сторону, из-за чего серия дней и календарь занятий путались.
 */
export function localDateKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
