import type { StudyItem } from '../types'
import { hiragana, katakana, kanji, vocabulary } from './index'

/** Один шаг на пути к N5 */
export interface RoadmapStep {
  id: string
  title: string
  hint: string
  /** Куда ведёт кнопка «Идти» */
  to: string
  /** Карточки, которые нужно выучить на этом шаге */
  items: StudyItem[]
}

/** Берёт из списка только карточки перечисленных групп */
function pickGroups(items: StudyItem[], groups: string[]): StudyItem[] {
  return items.filter((item) => groups.includes(item.group))
}

/** Берёт всё, кроме перечисленных групп */
function exceptGroups(items: StudyItem[], groups: string[]): StudyItem[] {
  return items.filter((item) => !groups.includes(item.group))
}

const kanjiFirst = ['Числа', 'Время']
const vocabFirst = ['Приветствия', 'Местоимения', 'Люди и семья', 'Еда']

/** Порядок изучения: от азбук к кандзи и словам */
export const roadmap: RoadmapStep[] = [
  {
    id: 'hira-basic',
    title: 'Основные хираганы',
    hint: '46 знаков, с которых начинается японский',
    to: '/hiragana',
    items: hiragana.filter((i) => i.subset === 'basic'),
  },
  {
    id: 'hira-dakuten',
    title: 'Хирагана дакутэн',
    hint: 'Озвончённые знаки: が, ざ, だ, ば, ぱ',
    to: '/hiragana',
    items: hiragana.filter((i) => i.subset === 'dakuten'),
  },
  {
    id: 'kata-basic',
    title: 'Основные катаканы',
    hint: 'Та же азбука для заимствованных слов',
    to: '/katakana',
    items: katakana.filter((i) => i.subset === 'basic'),
  },
  {
    id: 'kata-dakuten',
    title: 'Катакана дакутэн',
    hint: 'Озвончённые знаки катаканы',
    to: '/katakana',
    items: katakana.filter((i) => i.subset === 'dakuten'),
  },
  {
    id: 'kanji-first',
    title: 'Первые кандзи',
    hint: 'Числа и всё про время: дни недели, часы, месяцы',
    to: '/kanji',
    items: pickGroups(kanji, kanjiFirst),
  },
  {
    id: 'vocab-first',
    title: 'Первые слова',
    hint: 'Приветствия, семья, еда и местоимения',
    to: '/vocabulary',
    items: pickGroups(vocabulary, vocabFirst),
  },
  {
    id: 'kanji-rest',
    title: 'Остальные кандзи N5',
    hint: 'Люди, природа, глаголы, город и тело',
    to: '/kanji',
    items: exceptGroups(kanji, kanjiFirst),
  },
  {
    id: 'vocab-rest',
    title: 'Остальной словарь N5',
    hint: 'Прилагательные, глаголы, дом, школа и город',
    to: '/vocabulary',
    items: exceptGroups(vocabulary, vocabFirst),
  },
  {
    id: 'ready',
    title: 'Готов к N5',
    hint: 'Все азбуки, кандзи и слова уровня N5 выучены',
    to: '/quiz',
    items: [...hiragana, ...katakana, ...kanji, ...vocabulary],
  },
]
