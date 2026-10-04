import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import type { ReactNode } from 'react'
import { Sidebar } from './Sidebar'
import { AchievementToasts } from '../ui/AchievementToast'
import { useProgressStore } from '../../store/useProgressStore'
import { useSettingsStore } from '../../store/useSettingsStore'
import { useTheme } from '../../hooks/useTheme'
import { setMuted } from '../../utils/sound'
import { SakuraBackground } from '../ui/SakuraBackground'
import { Mascot } from '../ui/Mascot'

/** Общая обёртка всех страниц: фон, меню, шапка на телефоне */
export function Layout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const touchStreak = useProgressStore((s) => s.touchStreak)
  const petals = useSettingsStore((s) => s.petals)
  const animations = useSettingsStore((s) => s.animations)
  const sounds = useSettingsStore((s) => s.sounds)

  useTheme()

  // Держим звуковой модуль в курсе настройки
  useEffect(() => {
    setMuted(!sounds)
  }, [sounds])

  // Отмечаем, что пользователь сегодня заходил — это поддерживает серию дней
  useEffect(() => {
    touchStreak()
  }, [touchStreak])

  // При переходе на другую страницу мобильное меню закрывается само
  useEffect(() => {
    setMenuOpen(false)
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      {petals && <SakuraBackground />}
      <AchievementToasts />

      {/* Маскот-самурай */}
      <motion.div
        className="pointer-events-none fixed bottom-4 left-4 z-30 lg:left-[16rem]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Mascot size={96} withSpeech />
      </motion.div>

      {/* Меню на широком экране — всегда видно слева */}
      <aside className="fixed left-0 top-0 hidden h-screen w-60 border-r border-line bg-surface lg:block">
        <Sidebar />
      </aside>

      {/* Шапка на телефоне */}
      <header className="sticky top-0 z-40 flex items-center gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-xl p-2 text-fg/80 transition hover:bg-fg/10"
          aria-label="Меню"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
        <span className="jp text-base font-bold">日本語 Master</span>
      </header>

      {/* Выезжающее меню на телефоне */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.aside
              className="fixed left-0 top-0 z-50 h-screen w-60 border-r border-line bg-surface lg:hidden"
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            >
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Сам контент страницы */}
      <main className="px-4 pb-16 pt-6 sm:px-6 lg:ml-60 lg:px-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={animations ? { opacity: 0, y: 16 } : false}
            animate={{ opacity: 1, y: 0 }}
            exit={animations ? { opacity: 0, y: -12 } : undefined}
            transition={{ duration: animations ? 0.28 : 0, ease: 'easeOut' }}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}
