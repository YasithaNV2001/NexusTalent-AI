'use client'

import { motion } from 'framer-motion'
import {
  Zap, Target, FileText, BarChart2,
  Shield, Globe, RefreshCw, Download,
} from 'lucide-react'

const FEATURES = [
  {
    icon: Zap,
    title: 'Instant ATS Scoring',
    description: 'Get your CV scored against real ATS criteria in under 3 seconds. Know exactly where you stand before applying.',
    color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    icon: Target,
    title: 'Keyword Gap Analysis',
    description: 'AI identifies missing keywords from job descriptions and suggests where to naturally incorporate them.',
    color: 'from-violet-500/20 to-purple-500/20 border-violet-500/20',
    iconColor: 'text-violet-400',
  },
  {
    icon: BarChart2,
    title: 'Bulk Candidate Ranking',
    description: 'Upload hundreds of CVs at once. AI ranks every candidate by relevance to your specific job description.',
    color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    icon: FileText,
    title: 'Live CV Editor',
    description: 'Edit your CV in a split-pane editor with real-time AI suggestions. Auto-saved so you never lose your work.',
    color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    icon: Download,
    title: 'PDF & Word Export',
    description: 'Export your optimized CV as a professional PDF or DOCX, perfectly formatted for any application.',
    color: 'from-cyan-500/20 to-sky-500/20 border-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    icon: Shield,
    title: 'Strict Data Privacy',
    description: 'Your CVs are encrypted at rest and in transit. Row-level security ensures complete data isolation.',
    color: 'from-rose-500/20 to-pink-500/20 border-rose-500/20',
    iconColor: 'text-rose-400',
  },
  {
    icon: Globe,
    title: 'Built for Global Teams',
    description: 'Multi-timezone support, USD pricing, and infrastructure deployed across global regions for low latency.',
    color: 'from-blue-500/20 to-violet-500/20 border-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    icon: RefreshCw,
    title: 'Cycle-Based Quotas',
    description: 'Fair usage quotas that reset with each billing cycle. Upgrade anytime to unlock higher limits.',
    color: 'from-orange-500/20 to-amber-500/20 border-orange-500/20',
    iconColor: 'text-orange-400',
  },
]

export default function Features() {
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
            Everything You <span className="gradient-text">Need</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            A complete talent intelligence suite for both sides of the hiring equation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {FEATURES.map(({ icon: Icon, title, description, color, iconColor }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.5 }}
              whileHover={{ y: -4, transition: { duration: 0.2 } }}
              className="group relative p-5 rounded-2xl glass hover:bg-white/8 transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
              >
                <Icon className={`w-5 h-5 ${iconColor}`} />
              </div>
              <h3 className="text-sm font-semibold text-white mb-2">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}