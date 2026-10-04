import { vocabulary } from '../data/vocabulary'
import { kanji } from '../data/kanji'

/** Самое длинное слово в словаре — дальше незачем искать совпадения */
const MAX_WORD_LENGTH = 6

/** Диапазон символов кандзи (CJK Unified Ideographs) */
function containsKanji(s: string): boolean {
  for (const ch of s) {
    if (ch >= '一' && ch <= '鿿') return true
  }
  return false
}

/**
 * Словарь «текст → чтение каной», собранный из уже проверенных данных:
 * сначала слова (точные, целиком — надёжный источник), потом одиночные кандзи
 * (берём только первое чтение из списка через «・», когда их несколько).
 * Слова без единого кандзи (чистая хирагана/катакана — они и так читаются
 * сами) в словарь не попадают: фуригана над ними ни к чему.
 * Если слова здесь нет совсем — фуригану для него не придумываем, чтобы не
 * научить неправильному чтению.
 */
const readings: Map<string, string> = (() => {
  const map = new Map<string, string>()

  for (const item of kanji) {
    if (!item.kana) continue
    const firstReading = item.kana.split('・')[0]
    map.set(item.char, firstReading)
  }

  // Слова добавляем после кандзи, чтобы при совпадении длины словарное
  // (более надёжное для составных слов) чтение могло переопределить кандзи
  for (const item of vocabulary) {
    if (!item.kana || !containsKanji(item.char)) continue
    map.set(item.char, item.kana)
  }

  return map
})()

export interface FuriganaSegment {
  text: string
  /** Чтение каной. Если его нет — сегмент показывается как обычный текст */
  reading?: string
}

/**
 * У глаголов и прилагательных часто есть хвост на кане после кандзи
 * (окуригана), например 話す — す не нужно подписывать чтением, она уже
 * сама читается. Отрезаем совпадающий хвост у слова и у его чтения, чтобы
 * фуригана осталась только над кандзи.
 */
function splitOkurigana(word: string, reading: string): { kanjiPart: string; kanjiReading: string; tail: string } {
  let end = word.length
  while (
    end > 0 &&
    end <= reading.length &&
    word[end - 1] === reading[reading.length - (word.length - end) - 1]
  ) {
    end--
  }
  // Не отрезаем весь кандзи целиком — должно остаться хотя бы что-то для озвучки
  if (end === 0) end = word.length

  return {
    kanjiPart: word.slice(0, end),
    kanjiReading: reading.slice(0, reading.length - (word.length - end)),
    tail: word.slice(end),
  }
}

/**
 * Разбивает японский текст на сегменты для показа фуриганы: сначала пытается
 * найти целиком известное слово (самое длинное совпадение), иначе — читает
 * один кандзи по словарю кандзи, иначе — оставляет символ как есть (кана,
 * пунктуация, незнакомый кандзи).
 */
export function annotateFurigana(text: string): FuriganaSegment[] {
  const segments: FuriganaSegment[] = []
  let plainBuffer = ''
  let i = 0

  const flushPlain = () => {
    if (plainBuffer) {
      segments.push({ text: plainBuffer })
      plainBuffer = ''
    }
  }

  while (i < text.length) {
    let matched = false

    // Ищем самое длинное известное слово, начинающееся с этой позиции
    for (let len = Math.min(MAX_WORD_LENGTH, text.length - i); len >= 1; len--) {
      const candidate = text.slice(i, i + len)
      const reading = readings.get(candidate)
      // Слово из одной каны (например, приветствие) само себе чтение —
      // подписывать его фуриганой незачем
      if (reading && reading !== candidate) {
        const { kanjiPart, kanjiReading, tail } = splitOkurigana(candidate, reading)
        flushPlain()
        segments.push({ text: kanjiPart, reading: kanjiReading })
        if (tail) plainBuffer += tail
        i += len
        matched = true
        break
      }
    }

    if (!matched) {
      // Незнакомый символ (кана, пунктуация, незнакомый кандзи) — копим подряд
      plainBuffer += text[i]
      i++
    }
  }

  flushPlain()
  return segments
}
