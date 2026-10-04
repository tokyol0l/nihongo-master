import { AnimatePresence, motion } from 'framer-motion'
import { BookOpen, ListChecks } from 'lucide-react'
import { useState } from 'react'
import clsx from 'clsx'
import { grammarLessons } from '../data/grammar'
import { TheoryTab } from '../components/grammar/TheoryTab'
import { ExercisesTab } from '../components/grammar/ExercisesTab'

type Tab = 'theory' | 'exercises'

/** Страница «Грамматика»: уроки 1-5 из учебника, теория и задания по каждому */
export default function Grammar() {
  const [lessonIndex, setLessonIndex] = useState(0)
  const [tab, setTab] = useState<Tab>('theory')

  const lesson = grammarLessons[lessonIndex]

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-6 text-center">
        <div className="jp text-sm text-fg/40">文法</div>
        <h1 className="text-3xl font-bold sm:text-4xl">Грамматика</h1>
        <p className="mt-2 text-sm text-fg/50">
          Пять уроков учебника «Минна но Нихонго I» — теория и задания
        </p>
      </div>

      {/* Выбор урока */}
      <div className="mb-4 flex flex-wrap gap-2">
        {grammarLessons.map((l, i) => (
          <button
            key={l.id}
            onClick={() => {
              setLessonIndex(i)
              setTab('theory')
            }}
            className={clsx(
              'rounded-lg px-3 py-2 text-sm font-semibold transition-colors',
              i === lessonIndex
                ? 'bg-accent text-white'
                : 'glass text-fg/60 hover:text-fg',
            )}
          >
            Урок {l.number}
          </button>
        ))}
      </div>

      <div className="glass mb-5 rounded-lg p-4">
        <h2 className="text-lg font-bold">{lesson.title}</h2>
        <p className="mt-1 text-sm text-fg/55">{lesson.summary}</p>
      </div>

      {/* Переключатель Теория / Задания */}
      <div className="mb-5 flex gap-2">
        <button
          onClick={() => setTab('theory')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors',
            tab === 'theory' ? 'bg-accent text-white' : 'glass text-fg/60 hover:text-fg',
          )}
        >
          <BookOpen size={16} /> Теория
        </button>
        <button
          onClick={() => setTab('exercises')}
          className={clsx(
            'flex flex-1 items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-colors',
            tab === 'exercises' ? 'bg-accent text-white' : 'glass text-fg/60 hover:text-fg',
          )}
        >
          <ListChecks size={16} /> Задания
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={lesson.id + tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {tab === 'theory' ? <TheoryTab lesson={lesson} /> : <ExercisesTab lesson={lesson} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
