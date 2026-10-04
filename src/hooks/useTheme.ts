import { useEffect } from 'react'
import { useSettingsStore } from '../store/useSettingsStore'

/**
 * Проставляет выбранную тему атрибутом на <html>.
 * Все цвета в globals.css завязаны на этот атрибут, поэтому
 * приложение перекрашивается целиком.
 */
export function useTheme(): void {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
}
