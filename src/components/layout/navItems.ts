import {
  BarChart3,
  BookMarked,
  BookOpen,
  Brain,
  GraduationCap,
  Home,
  Languages,
  LineChart,
  Map,
  MapPinned,
  MessageCircle,
  PenLine,
  Puzzle,
  RotateCw,
  ScrollText,
  Settings,
  Trophy,
  Type,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

/** Один пункт меню */
export interface NavItem {
  to: string
  label: string
  /** Подпись кандзи справа — только для японского режима */
  kana?: string
  icon: LucideIcon
}

/** Пункты меню для режима изучения японского */
export const japaneseNavItems: NavItem[] = [
  { to: '/', label: 'Главная', kana: 'ホーム', icon: Home },
  { to: '/roadmap', label: 'Дорожная карта', kana: 'ロードマップ', icon: Map },
  { to: '/hiragana', label: 'Хирагана', kana: 'ひらがな', icon: Type },
  { to: '/katakana', label: 'Катакана', kana: 'カタカナ', icon: Languages },
  { to: '/kanji', label: 'Кандзи', kana: '漢字', icon: GraduationCap },
  { to: '/kanji-writing', label: 'Прописи', kana: '書き方', icon: PenLine },
  { to: '/vocabulary', label: 'Словарь', kana: '単語', icon: BookOpen },
  { to: '/grammar', label: 'Грамматика', kana: '文法', icon: ScrollText },
  { to: '/textbook', label: 'Учебник', kana: '教科書', icon: BookMarked },
  { to: '/sentence-builder', label: 'Собери предложение', kana: '文を作ろう', icon: Puzzle },
  { to: '/japan-map', label: 'Карта Японии', kana: '日本地図', icon: MapPinned },
  { to: '/review', label: 'Повторение', kana: '復習', icon: RotateCw },
  { to: '/dialogues', label: 'Диалоги', kana: '会話', icon: MessageCircle },
  { to: '/quiz', label: 'Тесты', kana: 'テスト', icon: Brain },
  { to: '/exam', label: 'Экзамен N5', kana: '模擬試験', icon: Trophy },
  { to: '/progress', label: 'Прогресс', kana: '進捗', icon: LineChart },
  { to: '/stats', label: 'Статистика', kana: '統計', icon: BarChart3 },
  { to: '/settings', label: 'Настройки', kana: '設定', icon: Settings },
]

