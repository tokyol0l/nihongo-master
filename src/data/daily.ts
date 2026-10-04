/**
 * Daily задания - одно случайное задание каждый день
 * помогает поддерживать ежедневный прогресс
 */

export interface DailyTask {
  type: 'word' | 'kanji' | 'grammar' | 'sentence'
  itemId: string
  date: string // YYYY-MM-DD
  completed: boolean
}

export interface DailyChallenge {
  id: string
  type: 'word' | 'kanji' | 'grammar' | 'sentence'
  title: string
  description: string
  points: number
}

export const dailyChallenges: DailyChallenge[] = [
  {
    id: 'daily-word',
    type: 'word',
    title: '🎯 Слово дня',
    description: 'Повтори одно новое слово каждый день',
    points: 10,
  },
  {
    id: 'daily-kanji',
    type: 'kanji',
    title: '📝 Кандзи дня',
    description: 'Выучи один кандзи и напиши его',
    points: 15,
  },
  {
    id: 'daily-grammar',
    type: 'grammar',
    title: '📖 Грамматика дня',
    description: 'Прочитай одно грамматическое правило',
    points: 15,
  },
  {
    id: 'daily-sentence',
    type: 'sentence',
    title: '🗣️ Фраза дня',
    description: 'Собери одно предложение и послушай его озвучку',
    points: 12,
  },
]
