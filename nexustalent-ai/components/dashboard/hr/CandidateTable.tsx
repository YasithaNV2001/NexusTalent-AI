'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  ArrowUpDown,
  Loader2,
  Trophy,
  Mail,
  FileText,
  ChevronDown,
  ChevronUp,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, getScoreColor, getScoreBg } from '@/lib/utils'
import type { Resume, ParsedResumeData } from '@/types'

interface CandidateTableProps {
  jobId: string
}

type SortKey = 'match_score' | 'ats_score' | 'candidate_name'
type SortDir = 'asc' | 'desc'

export default function CandidateTable({ jobId }: CandidateTableProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('match_score')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const fetchCandidates = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/resume?jobId=${jobId}`)
      const data = await res.json()
      if (res.ok) setResumes(data.resumes || [])
    } catch {
      // Silent
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    fetchCandidates()
  }, [fetchCandidates])

  // Auto-refresh every 10 seconds to pick up new uploads
  useEffect(() => {
    const interval = setInterval(fetchCandidates, 10000)
    return () => clearInterval(interval)
  }, [fetchCandidates])

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  const sorted = [...resumes].sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0

    if (sortKey === 'match_score') {
      aVal = a.match_score ?? 0
      bVal = b.match_score ?? 0
    } else if (sortKey === 'ats_score') {
      aVal = a.ats_score ?? 0
      bVal = b.ats_score ?? 0
    } else {
      aVal = (a.candidate_name ?? '').toLowerCase()
      bVal = (b.candidate_name ?? '').toLowerCase()
    }

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDir === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
    }
    return sortDir === 'asc' ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number)
  })

  const renderSkills = (parsed: ParsedResumeData | null) => {
    if (!parsed?.skills?.length) return null
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {parsed.skills.slice(0, 8).map((s) => (
          <Badge key={s} variant="outline" className="text-[10px] bg-slate-800/50 text-slate-400 border-slate-700/50">
            {s}
          </Badge>
        ))}
        {parsed.skills.length > 8 && (
          <span className="text-[10px] text-slate-500">+{parsed.skills.length - 8} more</span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (resumes.length === 0) {
    return (
      <div className="text-center py-12 rounded-xl bg-slate-900/30 border border-slate-800/50">
        <Users className="w-10 h-10 text-slate-600 mx-auto mb-3" />
        <p className="text-sm text-slate-500">
          No candidates yet. Upload CVs above to start ranking.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-300">
          <Users className="w-4 h-4 inline mr-1.5 text-violet-400" />
          Ranked Candidates ({resumes.length})
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={fetchCandidates}
          className="text-slate-400 hover:text-white"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1" />
          Refresh
        </Button>
      </div>

      {/* Sort controls */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-500">Sort by:</span>
        {(['match_score', 'ats_score', 'candidate_name'] as SortKey[]).map((key) => (
          <button
            key={key}
            onClick={() => toggleSort(key)}
            className={cn(
              'px-2.5 py-1 rounded-md transition-all flex items-center gap-1',
              sortKey === key
                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                : 'text-slate-500 hover:text-slate-300'
            )}
          >
            {key === 'match_score' ? 'Match' : key === 'ats_score' ? 'ATS' : 'Name'}
            {sortKey === key && (
              <ArrowUpDown className="w-3 h-3" />
            )}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-800/80 overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-[auto_1fr_80px_80px_40px] gap-4 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800/60 text-xs font-medium text-slate-500 uppercase tracking-wider">
          <div className="w-8 text-center">#</div>
          <div>Candidate</div>
          <div className="text-center">Match</div>
          <div className="text-center">ATS</div>
          <div />
        </div>

        {/* Rows */}
        {sorted.map((resume, i) => {
          const rank = i + 1
          const isExpanded = expandedId === resume.id

          return (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <div
                className={cn(
                  'grid grid-cols-[auto_1fr_80px_80px_40px] gap-4 px-4 py-3 items-center border-b border-slate-800/40 cursor-pointer hover:bg-slate-900/60 transition-colors',
                  isExpanded && 'bg-slate-900/40'
                )}
                onClick={() => setExpandedId(isExpanded ? null : resume.id)}
              >
                {/* Rank */}
                <div className="w-8 text-center">
                  {rank <= 3 ? (
                    <div
                      className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mx-auto',
                        rank === 1 && 'bg-yellow-500/10 text-yellow-400',
                        rank === 2 && 'bg-slate-400/10 text-slate-300',
                        rank === 3 && 'bg-orange-500/10 text-orange-400'
                      )}
                    >
                      {rank === 1 ? <Trophy className="w-3.5 h-3.5" /> : rank}
                    </div>
                  ) : (
                    <span className="text-xs text-slate-600 font-mono">{rank}</span>
                  )}
                </div>

                {/* Candidate info */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white truncate">
                      {resume.candidate_name || 'Unknown'}
                    </p>
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-[10px]',
                        resume.status === 'scored'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                      )}
                    >
                      {resume.status}
                    </Badge>
                  </div>
                  {resume.candidate_email && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Mail className="w-3 h-3" />
                      {resume.candidate_email}
                    </p>
                  )}
                </div>

                {/* Match score */}
                <div className="text-center">
                  <div className="space-y-1">
                    <span className={cn('text-sm font-bold', getScoreColor(resume.match_score ?? 0))}>
                      {resume.match_score ?? '—'}
                    </span>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto max-w-[60px]">
                      <div
                        className={cn('h-full rounded-full transition-all', getScoreBg(resume.match_score ?? 0))}
                        style={{ width: `${resume.match_score ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* ATS score */}
                <div className="text-center">
                  <div className="space-y-1">
                    <span className={cn('text-sm font-bold', getScoreColor(resume.ats_score ?? 0))}>
                      {resume.ats_score ?? '—'}
                    </span>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto max-w-[60px]">
                      <div
                        className={cn('h-full rounded-full transition-all', getScoreBg(resume.ats_score ?? 0))}
                        style={{ width: `${resume.ats_score ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Expand */}
                <div className="text-center">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 mx-auto" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 mx-auto" />
                  )}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-4 bg-slate-950/50 border-b border-slate-800/40"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-12">
                    {/* Skills */}
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Skills</p>
                      {renderSkills(resume.parsed_data)}
                    </div>

                    {/* Experience */}
                    <div>
                      <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Experience</p>
                      {resume.parsed_data?.experience?.slice(0, 2).map((exp, j) => (
                        <div key={j} className="mb-2">
                          <p className="text-xs font-medium text-white">{exp.title}</p>
                          <p className="text-[10px] text-slate-500">
                            {exp.company} · {exp.duration}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* AI Suggestions preview */}
                    {resume.ai_suggestions && resume.ai_suggestions.length > 0 && (
                      <div className="md:col-span-2">
                        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                          <FileText className="w-3 h-3 inline mr-1" />
                          Top AI Insight
                        </p>
                        <p className="text-xs text-slate-400">
                          {resume.ai_suggestions[0].text}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
