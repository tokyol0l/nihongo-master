import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

/** Страница, которая показывается по неизвестному адресу */
export default function NotFound() {
  return (
    <motion.div
      className="mx-auto max-w-md text-center"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <div className="jp text-7xl font-black text-fg/80">迷子</div>
      <h1 className="mt-4 text-2xl font-extrabold">Страница потерялась</h1>
      <p className="mt-2 text-sm text-fg/50">Такого адреса в приложении нет.</p>
      <Link
        to="/"
        className="glass mt-6 inline-block rounded-2xl px-6 py-3 text-sm font-bold transition hover:bg-fg/10"
      >
        На главную
      </Link>
    </motion.div>
  )
}
