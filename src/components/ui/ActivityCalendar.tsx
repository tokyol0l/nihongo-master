import { useMemo } from 'react'
import clsx from 'clsx'
import { localDateKey } from '../../utils/format'

/** Сколько недель показываем */
const WEEKS = 26

/** Календарь занятий: квадратик на каждый день за последние полгода */
export function ActivityCalendar({ days }: { days: string[] }) {
  const active = useMemo(() => new Set(days), [days])

  // Собираем сетку: столбец — неделя, строка — день недели
  const weeks = useMemo(() => {
    const today = new Date()
    // Отматываем назад к понедельнику текущей недели
    const offset = (today.getDay() + 6) % 7
    const lastMonday = new Date(today)
    lastMonday.setDate(today.getDate() - offset)

    return Array.from({ length: WEEKS }, (_, w) => {
      const weekStart = new Date(lastMonday)
      weekStart.setDate(lastMonday.getDate() - (WEEKS - 1 - w) * 7)

      return Array.from({ length: 7 }, (_, d) => {
        const date = new Date(weekStart)
        date.setDate(weekStart.getDate() + d)
        return { date, future: date > today }
      })
    })
  }, [])

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, w) => (
          <div key={w} className="flex flex-col gap-1">
            {week.map(({ date, future }) => {
              const studied = active.has(localDateKey(date))
              return (
                <span
                  key={localDateKey(date)}
                  title={date.toLocaleDateString('ru-RU')}
                  className={clsx(
                    'h-2.5 w-2.5 rounded-[2px]',
                    future ? 'bg-transparent' : studied ? 'bg-accent' : 'bg-fg/8',
                  )}
                />
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
