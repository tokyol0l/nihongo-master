/** Идентификатор темы оформления */
export type ThemeId = 'indigo' | 'flat' | 'space' | 'paper' | 'ocean'

/** Описание темы для экрана настроек */
export interface ThemeInfo {
  id: ThemeId
  name: string
  description: string
  /** Три цвета для маленького предпросмотра: фон, карточка, акцент */
  swatch: [string, string, string]
}

export const themes: ThemeInfo[] = [
  {
    id: 'indigo',
    name: 'Индиго',
    description: 'Почти чёрный фон, панели чуть светлее, один сине-фиолетовый акцент. Плотно и спокойно.',
    swatch: ['#0e0e13', '#17171e', '#7c6cf5'],
  },
  {
    id: 'flat',
    name: 'Красная',
    description: 'Та же плоская тёмная тема, но акцент красный, а не индиго.',
    swatch: ['#16161a', '#1e1e24', '#e5484d'],
  },
  {
    id: 'space',
    name: 'Космос',
    description: 'Фиолетовый градиент, стеклянные карточки, свечение и радужные заголовки.',
    swatch: ['#302b63', '#4b4585', '#ff6b9d'],
  },
  {
    id: 'paper',
    name: 'Светлая',
    description: 'Белый фон и чёрный текст, как в бумажном учебнике. Красный акцент.',
    swatch: ['#faf9f7', '#ffffff', '#c0392b'],
  },
  {
    id: 'ocean',
    name: 'Море',
    description: 'Тёмно-синий фон с бирюзовым акцентом. Спокойнее, чем красная тема.',
    swatch: ['#0d1b2a', '#13293d', '#2ec4b6'],
  },
]

/** Тема по умолчанию */
export const defaultTheme: ThemeId = 'indigo'
