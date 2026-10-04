/**
 * Задания «Собери предложение»: японское предложение разбито на плитки
 * по словам и частицам, в правильном порядке. Все предложения — не
 * выдуманы на лету, а построены на конструкциях, уже проверенных
 * в разделе «Грамматика» по учебнику «Минна но Нихонго I».
 */

export type PuzzleLevel = 'easy' | 'medium' | 'hard'

export interface SentencePuzzle {
  id: string
  /** Плитки в правильном порядке — так, как их нужно расставить */
  tiles: string[]
  romaji: string
  ru: string
  level: PuzzleLevel
}

export const sentencePuzzles: SentencePuzzle[] = [
  // ── Простые: уроки 1-9 ──────────────────────────────────────────
  {
    id: 'sb-1',
    tiles: ['わたしは', '学生', 'です。'],
    romaji: 'Watashi wa gakusei desu.',
    ru: 'Я студент.',
    level: 'easy',
  },
  {
    id: 'sb-2',
    tiles: ['これは', '本', 'です。'],
    romaji: 'Kore wa hon desu.',
    ru: 'Это книга.',
    level: 'easy',
  },
  {
    id: 'sb-3',
    tiles: ['あの人は', '先生', 'です。'],
    romaji: 'Ano hito wa sensei desu.',
    ru: 'Тот человек — учитель.',
    level: 'easy',
  },
  {
    id: 'sb-4',
    tiles: ['わたしは', '日本人', 'じゃありません。'],
    romaji: 'Watashi wa nihonjin ja arimasen.',
    ru: 'Я не японец.',
    level: 'easy',
  },
  {
    id: 'sb-5',
    tiles: ['これは', '何', 'ですか。'],
    romaji: 'Kore wa nan desu ka.',
    ru: 'Что это?',
    level: 'easy',
  },
  {
    id: 'sb-6',
    tiles: ['きょうしつは', 'どこ', 'ですか。'],
    romaji: 'Kyoushitsu wa doko desu ka.',
    ru: 'Где класс?',
    level: 'easy',
  },
  {
    id: 'sb-7',
    tiles: ['わたしは', 'まいにち', 'べんきょうします。'],
    romaji: 'Watashi wa mainichi benkyou shimasu.',
    ru: 'Я занимаюсь каждый день.',
    level: 'easy',
  },
  {
    id: 'sb-8',
    tiles: ['がっこうは', '9時から', '5時までです。'],
    romaji: 'Gakkou wa kuji kara goji made desu.',
    ru: 'Школа работает с 9 до 5.',
    level: 'easy',
  },
  {
    id: 'sb-9',
    tiles: ['あなたは', '学生', 'ですか。'],
    romaji: 'Anata wa gakusei desu ka.',
    ru: 'Вы студент?',
    level: 'easy',
  },

  // ── Средние: уроки 10-18 ────────────────────────────────────────
  {
    id: 'sb-10',
    tiles: ['わたしは', '日本語が', 'すきです。'],
    romaji: 'Watashi wa nihongo ga suki desu.',
    ru: 'Мне нравится японский язык.',
    level: 'medium',
  },
  {
    id: 'sb-11',
    tiles: ['きょうは', 'あついです。'],
    romaji: 'Kyou wa atsui desu.',
    ru: 'Сегодня жарко.',
    level: 'medium',
  },
  {
    id: 'sb-12',
    tiles: ['これは', 'あれより', 'たかいです。'],
    romaji: 'Kore wa are yori takai desu.',
    ru: 'Это дороже, чем то.',
    level: 'medium',
  },
  {
    id: 'sb-13',
    tiles: ['写真を', 'とって', 'ください。'],
    romaji: 'Shashin o totte kudasai.',
    ru: 'Сфотографируйте, пожалуйста.',
    level: 'medium',
  },
  {
    id: 'sb-14',
    tiles: ['いま', '何を', 'していますか。'],
    romaji: 'Ima nani o shite imasu ka.',
    ru: 'Что ты сейчас делаешь?',
    level: 'medium',
  },
  {
    id: 'sb-15',
    tiles: ['わたしは', 'りんごが', 'ほしいです。'],
    romaji: 'Watashi wa ringo ga hoshii desu.',
    ru: 'Я хочу яблоко.',
    level: 'medium',
  },
  {
    id: 'sb-16',
    tiles: ['としょかんで', '本を', 'かりました。'],
    romaji: 'Toshokan de hon o karimashita.',
    ru: 'Я взял книгу в библиотеке.',
    level: 'medium',
  },
  {
    id: 'sb-17',
    tiles: ['あした', '京都へ', 'いきます。'],
    romaji: 'Ashita Kyouto e ikimasu.',
    ru: 'Завтра поеду в Киото.',
    level: 'medium',
  },
  {
    id: 'sb-18',
    tiles: ['でんしゃで', 'かいしゃへ', 'いきます。'],
    romaji: 'Densha de kaisha e ikimasu.',
    ru: 'Еду на работу на электричке.',
    level: 'medium',
  },
  {
    id: 'sb-19',
    tiles: ['ともだちと', 'えいがを', 'みました。'],
    romaji: 'Tomodachi to eiga o mimashita.',
    ru: 'Я смотрел фильм с другом.',
    level: 'medium',
  },

  // ── Сложные: уроки 19-25 ────────────────────────────────────────
  {
    id: 'sb-20',
    tiles: ['日本へ', 'いった', 'ことが', 'あります。'],
    romaji: 'Nihon e itta koto ga arimasu.',
    ru: 'Мне случалось бывать в Японии.',
    level: 'hard',
  },
  {
    id: 'sb-21',
    tiles: ['あめが', 'ふったら、', 'でかけません。'],
    romaji: 'Ame ga futtara, dekakemasen.',
    ru: 'Если пойдёт дождь, никуда не пойду.',
    level: 'hard',
  },
  {
    id: 'sb-22',
    tiles: ['これは', 'わたしが', 'つくった', 'ケーキです。'],
    romaji: 'Kore wa watashi ga tsukutta keeki desu.',
    ru: 'Это торт, который я испекла.',
    level: 'hard',
  },
  {
    id: 'sb-23',
    tiles: ['あさ', 'おきるとき、', 'でんわが', 'なりました。'],
    romaji: 'Asa okiru toki, denwa ga narimashita.',
    ru: 'Утром, когда я просыпался, зазвонил телефон.',
    level: 'hard',
  },
  {
    id: 'sb-24',
    tiles: ['かのじょは', 'たぶん', 'くると', 'おもいます。'],
    romaji: 'Kanojo wa tabun kuru to omoimasu.',
    ru: 'Думаю, она, наверное, придёт.',
    level: 'hard',
  },
  {
    id: 'sb-25',
    tiles: ['せんせいは', 'らいしゅう', 'アメリカへ', 'いくと', 'いいました。'],
    romaji: 'Sensei wa raishuu Amerika e iku to iimashita.',
    ru: 'Учитель сказал, что на следующей неделе поедет в Америку.',
    level: 'hard',
  },
  {
    id: 'sb-26',
    tiles: ['ともだちに', '本を', 'かして', 'あげました。'],
    romaji: 'Tomodachi ni hon o kashite agemashita.',
    ru: 'Я одолжил другу книгу.',
    level: 'hard',
  },
  {
    id: 'sb-27',
    tiles: ['ははは', 'わたしに', 'セーターを', 'おくって', 'くれました。'],
    romaji: 'Haha wa watashi ni seetaa o okutte kuremashita.',
    ru: 'Мама прислала мне свитер.',
    level: 'hard',
  },
]
