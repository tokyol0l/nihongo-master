/**
 * Показывает японский текст с маленьким чтением (фуриганой) сверху —
 * стандартный <ruby>/<rt>, как в настоящих японских учебниках.
 * Если чтения нет (например, это уже хирагана/катакана), просто текст без фуриганы.
 */
export function Furigana({
  text,
  reading,
  className,
}: {
  text: string
  /** Чтение каной. Может быть пустым — тогда фуригана не показывается */
  reading?: string
  className?: string
}) {
  if (!reading) {
    return <span className={className}>{text}</span>
  }

  return (
    <ruby className={className} style={{ rubyAlign: 'center' }}>
      {text}
      <rt className="select-none text-[0.85em] font-normal leading-none text-fg/60">
        {reading}
      </rt>
    </ruby>
  )
}
