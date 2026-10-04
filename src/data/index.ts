import type { Category, StudyItem } from '../types'
import { hiragana } from './hiragana'
import { katakana } from './katakana'
import { kanji } from './kanji'
import { vocabulary as curatedVocabulary } from './vocabulary'
import { textbookWords } from './textbookWords'
import { textbookWords2 } from './textbookWords2'

/**
 * Итоговый словарь: собственный список N5 плюс слова из учебника
 * «Минна но Нихонго I», перенесённые из личных материалов пользователя.
 */
export const vocabulary: StudyItem[] = [...curatedVocabulary, ...textbookWords, ...textbookWords2]

export { hiragana, katakana, kanji }

/** Все карточки, сгруппированные по разделам */
export const dataByCategory: Record<Category, StudyItem[]> = {
  hiragana,
  katakana,
  kanji,
  vocabulary,
}

/** Плоский список вообще всех карточек */
export const allItems: StudyItem[] = [...hiragana, ...katakana, ...kanji, ...vocabulary]

/** Человеческие названия разделов */
export const categoryTitles: Record<Category, string> = {
  hiragana: 'Хирагана',
  katakana: 'Катакана',
  kanji: 'Кандзи',
  vocabulary: 'Словарь',
}

/** Короткое описание раздела для карточек на главной */
export const categoryDescriptions: Record<Category, string> = {
  hiragana: 'Первая азбука: 71 знак',
  katakana: 'Азбука для заимствований: 71 знак',
  kanji: 'Иероглифы уровня N5',
  vocabulary: 'Слова N5 и весь учебник Минна но Нихонго I',
}

/** Японская подпись раздела */
export const categoryKana: Record<Category, string> = {
  hiragana: 'ひらがな',
  katakana: 'カタカナ',
  kanji: '漢字',
  vocabulary: '単語',
}
