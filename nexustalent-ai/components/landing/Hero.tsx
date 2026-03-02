'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Sparkles, Users, FileCheck, TrendingUp } from 'lucide-react'

const STATS = [
  { icon: FileCheck, value: '10,000+', label: 'CVs Scored' },
  { icon: Users, value: '2,000+', label: 'HR Teams' },
  { icon: TrendingUp, value: '94%', label: 'ATS Pass Rate' },
]

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { 
        staggerChildren: 0.15,
         delayChildren: 0.2 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1,
     y: 0, 
     transition: { 
        duration: 0.6, 
        ease: 'easeOut' as const } },
} as const;

export default function Hero() {
  const router = useRouter()

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-16">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      >
        {/* Badge */}
        <motion.div variants={itemVariants} className="mb-6">
          <Badge
            variant="outline"
            className="px-4 py-1.5 text-sm border-violet-500/30 bg-violet-500/10 text-violet-300"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 inline" />
            AI-Powered Talent Intelligence Platform
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          variants={itemVariants}
          className="text-4xl sm:text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] mb-6"
        >
          Land Your Dream Job.
          <br />
          <span className="gradient-text">Hire the Best Talent.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          variants={itemVariants}
          className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          NexusTalent AI scores your CV against any ATS in seconds — and helps
          HR teams rank hundreds of candidates against a job description
          automatically.
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button
            size="lg"
            className="w-full sm:w-auto px-8 h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all text-base"
            onClick={() => router.push('/auth/login?mode=signup&role=jobseeker')}
          >
            <FileCheck className="w-5 h-5 mr-2" />
            Check My CV Free
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="w-full sm:w-auto px-8 h-12 border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold transition-all text-base backdrop-blur-sm"
            onClick={() => router.push('/auth/login?mode=signup&role=hr_manager')}
          >
            <Users className="w-5 h-5 mr-2" />
            Start Hiring Smarter
          </Button>
        </motion.div>

        {/* Stats */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mb-16"
        >
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="text-center">
              <div className="flex justify-center mb-1">
                <Icon className="w-4 h-4 text-violet-400" />
              </div>
              <div className="text-xl sm:text-2xl font-bold text-white">{value}</div>
              <div className="text-xs sm:text-sm text-slate-500">{label}</div>
            </div>
          ))}
        </motion.div>

        {/* Dashboard mockup */}
        <motion.div
          variants={itemVariants}
          className="relative mx-auto max-w-4xl"
        >
          <div className="relative rounded-2xl overflow-hidden gradient-border glow p-0.5">
            <div className="rounded-2xl bg-slate-900 p-6 sm:p-8">
              {/* Mockup Header */}
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-4 h-6 rounded-md bg-slate-800 flex items-center px-3">
                  <span className="text-xs text-slate-500">nexustalent.ai/dashboard</span>
                </div>
              </div>

              {/* Mockup Content */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                  { label: 'ATS Score', value: '87', color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
                  { label: 'Keywords Match', value: '92%', color: 'text-violet-400', bg: 'bg-violet-500/10' },
                  { label: 'Candidates Ranked', value: '48', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                ].map((stat) => (
                  <div key={stat.label} className={`rounded-xl p-4 ${stat.bg}`}>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-slate-500 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Mockup candidates */}
              <div className="space-y-2">
                {[
                  { name: 'Sarah Johnson', role: 'Senior Developer', score: 94 },
                  { name: 'Michael Chen', role: 'Full Stack Engineer', score: 88 },
                  { name: 'Priya Patel', role: 'Software Engineer', score: 81 },
                ].map((c, i) => (
                  <div
                    key={c.name}
                    className="flex items-center gap-4 p-3 rounded-lg bg-slate-800/60"
                  >
                    <span className="text-xs text-slate-500 w-4">#{i + 1}</span>
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">
                      {c.name[0]}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium text-white">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.role}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 rounded-full bg-slate-700">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500"
                          style={{ width: `${c.score}%` }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-violet-400">{c.score}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating badge */}
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-4 -right-4 glass rounded-xl px-3 py-2 shadow-lg"
          >
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-medium text-emerald-400">AI Ranking Live</span>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}