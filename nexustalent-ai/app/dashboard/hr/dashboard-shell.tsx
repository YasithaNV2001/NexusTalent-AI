'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  LogOut,
  LayoutDashboard,
  Plus,
  Briefcase,
  ChevronRight,
  Users,
  Loader2,
  FolderOpen,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, getInitials, getRoleLabel, getRoleBadgeColor, timeAgo } from '@/lib/utils'
import JobForm from '@/components/dashboard/hr/JobForm'
import CandidateTable from '@/components/dashboard/hr/CandidateTable'
import SubscriptionCard from '@/components/dashboard/hr/SubscriptionCard'
import CVUploader from '@/components/dashboard/user/CVUploader'
import type { Profile, Job } from '@/types'

type View = 'jobs' | 'create-job' | 'job-detail'

interface HRDashboardShellProps {
  profile: Profile
}

export default function HRDashboardShell({ profile }: HRDashboardShellProps) {
  const [view, setView] = useState<View>('jobs')
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)
  const [uploadRefreshKey, setUploadRefreshKey] = useState(0)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/jobs')
      const data = await res.json()
      if (res.ok) setJobs(data.jobs || [])
    } catch {
      // Silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleJobCreated = () => {
    fetchJobs()
    setView('jobs')
  }

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job)
    setView('job-detail')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white fill-white" />
              </div>
              <span className="font-bold text-lg tracking-tight text-white hidden sm:block">
                Nexus<span className="bg-linear-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Talent</span>
              </span>
            </button>
            <div className="h-6 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-1.5">
              <LayoutDashboard className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-400">HR Dashboard</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{profile.full_name || 'User'}</p>
              <Badge variant="outline" className={cn('text-xs', getRoleBadgeColor(profile.role))}>
                {getRoleLabel(profile.role)}
              </Badge>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-linear-to-br from-violet-500 to-indigo-600 text-white text-xs font-semibold">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>
            <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-400 hover:text-white hover:bg-white/5">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {/* ── Job  List ─────────────────────────────────── */}
          {view === 'jobs' && (
            <motion.div
              key="jobs"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              {/* Subscription status */}
              <SubscriptionCard />

              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-white">Job Descriptions</h1>
                  <p className="text-sm text-slate-400 mt-1">
                    Post a job, then upload candidate CVs to rank them by AI match score.
                  </p>
                </div>
                <Button
                  onClick={() => setView('create-job')}
                  className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Job
                </Button>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-16 rounded-xl bg-slate-900/30 border border-slate-800/50">
                  <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                  <p className="text-slate-400 mb-4">
                    No job descriptions yet. Create one to start ranking candidates.
                  </p>
                  <Button
                    onClick={() => setView('create-job')}
                    variant="outline"
                    className="border-violet-500/30 text-violet-400 hover:bg-violet-500/10"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create your first job
                  </Button>
                </div>
              ) : (
                <div className="grid gap-3">
                  {jobs.map((job) => (
                    <motion.button
                      key={job.id}
                      onClick={() => handleSelectJob(job)}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="w-full text-left group rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 hover:border-violet-500/30 hover:bg-slate-900/80 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="shrink-0 w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
                            <Briefcase className="w-5 h-5 text-violet-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{job.title}</p>
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                              <Badge
                                variant="outline"
                                className={cn(
                                  'text-[10px]',
                                  job.status === 'active'
                                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                    : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                )}
                              >
                                {job.status}
                              </Badge>
                              {job.required_skills?.slice(0, 3).map((s) => (
                                <Badge key={s} variant="outline" className="text-[10px] bg-slate-800/50 text-slate-400 border-slate-700/50">
                                  {s}
                                </Badge>
                              ))}
                              <span className="text-xs text-slate-500">{timeAgo(job.created_at)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Users className="w-3.5 h-3.5" />
                            CVs
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-violet-400 transition-colors" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* ── Create Job Form ─────────────────────────── */}
          {view === 'create-job' && (
            <motion.div
              key="create"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setView('jobs')}
                className="text-slate-400 hover:text-white mb-6"
              >
                ← Back to Jobs
              </Button>
              <JobForm onSuccess={handleJobCreated} />
            </motion.div>
          )}

          {/* ── Job Detail: Upload CVs + Candidate Table ── */}
          {view === 'job-detail' && selectedJob && (
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedJob(null)
                  setView('jobs')
                }}
                className="text-slate-400 hover:text-white"
              >
                ← Back to Jobs
              </Button>

              {/* Job header */}
              <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-bold text-white">{selectedJob.title}</h2>
                    <p className="text-sm text-slate-400 mt-1 line-clamp-3">{selectedJob.description}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      {selectedJob.required_skills?.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs bg-violet-500/5 text-violet-300 border-violet-500/20">
                          {s}
                        </Badge>
                      ))}
                      {selectedJob.location && (
                        <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50">
                          📍 {selectedJob.location}
                        </Badge>
                      )}
                      {selectedJob.employment_type && (
                        <Badge variant="outline" className="text-xs bg-slate-800/50 text-slate-400 border-slate-700/50">
                          {selectedJob.employment_type}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bulk uploader */}
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">Upload Candidate CVs</h3>
                <CVUploader jobId={selectedJob.id} onUploadComplete={() => setUploadRefreshKey((k) => k + 1)} />
              </div>

              {/* Candidate ranking table */}
              <CandidateTable jobId={selectedJob.id} key={`candidates-${selectedJob.id}-${uploadRefreshKey}`} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
