'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save,
  RotateCcw,
  Download,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Sparkles,
  Briefcase,
  GraduationCap,
  User,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cn, getScoreColor, getScoreBg } from '@/lib/utils'
import type { Resume, ParsedResumeData, AISuggestion } from '@/types'

interface CVEditorProps {
  resume: Resume
  onUpdate: () => void
}

const PRIORITY_COLORS = {
  high: 'bg-red-500/10 text-red-400 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  low: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

const CATEGORY_ICONS = {
  formatting: AlertTriangle,
  content: Lightbulb,
  keywords: Sparkles,
  impact: Sparkles,
}

export default function CVEditor({ resume, onUpdate }: CVEditorProps) {
  const [draft, setDraft] = useState<ParsedResumeData>(
    resume.draft_content || resume.parsed_data || {
      skills: [],
      experience: [],
      education: [],
      summary: null,
    }
  )
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [newSkill, setNewSkill] = useState('')
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-save with debounce
  const autoSave = useCallback(
    async (data: ParsedResumeData) => {
      setSaving(true)
      setSaved(false)
      try {
        const res = await fetch('/api/resume', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ resumeId: resume.id, draft_content: data }),
        })
        if (res.ok) {
          setSaved(true)
          setTimeout(() => setSaved(false), 2000)
        }
      } catch {
        // Silent fail on auto-save
      } finally {
        setSaving(false)
      }
    },
    [resume.id]
  )

  const updateDraft = useCallback(
    (updater: (prev: ParsedResumeData) => ParsedResumeData) => {
      setDraft((prev) => {
        const next = updater(prev)
        if (debounceRef.current) clearTimeout(debounceRef.current)
        debounceRef.current = setTimeout(() => autoSave(next), 800)
        return next
      })
    },
    [autoSave]
  )

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleReset = () => {
    const original = resume.parsed_data || {
      skills: [],
      experience: [],
      education: [],
      summary: null,
    }
    setDraft(original)
    autoSave(original)
  }

  const handleAddSkill = () => {
    const skill = newSkill.trim()
    if (!skill || draft.skills.includes(skill)) return
    updateDraft((d) => ({ ...d, skills: [...d.skills, skill] }))
    setNewSkill('')
  }

  const handleRemoveSkill = (index: number) => {
    updateDraft((d) => ({
      ...d,
      skills: d.skills.filter((_, i) => i !== index),
    }))
  }

  const handleExperienceChange = (
    index: number,
    field: keyof ParsedResumeData['experience'][0],
    value: string
  ) => {
    updateDraft((d) => ({
      ...d,
      experience: d.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      ),
    }))
  }

  const handleAddExperience = () => {
    updateDraft((d) => ({
      ...d,
      experience: [
        ...d.experience,
        { company: '', title: '', duration: '', description: '' },
      ],
    }))
  }

  const handleRemoveExperience = (index: number) => {
    updateDraft((d) => ({
      ...d,
      experience: d.experience.filter((_, i) => i !== index),
    }))
  }

  const handleEducationChange = (
    index: number,
    field: keyof ParsedResumeData['education'][0],
    value: string
  ) => {
    updateDraft((d) => ({
      ...d,
      education: d.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }))
  }

  const suggestions = resume.ai_suggestions || []

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* ── Left: Editor pane ───────────────────────────────────────────────── */}
      <div className="lg:col-span-2 space-y-6">
        {/* Header with ATS score + actions */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div
                className={cn(
                  'text-3xl font-bold',
                  getScoreColor(resume.ats_score ?? 0)
                )}
              >
                {resume.ats_score ?? '—'}
              </div>
              <p className="text-xs text-slate-400">ATS Score</p>
            </div>
            <div className="h-10 w-px bg-slate-700" />
            <div>
              <p className="text-sm font-medium text-white">
                {resume.candidate_name || 'Your CV'}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {saving && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                  </span>
                )}
                {saved && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-1 text-xs text-emerald-400"
                  >
                    <CheckCircle2 className="w-3 h-3" /> Saved
                  </motion.span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              Reset
            </Button>
            <Button
              size="sm"
              className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
              disabled
              title="Export coming in v1"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* ATS Score bar */}
        <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-400">ATS Compatibility</span>
            <span className={cn('text-xs font-bold', getScoreColor(resume.ats_score ?? 0))}>
              {resume.ats_score ?? 0}/100
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-700 overflow-hidden">
            <motion.div
              className={cn('h-full rounded-full', getScoreBg(resume.ats_score ?? 0))}
              initial={{ width: 0 }}
              animate={{ width: `${resume.ats_score ?? 0}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>

        {/* Summary */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Professional Summary</h3>
          </div>
          <Textarea
            value={draft.summary || ''}
            onChange={(e) =>
              updateDraft((d) => ({ ...d, summary: e.target.value }))
            }
            placeholder="Write a compelling 2-3 sentence summary..."
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 min-h-20 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
          />
        </div>

        {/* Skills */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Skills</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {draft.skills.map((skill, idx) => (
              <Badge
                key={idx}
                variant="outline"
                className="bg-slate-800/50 border-slate-700 text-slate-300 hover:border-red-500/50 group cursor-pointer"
                onClick={() => handleRemoveSkill(idx)}
              >
                {skill}
                <X className="w-3 h-3 ml-1.5 opacity-0 group-hover:opacity-100 text-red-400 transition-opacity" />
              </Badge>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              placeholder="Add a skill..."
              className="h-8 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddSkill}
              className="h-8 border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Experience */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Experience</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAddExperience}
              className="h-7 text-xs border-slate-700 bg-slate-800/50 hover:bg-slate-700/50 text-slate-300"
            >
              <Plus className="w-3 h-3 mr-1" /> Add
            </Button>
          </div>
          {draft.experience.map((exp, idx) => (
            <motion.div
              key={idx}
              layout
              className="rounded-lg bg-slate-800/30 border border-slate-700/30 p-4 space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Job Title</Label>
                    <Input
                      value={exp.title}
                      onChange={(e) =>
                        handleExperienceChange(idx, 'title', e.target.value)
                      }
                      className="h-8 bg-slate-800/50 border-slate-700/50 text-white text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-slate-400">Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        handleExperienceChange(idx, 'company', e.target.value)
                      }
                      className="h-8 bg-slate-800/50 border-slate-700/50 text-white text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                    />
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveExperience(idx)}
                  className="ml-2 p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Duration</Label>
                <Input
                  value={exp.duration}
                  onChange={(e) =>
                    handleExperienceChange(idx, 'duration', e.target.value)
                  }
                  placeholder="e.g., 2022 – Present"
                  className="h-8 bg-slate-800/50 border-slate-700/50 text-white text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Description</Label>
                <Textarea
                  value={exp.description}
                  onChange={(e) =>
                    handleExperienceChange(idx, 'description', e.target.value)
                  }
                  className="bg-slate-800/50 border-slate-700/50 text-white text-sm min-h-15 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Education */}
        <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-4">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-violet-400" />
            <h3 className="text-sm font-semibold text-white">Education</h3>
          </div>
          {draft.education.map((edu, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Institution</Label>
                <Input
                  value={edu.institution}
                  onChange={(e) =>
                    handleEducationChange(idx, 'institution', e.target.value)
                  }
                  className="h-8 bg-slate-800/50 border-slate-700/50 text-white text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) =>
                    handleEducationChange(idx, 'degree', e.target.value)
                  }
                  className="h-8 bg-slate-800/50 border-slate-700/50 text-white text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-slate-400">Year</Label>
                <Input
                  value={edu.year}
                  onChange={(e) =>
                    handleEducationChange(idx, 'year', e.target.value)
                  }
                  className="h-8 bg-slate-800/50 border-slate-700/50 text-white text-sm focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: AI Suggestions pane ──────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="sticky top-20">
          <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 overflow-hidden">
            <button
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="w-full flex items-center justify-between p-4 text-left"
            >
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold text-white">
                  AI Suggestions
                </h3>
                <Badge variant="outline" className="bg-violet-500/10 text-violet-400 border-violet-500/20 text-xs">
                  {suggestions.length}
                </Badge>
              </div>
              {showSuggestions ? (
                <ChevronUp className="w-4 h-4 text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-400" />
              )}
            </button>
            <AnimatePresence>
              {showSuggestions && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  exit={{ height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    {suggestions.map((suggestion: AISuggestion, idx: number) => {
                      const Icon = CATEGORY_ICONS[suggestion.category] || Lightbulb
                      return (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="rounded-lg bg-slate-800/40 border border-slate-700/30 p-3 space-y-2"
                        >
                          <div className="flex items-center gap-2">
                            <Icon className="w-3.5 h-3.5 text-violet-400" />
                            <span className="text-xs font-medium text-slate-300 capitalize">
                              {suggestion.category}
                            </span>
                            <Badge
                              variant="outline"
                              className={cn('text-[10px] px-1.5 py-0', PRIORITY_COLORS[suggestion.priority])}
                            >
                              {suggestion.priority}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">
                            {suggestion.text}
                          </p>
                        </motion.div>
                      )
                    })}
                    {suggestions.length === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">
                        No suggestions yet. Upload a CV to get AI feedback.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
