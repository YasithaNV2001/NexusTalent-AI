'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const TESTIMONIALS = [
  {
    name: 'Emily Rodriguez',
    role: 'Senior Recruiter',
    company: 'TechScale Inc.',
    location: 'San Francisco, CA',
    avatar: 'ER',
    rating: 5,
    text: "NexusTalent AI cut our candidate screening time by 80%. What used to take our team a full day now takes 15 minutes. The AI ranking is remarkably accurate.",
    color: 'from-violet-500 to-indigo-500',
  },
  {
    name: 'James Okafor',
    role: 'Software Engineer',
    company: 'Jobseeker',
    location: 'London, UK',
    avatar: 'JO',
    rating: 5,
    text: "My ATS score went from 42 to 87 after following NexusTalent's suggestions. I got 3 interview calls in the following week. Genuinely transformed my job search.",
    color: 'from-emerald-500 to-teal-500',
  },
  {
    name: 'Priya Menon',
    role: 'Head of Talent',
    company: 'Nexus Ventures',
    location: 'Singapore',
    avatar: 'PM',
    rating: 5,
    text: "The bulk upload feature is a game-changer. We uploaded 200 CVs for a single role and had a ranked shortlist in under 5 minutes. At $49/mo, it's a no-brainer.",
    color: 'from-rose-500 to-pink-500',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Loved by Teams <span className="gradient-text">Worldwide</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            From solo job seekers to enterprise HR teams — results speak for themselves.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl glass hover:bg-white/8 transition-all duration-300"
            >
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 text-amber-400 fill-amber-400" />
                ))}
              </div>

              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-full bg-linear-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}
                >
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-slate-500">
                    {t.role} · {t.company}
                  </div>
                  <div className="text-xs text-slate-600">{t.location}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}