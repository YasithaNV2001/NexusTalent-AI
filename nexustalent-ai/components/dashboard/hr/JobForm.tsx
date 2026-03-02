'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, Plus, X, Loader2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'

interface JobFormProps {
  onSuccess: () => void
}

export default function JobForm({ onSuccess }: JobFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [experienceYears, setExperienceYears] = useState('')
  const [location, setLocation] = useState('')
  const [employmentType, setEmploymentType] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const addSkill = () => {
    const s = skillInput.trim()
    if (s && !skills.includes(s)) {
      setSkills([...skills, s])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !description.trim()) {
      toast.error('Title and description are required.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          required_skills: skills,
          experience_years: experienceYears ? parseInt(experienceYears) : null,
          location: location.trim() || null,
          employment_type: employmentType.trim() || null,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Failed to create job.')
        return
      }

      toast.success('Job description created successfully!')
      onSuccess()
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-6 space-y-6"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <Briefcase className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">New Job Description</h2>
          <p className="text-xs text-slate-500">
            AI will match uploaded CVs against this description.
          </p>
        </div>
      </div>

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm text-slate-300">
          Job Title <span className="text-red-400">*</span>
        </Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Senior Full Stack Developer"
          className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50"
        />
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm text-slate-300">
          Job Description <span className="text-red-400">*</span>
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Paste the full job description here. The AI will extract key requirements and use them to rank candidates."
          rows={6}
          className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50 resize-none"
        />
      </div>

      {/* Skills */}
      <div className="space-y-2">
        <Label className="text-sm text-slate-300">Required Skills</Label>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addSkill()
              }
            }}
            placeholder="Type a skill and press Enter"
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addSkill}
            className="shrink-0 border-slate-700/50 text-slate-400 hover:text-white hover:border-violet-500/50"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.map((s) => (
              <Badge
                key={s}
                variant="outline"
                className="bg-violet-500/10 text-violet-300 border-violet-500/20 cursor-pointer hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20 transition-all"
                onClick={() => removeSkill(s)}
              >
                {s}
                <X className="w-3 h-3 ml-1" />
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Row: Experience + Location + Type */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="exp" className="text-sm text-slate-300">Min Experience (yr)</Label>
          <Input
            id="exp"
            type="number"
            min={0}
            value={experienceYears}
            onChange={(e) => setExperienceYears(e.target.value)}
            placeholder="e.g. 3"
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="loc" className="text-sm text-slate-300">Location</Label>
          <Input
            id="loc"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Remote / Colombo"
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type" className="text-sm text-slate-300">Employment Type</Label>
          <Input
            id="type"
            value={employmentType}
            onChange={(e) => setEmploymentType(e.target.value)}
            placeholder="e.g. Full-time"
            className="bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus:border-violet-500/50"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={submitting}
          className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white px-6"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Creating…
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Create Job
            </>
          )}
        </Button>
      </div>
    </motion.form>
  )
}
