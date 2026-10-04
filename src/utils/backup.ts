/**
 * Резервная копия прогресса: всё, что приложение хранит в localStorage,
 * одним JSON-файлом. Нужно, потому что прогресс живёт только в браузере —
 * очистка кэша или переустановка браузера стирает его без возврата.
 */

/** Все ключи localStorage, которые использует приложение */
const BACKUP_KEYS = [
  'nihongo-master-progress',
  'nihongo-master-settings',
] as const

export interface BackupFile {
  app: 'nihongo-master'
  version: 1
  exportedAt: string
  data: Record<string, string | null>
}

/** Проверяет, что распарсенный JSON действительно похож на нашу резервную копию */
function isBackupFile(value: unknown): value is BackupFile {
  if (!value || typeof value !== 'object') return false
  const v = value as Record<string, unknown>
  return v.app === 'nihongo-master' && typeof v.data === 'object' && v.data !== null
}

/** Собирает весь прогресс в файл и сразу запускает его скачивание */
export function downloadBackup(): void {
  const data: Record<string, string | null> = {}
  for (const key of BACKUP_KEYS) {
    data[key] = localStorage.getItem(key)
  }

  const backup: BackupFile = {
    app: 'nihongo-master',
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  }

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `nihongo-master-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

/** Разбирает текст файла резервной копии. Возвращает null, если файл не тот */
export function parseBackup(text: string): BackupFile | null {
  try {
    const parsed: unknown = JSON.parse(text)
    return isBackupFile(parsed) ? parsed : null
  } catch {
    return null
  }
}

/** Записывает резервную копию обратно в localStorage. Перезаписывает текущий прогресс! */
export function applyBackup(backup: BackupFile): void {
  for (const key of BACKUP_KEYS) {
    const value = backup.data[key]
    if (value === null || value === undefined) localStorage.removeItem(key)
    else localStorage.setItem(key, value)
  }
}
