/**
 * Диалоги на японском: реальные разговоры в разных ситуациях
 * с аудио и переводами по фразам
 */

export interface DialogueLine {
  speaker: 'A' | 'B'
  jp: string
  romaji: string
  ru: string
  /** Аудио-файл для озвучки (будет синтезировано) */
  audio?: string
}

export interface Dialogue {
  id: string
  title: string
  situation: string
  level: 'easy' | 'medium' | 'hard'
  lines: DialogueLine[]
  /** Новые слова в диалоге */
  vocabulary: Array<{
    jp: string
    romaji: string
    ru: string
  }>
}

export const dialogues: Dialogue[] = [
  {
    id: 'dl-1',
    title: 'Знакомство',
    situation: 'Первая встреча с незнакомым человеком',
    level: 'easy',
    lines: [
      {
        speaker: 'A',
        jp: 'こんにちは。私は田中です。',
        romaji: 'Konnichiha. Watashi wa Tanaka desu.',
        ru: 'Привет. Я Танака.',
      },
      {
        speaker: 'B',
        jp: 'こんにちは。私は山田です。',
        romaji: 'Konnichiha. Watashi wa Yamada desu.',
        ru: 'Привет. Я Ямада.',
      },
      {
        speaker: 'A',
        jp: 'よろしくお願いします。',
        romaji: 'Yoroshiku onegai shimasu.',
        ru: 'Рад познакомиться.',
      },
      {
        speaker: 'B',
        jp: 'こちらこそ、よろしくお願いします。',
        romaji: 'Kochira koso, yoroshiku onegai shimasu.',
        ru: 'Мне тоже приятно.',
      },
    ],
    vocabulary: [
      { jp: 'よろしくお願いします', romaji: 'yoroshiku onegai shimasu', ru: 'рад познакомиться' },
      { jp: 'こちらこそ', romaji: 'kochira koso', ru: 'мне тоже' },
    ],
  },
  {
    id: 'dl-2',
    title: 'Заказ в кафе',
    situation: 'Ты в кафе, заказываешь кофе',
    level: 'easy',
    lines: [
      {
        speaker: 'A',
        jp: 'いらっしゃいませ。何をお飲みになりますか。',
        romaji: 'Irasshaimase. Nani wo o-nomi ni narimasu ka.',
        ru: 'Добро пожаловать. Что вы будете пить?',
      },
      {
        speaker: 'B',
        jp: 'コーヒーをください。',
        romaji: 'Kōhī wo kudasai.',
        ru: 'Кофе, пожалуйста.',
      },
      {
        speaker: 'A',
        jp: 'かしこまりました。ホットですか、アイスですか。',
        romaji: 'Kashikomarimashita. Hotto desu ka, aisu desu ka.',
        ru: 'Хорошо. Горячий или холодный?',
      },
      {
        speaker: 'B',
        jp: 'ホットで、お砂糖なしでお願いします。',
        romaji: 'Hotto de, o-satou nashi de onegai shimasu.',
        ru: 'Горячий, без сахара, пожалуйста.',
      },
    ],
    vocabulary: [
      { jp: 'コーヒー', romaji: 'kōhī', ru: 'кофе' },
      { jp: 'ホット', romaji: 'hotto', ru: 'горячий' },
      { jp: 'アイス', romaji: 'aisu', ru: 'холодный' },
      { jp: 'お砂糖', romaji: 'o-satou', ru: 'сахар' },
    ],
  },
  {
    id: 'dl-3',
    title: 'Прощание',
    situation: 'После встречи прощаешься с другом',
    level: 'easy',
    lines: [
      {
        speaker: 'A',
        jp: 'もう帰るんですか。',
        romaji: 'Mou kaeru n desu ka.',
        ru: 'Ты уже уходишь?',
      },
      {
        speaker: 'B',
        jp: 'はい、もう遅いですから。',
        romaji: 'Hai, mou osoi desu kara.',
        ru: 'Да, уже поздно.',
      },
      {
        speaker: 'A',
        jp: 'そうですか。また明日。',
        romaji: 'Sou desu ka. Mata ashita.',
        ru: 'Понятно. До завтра.',
      },
      {
        speaker: 'B',
        jp: 'はい、また明日。さようなら。',
        romaji: 'Hai, mata ashita. Sayounara.',
        ru: 'Да, до завтра. До свидания.',
      },
    ],
    vocabulary: [
      { jp: '帰る', romaji: 'kaeru', ru: 'уходить, возвращаться' },
      { jp: '遅い', romaji: 'osoi', ru: 'поздно, медленно' },
      { jp: 'また', romaji: 'mata', ru: 'опять, ещё раз' },
      { jp: 'さようなら', romaji: 'sayounara', ru: 'до свидания' },
    ],
  },
  {
    id: 'dl-4',
    title: 'Вопросы в магазине',
    situation: 'Ты спрашиваешь цену товара',
    level: 'medium',
    lines: [
      {
        speaker: 'A',
        jp: 'すみません、この本はいくらですか。',
        romaji: 'Sumimasen, kono hon wa ikura desu ka.',
        ru: 'Извините, сколько стоит эта книга?',
      },
      {
        speaker: 'B',
        jp: 'これは千500円です。',
        romaji: 'Kore wa sen gohyaku en desu.',
        ru: 'Это стоит 1500 иен.',
      },
      {
        speaker: 'A',
        jp: 'もう少し安いのはありますか。',
        romaji: 'Mou sukoshi yasui no wa arimasu ka.',
        ru: 'Есть что-нибудь подешевле?',
      },
      {
        speaker: 'B',
        jp: 'はい、こちらは千円です。',
        romaji: 'Hai, kochira wa sen en desu.',
        ru: 'Да, вот эта стоит 1000 иен.',
      },
    ],
    vocabulary: [
      { jp: 'いくら', romaji: 'ikura', ru: 'сколько' },
      { jp: '安い', romaji: 'yasui', ru: 'дешёвый' },
      { jp: 'の', romaji: 'no', ru: '[показатель существительного]' },
    ],
  },
  {
    id: 'dl-5',
    title: 'Работа и хобби',
    situation: 'Разговор о работе и увлечениях',
    level: 'medium',
    lines: [
      {
        speaker: 'A',
        jp: 'お仕事は何ですか。',
        romaji: 'O-shigoto wa nan desu ka.',
        ru: 'Чем ты занимаешься?',
      },
      {
        speaker: 'B',
        jp: 'コンピューターの会社で働いています。',
        romaji: 'Konpyūtā no kaisha de hataraite imasu.',
        ru: 'Я работаю в компании по компьютерам.',
      },
      {
        speaker: 'A',
        jp: '趣味は何ですか。',
        romaji: 'Shumi wa nan desu ka.',
        ru: 'Какое у тебя хобби?',
      },
      {
        speaker: 'B',
        jp: '読書と映画が好きです。',
        romaji: 'Dokusho to eiga ga suki desu.',
        ru: 'Мне нравятся чтение и кино.',
      },
    ],
    vocabulary: [
      { jp: 'お仕事', romaji: 'o-shigoto', ru: 'работа' },
      { jp: '働く', romaji: 'hataraiku', ru: 'работать' },
      { jp: '趣味', romaji: 'shumi', ru: 'хобби' },
      { jp: '読書', romaji: 'dokusho', ru: 'чтение' },
      { jp: '映画', romaji: 'eiga', ru: 'кинофильм' },
    ],
  },
]
