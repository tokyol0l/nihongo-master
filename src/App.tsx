import { Suspense, lazy } from 'react'
import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import Home from './pages/Home'

// Главная грузится сразу, остальные страницы — только когда на них заходят.
// Так первый экран открывается быстрее.
const Roadmap = lazy(() => import('./pages/Roadmap'))
const Hiragana = lazy(() => import('./pages/Hiragana'))
const Katakana = lazy(() => import('./pages/Katakana'))
const Kanji = lazy(() => import('./pages/Kanji'))
const Vocabulary = lazy(() => import('./pages/Vocabulary'))
const KanjiWriting = lazy(() => import('./pages/KanjiWriting'))
const Grammar = lazy(() => import('./pages/Grammar'))
const SentenceBuilder = lazy(() => import('./pages/SentenceBuilder'))
const JapanMap = lazy(() => import('./pages/JapanMap'))
const Review = lazy(() => import('./pages/Review'))
const Quiz = lazy(() => import('./pages/Quiz'))
const Exam = lazy(() => import('./pages/Exam'))
const Dialogues = lazy(() => import('./pages/Dialogues'))
const Textbook = lazy(() => import('./pages/Textbook'))
const Progress = lazy(() => import('./pages/Progress'))
const Stats = lazy(() => import('./pages/Stats'))
const Settings = lazy(() => import('./pages/Settings'))
const NotFound = lazy(() => import('./pages/NotFound'))

/** Заглушка на те доли секунды, пока подгружается страница */
function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-fg/15 border-t-sakura" />
    </div>
  )
}

/** Все маршруты приложения */
export default function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/roadmap" element={<Roadmap />} />
          <Route path="/hiragana" element={<Hiragana />} />
          <Route path="/katakana" element={<Katakana />} />
          <Route path="/kanji" element={<Kanji />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/kanji-writing" element={<KanjiWriting />} />
          <Route path="/grammar" element={<Grammar />} />
          <Route path="/sentence-builder" element={<SentenceBuilder />} />
          <Route path="/japan-map" element={<JapanMap />} />
          <Route path="/review" element={<Review />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/dialogues" element={<Dialogues />} />
          <Route path="/textbook" element={<Textbook />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Layout>
  )
}
