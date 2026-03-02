'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  LogOut,
  Zap,
  Trash2,
  Eye,
  ChevronLeft,
  Loader2,
  LayoutDashboard,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn, getInitials, getRoleLabel, getRoleBadgeColor, getScoreColor, timeAgo } from '@/lib/utils'
import CVUploader from '@/components/dashboard/user/CVUploader'
import CVEditor from '@/components/dashboard/user/CVEditor'
import type { Profile, Resume } from '@/types'

interface UserDashboardShellProps {
  profile: Profile
}

export default function UserDashboardShell({ profile }: UserDashboardShellProps) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const fetchResumes = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/resume')
      const data = await res.json()
      if (res.ok) {
        setResumes(data.resumes || [])
      }
    } catch {
      // Silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchResumes()
  }, [fetchResumes])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const handleDelete = async (resumeId: string) => {
    setDeleting(resumeId)
    try {
      const res = await fetch('/api/resume', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      })
      if (res.ok) {
        setResumes((prev) => prev.filter((r) => r.id !== resumeId))
        if (selectedResume?.id === resumeId) {
          setSelectedResume(null)
        }
      }
    } catch {
      // Silent
    } finally {
      setDeleting(null)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Top bar */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 group"
            >
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
              <span className="text-sm text-slate-400">Dashboard</span>
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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="text-slate-400 hover:text-white hover:bg-white/5"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {selectedResume ? (
            /* ── CV Editor View ──────────────────────────────────────────── */
            <motion.div
              key="editor"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedResume(null)
                  fetchResumes()
                }}
                className="text-slate-400 hover:text-white mb-6"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Back to My CVs
              </Button>
              <CVEditor
                resume={selectedResume}
                onUpdate={fetchResumes}
              />
            </motion.div>
          ) : (
            /* ── CV List + Upload View ──────────────────────────────────── */
            <motion.div
              key="list"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
              className="space-y-8"
            >
              {/* Page heading */}
              <div>
                <h1 className="text-2xl font-bold text-white">My CVs</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Upload your CV to get an AI-powered ATS score and improvement suggestions.
                </p>
              </div>

              {/* Uploader */}
              <CVUploader onUploadComplete={fetchResumes} />

              {/* Resume list */}
              <div className="space-y-3">
                <h2 className="text-sm font-semibold text-slate-300">
                  Uploaded CVs ({resumes.length})
                </h2>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
                  </div>
                ) : resumes.length === 0 ? (
                  <div className="text-center py-12 rounded-xl bg-slate-900/30 border border-slate-800/50">
                    <FileText className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-500">
                      No CVs uploaded yet. Drop a PDF above to get started.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {resumes.map((resume) => (
                      <motion.div
                        key={resume.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="group rounded-xl bg-slate-900/50 border border-slate-800/80 p-4 hover:border-violet-500/30 hover:bg-slate-900/80 transition-all"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-4 min-w-0">
                            {/* Score circle */}
                            <div
                              className={cn(
                                'shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg',
                                resume.ats_score && resume.ats_score >= 80
                                  ? 'bg-emerald-500/10 text-emerald-400'
                                  : resume.ats_score && resume.ats_score >= 60
                                  ? 'bg-yellow-500/10 text-yellow-400'
                                  : resume.ats_score && resume.ats_score >= 40
                                  ? 'bg-orange-500/10 text-orange-400'
                                  : 'bg-red-500/10 text-red-400'
                              )}
                            >
                              {resume.ats_score ?? '—'}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-white truncate">
                                {resume.candidate_name || 'Unnamed CV'}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    'text-[10px]',
                                    resume.status === 'scored'
                                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                      : resume.status === 'processing'
                                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                                  )}
                                >
                                  {resume.status}
                                </Badge>
                                <span className="text-xs text-slate-500">
                                  {timeAgo(resume.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedResume(resume)}
                              className="text-slate-400 hover:text-violet-400 hover:bg-violet-500/10"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(resume.id)}
                              disabled={deleting === resume.id}
                              className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                            >
                              {deleting === resume.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
