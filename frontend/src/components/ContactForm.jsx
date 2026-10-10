import { useState } from 'react'
import { Send } from 'lucide-react'

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)
  const submit = (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) return alert('Fill all fields')
    try {
      const inbox = JSON.parse(localStorage.getItem('contact-inbox') || '[]')
      localStorage.setItem('contact-inbox', JSON.stringify([{ ...form, at: Date.now() }, ...inbox].slice(0, 20)))
    } catch {}
    setSent(true)
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setSent(false), 4000)
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
        <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" placeholder="Email address" className="px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
      </div>
      <input placeholder="Subject (optional)" className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600" />
      <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={5} placeholder="Tell us: your dream role, college, or feedback..." className="w-full px-4 py-3 rounded-xl bg-black/40 border border-white/10 text-white text-sm outline-none focus:border-white/40 placeholder:text-gray-600 resize-none" />
      <button type="submit" className="w-full py-3.5 rounded-xl bg-white text-black font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 glow-violet">
        <Send className="w-4 h-4" /> {sent ? 'Message sent — we will reply soon!' : 'Send message'}
      </button>
      {sent && <p className="text-xs text-white text-center">Saved locally + ready to wire to FastAPI /api/contact</p>}
    </form>
  )
}
