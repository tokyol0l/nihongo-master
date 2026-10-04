import { annotateFurigana } from '../../utils/furigana'
import { Furigana } from './Furigana'

/**
 * Показывает целое японское предложение, автоматически подписывая каждый
 * известный кандзи или слово маленьким чтением сверху. Незнакомые слова
 * остаются без подписи — так надёжнее, чем гадать и показать неверное чтение.
 */
export function FuriganaText({ text, className }: { text: string; className?: string }) {
  const segments = annotateFurigana(text)

  return (
    <span className={className}>
      {segments.map((seg, i) => (
        <Furigana key={i} text={seg.text} reading={seg.reading} />
      ))}
    </span>
  )
}
