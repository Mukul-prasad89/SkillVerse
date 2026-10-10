import { Mail, Globe, AtSign, MapPin } from 'lucide-react'
import Navbar from '../components/Navbar'
import ContactForm from '../components/ContactForm'

export default function Contact() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-14">
        <h1 className="font-display text-4xl font-bold text-white text-center">Contact us</h1>
        <p className="text-gray-400 mt-2 text-sm text-center">Questions, feedback, college collabs — we reply within 24hrs.</p>
        <div className="rounded-3xl glass p-8 md:p-10 grid md:grid-cols-2 gap-8 mt-8">
          <div className="space-y-3 text-sm">
            <a href="mailto:mukulprasad89@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Mail className="w-4 h-4 text-gray-300" /> <span><span className="text-gray-500 text-xs block">Email 1</span>mukulprasad89@gmail.com</span></a>
            <a href="mailto:kunaldubey1810@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Mail className="w-4 h-4 text-gray-300" /> <span><span className="text-gray-500 text-xs block">Email 2</span>kunaldubey1810@gmail.com</span></a>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/10 text-gray-200"><MapPin className="w-4 h-4 text-gray-400" /> India • Remote friendly</div>
            <div className="flex gap-2">
              <a href="https://github.com/Mukul-prasad89" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Globe className="w-4 h-4" /> GitHub 1</a>
              <a href="https://github.com/kunaldubey10" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><Globe className="w-4 h-4" /> GitHub 2</a>
              <a href="https://x.com" target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/30 text-gray-200"><AtSign className="w-4 h-4" /> Twitter</a>
            </div>
          </div>
          <ContactForm />
        </div>
      </div>
    </div>
  )
}
