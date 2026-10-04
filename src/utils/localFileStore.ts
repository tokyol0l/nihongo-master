/**
 * Хранит один выбранный пользователем файл прямо в браузере (IndexedDB),
 * чтобы не просить выбирать его заново при каждом заходе на страницу.
 * Файл никуда не отправляется — остаётся только в этом браузере.
 */

const DB_NAME = 'nihongo-master-files'
const STORE_NAME = 'files'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1)
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE_NAME)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Сохраняет файл под ключом (например, 'textbook') */
export async function saveLocalFile(key: string, file: Blob): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(file, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

/** Достаёт ранее сохранённый файл, если он есть */
export async function loadLocalFile(key: string): Promise<Blob | null> {
  const db = await openDb()
  const result = await new Promise<Blob | null>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve((req.result as Blob) ?? null)
    req.onerror = () => reject(req.error)
  })
  db.close()
  return result
}

/** Удаляет сохранённый файл (кнопка «выбрать другой файл») */
export async function removeLocalFile(key: string): Promise<void> {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}
