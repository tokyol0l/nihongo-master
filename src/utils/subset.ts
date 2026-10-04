import type { Category, KanaSubset, StudyItem } from '../types'

/** Есть ли у раздела деление на основные и озвончённые знаки */
export function hasSubsets(category: Category): boolean {
  return category === 'hiragana' || category === 'katakana'
}

/** Оставляет только нужную часть азбуки; null — значит «все знаки» */
export function filterBySubset(items: StudyItem[], subset: KanaSubset | null): StudyItem[] {
  if (!subset) return items
  return items.filter((item) => item.subset === subset)
}

/** Подписи для переключателя */
export const subsetLabels: Record<KanaSubset, string> = {
  basic: 'Только основные',
  dakuten: 'Только дакутэн',
}

/** Оставляет только карточки, у которых стоит галочка */
export function onlySelected(
  items: StudyItem[],
  excluded: Record<string, true>,
): StudyItem[] {
  return items.filter((item) => !excluded[item.id])
}

/** Разбивает список карточек по группам (рядам каны, темам кандзи и слов) */
export function groupByRow(items: StudyItem[]): { name: string; items: StudyItem[] }[] {
  const rows: { name: string; items: StudyItem[] }[] = []
  for (const item of items) {
    const last = rows[rows.length - 1]
    if (last && last.name === item.group) last.items.push(item)
    else rows.push({ name: item.group, items: [item] })
  }
  return rows
}
