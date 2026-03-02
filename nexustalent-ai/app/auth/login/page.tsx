'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Zap,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  FileCheck,
} from 'lucide-react'
import { createSupabaseBrowserClient } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// ─── Google SVG Icon ─────────────────────────────────────────────────────────
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53Z"
        fill="#EA4335"
      />
    </svg>
  )
}

// ─── Role Selector ───────────────────────────────────────────────────────────
function RoleSelector({
  selected,
  onChange,
}: {
  selected: 'jobseeker' | 'hr_manager'
  onChange: (role: 'jobseeker' | 'hr_manager') => void
}) {
  return (
    <div className="grid grid-cols-2 gap-3">
      <button
        type="button"
        onClick={() => onChange('jobseeker')}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
          selected === 'jobseeker'
            ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
        )}
      >
        {selected === 'jobseeker' && (
          <motion.div
            layoutId="role-check"
            className="absolute top-2 right-2"
          >
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
          </motion.div>
        )}
        <FileCheck
          className={cn(
            'w-6 h-6',
            selected === 'jobseeker' ? 'text-violet-400' : 'text-slate-500'
          )}
        />
        <div className="text-center">
          <p
            className={cn(
              'text-sm font-semibold',
              selected === 'jobseeker' ? 'text-white' : 'text-slate-400'
            )}
          >
            Job Seeker
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Score &amp; improve CV</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => onChange('hr_manager')}
        className={cn(
          'relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200',
          selected === 'hr_manager'
            ? 'border-violet-500 bg-violet-500/10 shadow-lg shadow-violet-500/10'
            : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50'
        )}
      >
        {selected === 'hr_manager' && (
          <motion.div
            layoutId="role-check"
            className="absolute top-2 right-2"
          >
            <CheckCircle2 className="w-4 h-4 text-violet-400" />
          </motion.div>
        )}
        <Briefcase
          className={cn(
            'w-6 h-6',
            selected === 'hr_manager' ? 'text-violet-400' : 'text-slate-500'
          )}
        />
        <div className="text-center">
          <p
            className={cn(
              'text-sm font-semibold',
              selected === 'hr_manager' ? 'text-white' : 'text-slate-400'
            )}
          >
            HR Manager
          </p>
          <p className="text-xs text-slate-500 mt-0.5">Rank candidates</p>
        </div>
      </button>
    </div>
  )
}

// ─── Main Login / Signup Page ────────────────────────────────────────────────
function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const redirectTo = searchParams.get('redirectTo') || ''
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  const initialRole =
    searchParams.get('role') === 'hr_manager' ? 'hr_manager' : 'jobseeker'

  const [mode, setMode] = useState<'login' | 'signup'>(initialMode)
  const [role, setRole] = useState<'jobseeker' | 'hr_manager'>(initialRole)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  // Clear messages when switching modes
  useEffect(() => {
    setError(null)
    setSuccess(null)
  }, [mode])

  // ── Email/Password Submit ──────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        // Validate inputs
        if (!fullName.trim()) {
          setError('Please enter your full name.')
          setLoading(false)
          return
        }
        if (password.length < 6) {
          setError('Password must be at least 6 characters.')
          setLoading(false)
          return
        }

        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim(),
              role: role,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback?role=${role}&redirectTo=${encodeURIComponent(redirectTo)}`,
          },
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        // If email confirmation is required, user won't have a session yet
        if (data.user && !data.session) {
          setSuccess(
            'Account created! Check your email for a confirmation link.'
          )
          setLoading(false)
          return
        }

        // If email confirmation is disabled, user is signed in immediately
        if (data.session) {
          // Update profile role if hr_manager (trigger defaults to jobseeker)
          if (role === 'hr_manager') {
            await supabase
              .from('profiles')
              .update({ role: 'hr_manager', full_name: fullName.trim() })
              .eq('id', data.user!.id)
          }

          const dest =
            redirectTo ||
            (role === 'hr_manager' ? '/dashboard/hr' : '/dashboard/user')
          router.push(dest)
          router.refresh()
          return
        }
      } else {
        // Login
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          if (signInError.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.')
          } else if (signInError.message.includes('Email not confirmed')) {
            setError(
              'Please confirm your email before logging in. Check your inbox.'
            )
          } else {
            setError(signInError.message)
          }
          setLoading(false)
          return
        }

        // On successful login, fetch profile to determine dashboard route
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

          const userRole = profile?.role || 'jobseeker'
          const dest =
            redirectTo ||
            (userRole === 'admin'
              ? '/dashboard/admin'
              : userRole === 'hr_manager'
              ? '/dashboard/hr'
              : '/dashboard/user')

          router.push(dest)
          router.refresh()
          return
        }
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // ── Google OAuth ───────────────────────────────────────────────────────────
  async function handleGoogleLogin() {
    setError(null)
    setGoogleLoading(true)

    const callbackUrl = new URL('/auth/callback', window.location.origin)
    if (role && mode === 'signup') {
      callbackUrl.searchParams.set('role', role)
    }
    if (redirectTo) {
      callbackUrl.searchParams.set('redirectTo', redirectTo)
    }

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: callbackUrl.toString(),
      },
    })

    if (oauthError) {
      setError(oauthError.message)
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 mb-8 group">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg group-hover:shadow-violet-500/30 transition-shadow">
              <Zap className="w-5 h-5 text-white fill-white" />
            </div>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 blur-lg opacity-0 group-hover:opacity-40 transition-opacity" />
          </div>
          <span className="font-bold text-xl tracking-tight text-white">
            Nexus<span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">Talent</span>
          </span>
        </Link>

        {/* Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-2xl shadow-black/40 p-8">
          {/* Mode Toggle */}
          <div className="flex rounded-xl bg-slate-800/60 p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={cn(
                'relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                mode === 'login'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {mode === 'login' && (
                <motion.div
                  layoutId="mode-bg"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg shadow-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">Log In</span>
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={cn(
                'relative flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200',
                mode === 'signup'
                  ? 'text-white'
                  : 'text-slate-400 hover:text-slate-300'
              )}
            >
              {mode === 'signup' && (
                <motion.div
                  layoutId="mode-bg"
                  className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-lg shadow-lg"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative z-10">Sign Up</span>
            </button>
          </div>

          {/* Heading */}
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, x: mode === 'signup' ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: mode === 'signup' ? -20 : 20 }}
              transition={{ duration: 0.2 }}
              className="mb-6"
            >
              <h1 className="text-2xl font-bold text-white">
                {mode === 'signup' ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-sm text-slate-400 mt-1">
                {mode === 'signup'
                  ? 'Start using NexusTalent AI for free — no credit card required.'
                  : 'Sign in to access your dashboard.'}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Google OAuth */}
          <Button
            type="button"
            variant="outline"
            className="w-full h-11 bg-white/5 border-slate-700/80 hover:bg-white/10 hover:border-slate-600 text-white font-medium transition-all"
            onClick={handleGoogleLogin}
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <GoogleIcon className="w-4 h-4 mr-2" />
            )}
            Continue with Google
          </Button>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-slate-900/80 px-4 text-slate-500 uppercase tracking-wider">
                or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <Label className="text-slate-300 mb-2">I want to</Label>
                  <RoleSelector selected={role} onChange={setRole} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Full Name (signup only) */}
            <AnimatePresence>
              {mode === 'signup' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-slate-300">
                      Full Name
                    </Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="John Doe"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="h-11 pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                        required={mode === 'signup'}
                        autoComplete="name"
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 pl-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={
                    mode === 'signup' ? 'Min. 6 characters' : '••••••••'
                  }
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10 bg-slate-800/50 border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:border-violet-500 focus-visible:ring-violet-500/20"
                  required
                  minLength={6}
                  autoComplete={
                    mode === 'signup' ? 'new-password' : 'current-password'
                  }
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Success Message */}
            <AnimatePresence>
              {success && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="flex items-start gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <p className="text-sm text-emerald-400">{success}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all"
              disabled={loading || googleLoading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {mode === 'signup' ? (
                <>
                  Create Account
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          </form>

          {/* Footer toggle */}
          <p className="text-center text-sm text-slate-400 mt-6">
            {mode === 'login' ? (
              <>
                Don&apos;t have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Sign up free
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="text-violet-400 hover:text-violet-300 font-semibold transition-colors"
                >
                  Log in
                </button>
              </>
            )}
          </p>
        </div>

        {/* Terms */}
        <p className="text-center text-xs text-slate-600 mt-6">
          By continuing, you agree to NexusTalent AI&apos;s{' '}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-slate-500 hover:text-slate-400 cursor-pointer transition-colors">
            Privacy Policy
          </span>
          .
        </p>
      </motion.div>
    </div>
  )
}

// ─── Loading Fallback ────────────────────────────────────────────────────────
function LoginSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-slate-800 animate-pulse" />
          <div className="w-32 h-6 rounded bg-slate-800 animate-pulse" />
        </div>
        <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-8 space-y-4">
          <div className="h-10 rounded-xl bg-slate-800/60 animate-pulse" />
          <div className="h-8 w-3/4 rounded bg-slate-800/40 animate-pulse" />
          <div className="h-4 w-1/2 rounded bg-slate-800/30 animate-pulse" />
          <div className="h-11 rounded-md bg-slate-800/50 animate-pulse" />
          <div className="h-11 rounded-md bg-slate-800/50 animate-pulse" />
          <div className="h-11 rounded-md bg-slate-800/50 animate-pulse" />
          <div className="h-11 rounded-md bg-violet-600/30 animate-pulse" />
        </div>
      </div>
    </div>
  )
}

// ─── Default Export with Suspense boundary ───────────────────────────────────
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginSkeleton />}>
      <LoginForm />
    </Suspense>
  )
}
