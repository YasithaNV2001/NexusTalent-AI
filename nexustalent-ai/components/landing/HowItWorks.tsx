'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Cpu, Download, Briefcase, Users, BarChart3 } from 'lucide-react'

const B2C_STEPS = [
  {
    icon: Upload,
    step: '01',
    title: 'Upload Your CV',
    description:
      'Drag and drop your PDF resume. Our parser instantly extracts your skills, experience, and education.',
  },
  {
    icon: Cpu,
    step: '02',
    title: 'AI Scores & Suggests',
    description:
      'Get an ATS score out of 100, keyword gap analysis, and prioritized improvement suggestions in seconds.',
  },
  {
    icon: Download,
    step: '03',
    title: 'Edit & Export',
    description:
      'Use our live editor to apply suggestions, then download a polished PDF or Word document ready for any ATS.',
  },
]

const B2B_STEPS = [
  {
    icon: Briefcase,
    step: '01',
    title: 'Create Job Description',
    description:
      'Define the role with required skills, experience level, and location. Takes under 2 minutes.',
  },
  {
    icon: Users,
    step: '02',
    title: 'Upload Candidate CVs',
    description:
      'Drag and drop up to hundreds of PDF resumes at once. Our AI processes them all simultaneously.',
  },
  {
    icon: BarChart3,
    step: '03',
    title: 'Review Ranked Results',
    description:
      'Candidates are ranked by match score. Filter, sort, and shortlist the best fits in one view.',
  },
]

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<'b2c' | 'b2b'>('b2c')

  const steps = activeTab === 'b2c' ? B2C_STEPS : B2B_STEPS

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Whether you're a job seeker or an HR team, NexusTalent AI fits your workflow.
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex justify-center mb-12">
          <div className="flex p-1 rounded-xl bg-slate-900 border border-white/5">
            {(['b2c', 'b2b'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {activeTab === tab && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg bg-linear-to-r from-violet-600 to-indigo-600"
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">
                  {tab === 'b2c' ? '👤 For Job Seekers' : '🏢 For HR Teams'}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {steps.map(({ icon: Icon, step, title, description }, i) => (
              <motion.div
                key={step}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="relative group"
              >
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(50%+3rem)] right-[-calc(50%-3rem)] h-px bg-linear-to-r from-violet-500/50 to-transparent" />
                )}

                <div className="relative p-6 rounded-2xl glass hover:bg-white/8 transition-all duration-300 group-hover:glow-sm">
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-linear-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20 flex items-center justify-center group-hover:from-violet-500/30 group-hover:to-indigo-500/30 transition-all">
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                      <span className="absolute -top-2 -right-2 text-xs font-bold text-violet-500">
                        {step}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
                      <p className="text-slate-400 text-sm leading-relaxed">{description}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  )
}