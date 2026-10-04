import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import clsx from 'clsx'
import { japaneseNavItems } from './navItems'
import { useProgressStore } from '../../store/useProgressStore'
import { Flame, Snowflake, Star } from 'lucide-react'

interface SidebarProps {
  /** Закрыть меню — нужно в мобильной версии */
  onNavigate?: () => void
}

/** Боковое меню со ссылками на все разделы */
export function Sidebar({ onNavigate }: SidebarProps) {
  const points = useProgressStore((s) => s.points)
  const streak = useProgressStore((s) => s.streak)
  const streakFreezes = useProgressStore((s) => s.streakFreezes)
  const items = japaneseNavItems

  return (
    <nav className="flex h-full flex-col gap-2 p-4">
      <NavLink to="/" onClick={onNavigate} className="mb-4 block px-2">
        <div className="jp text-xl font-bold">日本語</div>
        <div className="text-[10px] font-semibold tracking-[0.25em] text-fg/35">MASTER</div>
      </NavLink>

      {items.map((item) => (
        <NavLink key={item.to} to={item.to} onClick={onNavigate} end={item.to === '/'}>
          {({ isActive }) => (
            <div
              className={clsx(
                'relative flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'text-fg' : 'text-fg/55 hover:text-fg/90',
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded border-l-2 border-accent bg-surface-2"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <item.icon size={17} className={clsx('relative z-10 shrink-0', isActive && 'text-accent')} />
              <span className="relative z-10">{item.label}</span>
              {item.kana && (
                <span className="jp relative z-10 ml-auto text-[10px] text-fg/25">{item.kana}</span>
              )}
            </div>
          )}
        </NavLink>
      ))}

      <div className="glass-soft mt-auto rounded-2xl p-3 text-xs">
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2 text-fg/55">
            <Star size={14} className="text-warn" /> Очки
          </span>
          <span className="font-extrabold">{points}</span>
        </div>
        <div className="flex items-center justify-between py-1">
          <span className="flex items-center gap-2 text-fg/55">
            <Flame size={14} className="text-sakura" /> Серия
          </span>
          <span className="font-extrabold">{streak}</span>
        </div>
        {streakFreezes > 0 && (
          <div className="flex items-center justify-between py-1">
            <span className="flex items-center gap-2 text-fg/55">
              <Snowflake size={14} className="text-aqua" /> Заморозки
            </span>
            <span className="font-extrabold">{streakFreezes}</span>
          </div>
        )}
      </div>
    </nav>
  )
}
