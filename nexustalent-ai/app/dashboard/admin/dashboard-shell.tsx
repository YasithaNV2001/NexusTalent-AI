'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Zap,
  LogOut,
  LayoutDashboard,
  DollarSign,
  Users,
  TrendingUp,
  TrendingDown,
  UserPlus,
  Activity,
  RefreshCw,
  Loader2,
  AlertCircle,
  Shield,
  BarChart3,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  cn,
  getInitials,
  getRoleLabel,
  getRoleBadgeColor,
  formatCurrency,
  formatNumber,
  formatPercent,
} from '@/lib/utils'
import type { Profile, AdminMetrics } from '@/types'

interface AdminDashboardShellProps {
  profile: Profile
}

const PIE_COLORS = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981']

export default function AdminDashboardShell({ profile }: AdminDashboardShellProps) {
  const [metrics, setMetrics] = useState<AdminMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createSupabaseBrowserClient()

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/metrics')
      const data = await res.json()
      if (res.ok) {
        setMetrics(data.metrics)
      } else {
        setError(data.error || 'Failed to load metrics.')
      }
    } catch {
      setError('Failed to connect. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMetrics()
  }, [fetchMetrics])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  const fadeIn = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
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
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-sm text-slate-400">Admin</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{profile.full_name || 'Admin'}</p>
              <Badge variant="outline" className={cn('text-xs', getRoleBadgeColor(profile.role))}>
                {getRoleLabel(profile.role)}
              </Badge>
            </div>
            <Avatar className="w-8 h-8">
              <AvatarImage src={profile.avatar_url ?? undefined} />
              <AvatarFallback className="bg-linear-to-br from-red-500 to-orange-600 text-white text-xs font-semibold">
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
        {/* Page heading */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
            <p className="text-sm text-slate-400 mt-1">
              Real-time metrics for NexusTalent AI.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchMetrics}
            disabled={loading}
            className="border-slate-700/50 text-slate-400 hover:text-white hover:border-violet-500/50"
          >
            <RefreshCw className={cn('w-3.5 h-3.5 mr-1.5', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>

        {error && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 mb-6 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        {loading && !metrics ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
          </div>
        ) : metrics ? (
          <div className="space-y-8">
            {/* ── Revenue Row ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
                label="MRR"
                value={formatCurrency(metrics.mrr_usd ?? 0)}
                sub={`ARR ${formatCurrency(metrics.arr_usd ?? 0)}`}
                accentClass="bg-emerald-500/10"
                delay={0}
              />
              <MetricCard
                icon={
                  (metrics.mrr_growth_percent ?? 0) >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-400" />
                  )
                }
                label="MRR Growth"
                value={formatPercent(metrics.mrr_growth_percent ?? 0)}
                sub="vs. last month"
                accentClass={
                  (metrics.mrr_growth_percent ?? 0) >= 0
                    ? 'bg-emerald-500/10'
                    : 'bg-red-500/10'
                }
                delay={0.05}
              />
              <MetricCard
                icon={<Activity className="w-5 h-5 text-orange-400" />}
                label="Churn Rate"
                value={formatPercent(metrics.churn_rate_percent ?? 0)}
                sub={`${metrics.churned_this_month ?? 0} churned this month`}
                accentClass="bg-orange-500/10"
                delay={0.1}
              />
              <MetricCard
                icon={<UserPlus className="w-5 h-5 text-violet-400" />}
                label="Signups Today"
                value={formatNumber(metrics.new_signups_today ?? 0)}
                sub={`${formatNumber(metrics.new_signups_7d ?? 0)} this week`}
                accentClass="bg-violet-500/10"
                delay={0.15}
              />
            </div>

            {/* ── Users Row ───────────────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                icon={<Users className="w-5 h-5 text-blue-400" />}
                label="Total Users"
                value={formatNumber(metrics.total_users ?? 0)}
                sub={`${formatNumber(metrics.new_signups_30d ?? 0)} new (30d)`}
                accentClass="bg-blue-500/10"
                delay={0.2}
              />
              <MetricCard
                icon={<Users className="w-5 h-5 text-sky-400" />}
                label="B2C Users"
                value={formatNumber(metrics.total_b2c_users ?? 0)}
                sub={`${formatNumber(metrics.active_b2c_30d ?? 0)} active (30d)`}
                accentClass="bg-sky-500/10"
                delay={0.25}
              />
              <MetricCard
                icon={<Users className="w-5 h-5 text-violet-400" />}
                label="B2B Users"
                value={formatNumber(metrics.total_b2b_users ?? 0)}
                sub={`${formatNumber(metrics.active_b2b_30d ?? 0)} active (30d)`}
                accentClass="bg-violet-500/10"
                delay={0.3}
              />
              <MetricCard
                icon={<BarChart3 className="w-5 h-5 text-indigo-400" />}
                label="Start of Month Active"
                value={formatNumber(metrics.active_start_of_month ?? 0)}
                sub="baseline for churn calc"
                accentClass="bg-indigo-500/10"
                delay={0.35}
              />
            </div>

            {/* ── Charts Row ──────────────────────────────────────────── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* MRR by Plan - Bar Chart */}
              <motion.div
                {...fadeIn}
                transition={{ delay: 0.4 }}
                className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-6"
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  MRR by Plan
                </h3>
                {metrics.mrr_by_plan.length > 0 ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={metrics.mrr_by_plan}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis
                        dataKey="plan"
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#334155' }}
                      />
                      <YAxis
                        tick={{ fill: '#94a3b8', fontSize: 12 }}
                        axisLine={{ stroke: '#334155' }}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0f172a',
                          border: '1px solid #334155',
                          borderRadius: '8px',
                          fontSize: 12,
                        }}
                        labelStyle={{ color: '#e2e8f0' }}
                        formatter={(val: number | undefined) => [`$${(val ?? 0).toFixed(2)}`, 'MRR']}
                      />
                      <Bar dataKey="plan_mrr" radius={[6, 6, 0, 0]}>
                        {metrics.mrr_by_plan.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-xs text-slate-500 text-center py-12">No paid subscriptions yet.</p>
                )}
              </motion.div>

              {/* User Distribution - Pie Chart */}
              <motion.div
                {...fadeIn}
                transition={{ delay: 0.45 }}
                className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-6"
              >
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  User Distribution
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Job Seekers', value: metrics.total_b2c_users },
                        { name: 'HR Managers', value: metrics.total_b2b_users },
                        {
                          name: 'Other',
                          value: Math.max(
                            0,
                            metrics.total_users -
                              metrics.total_b2c_users -
                              metrics.total_b2b_users
                          ),
                        },
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={3}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      <Cell fill="#8b5cf6" />
                      <Cell fill="#6366f1" />
                      <Cell fill="#334155" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '8px',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-2">
                  {[
                    { label: 'Job Seekers', color: '#8b5cf6' },
                    { label: 'HR Managers', color: '#6366f1' },
                    { label: 'Other', color: '#334155' },
                  ].map(({ label, color }) => (
                    <div key={label} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                      {label}
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── MRR Plan Breakdown Table ─────────────────────────────── */}
            {metrics.mrr_by_plan.length > 0 && (
              <motion.div
                {...fadeIn}
                transition={{ delay: 0.5 }}
                className="rounded-xl bg-slate-900/50 border border-slate-800/80 overflow-hidden"
              >
                <div className="px-6 py-4 border-b border-slate-800/60">
                  <h3 className="text-sm font-semibold text-slate-300">Revenue by Plan</h3>
                </div>
                <div className="divide-y divide-slate-800/40">
                  <div className="grid grid-cols-3 px-6 py-2.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                    <div>Plan</div>
                    <div className="text-center">Customers</div>
                    <div className="text-right">MRR</div>
                  </div>
                  {metrics.mrr_by_plan.map((row) => (
                    <div key={row.plan} className="grid grid-cols-3 px-6 py-3 items-center">
                      <div>
                        <Badge
                          variant="outline"
                          className="text-xs capitalize bg-violet-500/5 text-violet-300 border-violet-500/20"
                        >
                          {row.plan}
                        </Badge>
                      </div>
                      <div className="text-center text-sm text-white font-medium">
                        {row.customer_count}
                      </div>
                      <div className="text-right text-sm font-bold text-emerald-400">
                        {formatCurrency(row.plan_mrr)}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        ) : null}
      </main>
    </div>
  )
}

/* ── Reusable Metric Card ──────────────────────────────────────────────────── */
function MetricCard({
  icon,
  label,
  value,
  sub,
  accentClass,
  delay = 0,
}: {
  icon: React.ReactNode
  label: string
  value: string
  sub: string
  accentClass: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('w-9 h-9 rounded-lg flex items-center justify-center', accentClass)}>
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
    </motion.div>
  )
}
