'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CreditCard,
  Loader2,
  Crown,
  AlertTriangle,
  Check,
  Zap,
  Rocket,
  Building2,
  ChevronDown,
  X,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { toast } from 'sonner'
import type { Subscription } from '@/types'

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    monthly: 19,
    annual: 15,
    jd: 10,
    cv: 50,
    color: 'text-slate-300',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: Rocket,
    monthly: 49,
    annual: 39,
    jd: 50,
    cv: 200,
    color: 'text-violet-400',
    popular: true,
  },
  {
    id: 'scale',
    name: 'Scale',
    icon: Building2,
    monthly: 99,
    annual: 79,
    jd: 'Unlimited',
    cv: 500,
    color: 'text-indigo-400',
  },
]

export default function SubscriptionCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'annual'>('monthly')

  const fetchSubscription = useCallback(async () => {
    try {
      const res = await fetch('/api/subscription')
      const data = await res.json()
      if (res.ok) setSubscription(data.subscription)
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
  }, [fetchSubscription])

  const handleUpgrade = async (plan: string) => {
    setUpgrading(true)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'simulate_upgrade',
          plan,
          billingInterval,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(data.message || `Upgraded to ${plan}!`)
        setShowUpgrade(false)
        fetchSubscription()
      } else {
        toast.error(data.error || 'Upgrade failed.')
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setUpgrading(false)
    }
  }

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription?')) return
    setCancelling(true)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Subscription cancelled.')
        fetchSubscription()
      } else {
        toast.error(data.error || 'Failed to cancel.')
      }
    } catch {
      toast.error('Something went wrong.')
    } finally {
      setCancelling(false)
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-6 flex items-center justify-center">
        <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
      </div>
    )
  }

  if (!subscription) return null

  const isTrialExpired =
    subscription.plan === 'trial' &&
    subscription.trial_ends_at &&
    new Date(subscription.trial_ends_at) < new Date()

  const isCancelled = subscription.status === 'cancelled'
  const isExpired = subscription.status === 'expired' || isTrialExpired

  const trialDaysLeft =
    subscription.plan === 'trial' && subscription.trial_ends_at
      ? Math.max(
          0,
          Math.ceil(
            (new Date(subscription.trial_ends_at).getTime() - Date.now()) /
              (1000 * 60 * 60 * 24)
          )
        )
      : null

  return (
    <div className="space-y-3">
      {/* Current plan card */}
      <div
        className={cn(
          'rounded-xl border p-5 transition-all',
          isExpired || isCancelled
            ? 'bg-red-500/5 border-red-500/20'
            : 'bg-slate-900/50 border-slate-800/80'
        )}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'w-9 h-9 rounded-lg flex items-center justify-center',
                isExpired || isCancelled
                  ? 'bg-red-500/10'
                  : 'bg-violet-500/10'
              )}
            >
              {isExpired || isCancelled ? (
                <AlertTriangle className="w-5 h-5 text-red-400" />
              ) : (
                <CreditCard className="w-5 h-5 text-violet-400" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white capitalize">
                  {subscription.plan} Plan
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px]',
                    isExpired
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : isCancelled
                      ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  )}
                >
                  {isExpired ? 'expired' : subscription.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {subscription.plan === 'trial' && trialDaysLeft !== null ? (
                  trialDaysLeft > 0 ? (
                    `${trialDaysLeft} day${trialDaysLeft !== 1 ? 's' : ''} left in trial`
                  ) : (
                    'Trial has expired'
                  )
                ) : subscription.amount_usd > 0 ? (
                  `${formatCurrency(subscription.amount_usd)} / ${subscription.billing_interval}`
                ) : (
                  'Free tier'
                )}
              </p>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500">
            <p>
              JD Quota: <span className="text-slate-300 font-medium">{subscription.jd_quota}</span>
            </p>
            <p>
              CV/JD: <span className="text-slate-300 font-medium">{subscription.cv_per_jd_quota}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={() => setShowUpgrade(!showUpgrade)}
            className="bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs"
          >
            <Crown className="w-3.5 h-3.5 mr-1.5" />
            {isExpired || isCancelled ? 'Reactivate' : 'Upgrade'}
            <ChevronDown
              className={cn(
                'w-3 h-3 ml-1 transition-transform',
                showUpgrade && 'rotate-180'
              )}
            />
          </Button>
          {!isExpired && !isCancelled && subscription.plan !== 'trial' && (
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-xs text-slate-500 hover:text-red-400 hover:bg-red-500/10"
            >
              {cancelling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                'Cancel'
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Upgrade panel */}
      <AnimatePresence>
        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-xl bg-slate-900/50 border border-slate-800/80 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-white">Choose a Plan</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowUpgrade(false)}
                  className="text-slate-500 hover:text-white h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Billing toggle */}
              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setBillingInterval('monthly')}
                  className={cn(
                    'px-3 py-1.5 rounded-md transition-all',
                    billingInterval === 'monthly'
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingInterval('annual')}
                  className={cn(
                    'px-3 py-1.5 rounded-md transition-all',
                    billingInterval === 'annual'
                      ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                  )}
                >
                  Annual
                  <Badge
                    variant="outline"
                    className="ml-1.5 text-[9px] bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  >
                    -20%
                  </Badge>
                </button>
              </div>

              {/* Plan cards */}
              <div className="grid gap-3">
                {PLANS.map((plan) => {
                  const Icon = plan.icon
                  const price =
                    billingInterval === 'annual' ? plan.annual : plan.monthly
                  const isCurrent = subscription.plan === plan.id
                  const isDowngrade =
                    !isCurrent &&
                    PLANS.findIndex((p) => p.id === subscription.plan) >
                      PLANS.findIndex((p) => p.id === plan.id)

                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'rounded-lg border p-4 transition-all',
                        isCurrent
                          ? 'border-violet-500/30 bg-violet-500/5'
                          : 'border-slate-800/50 hover:border-slate-700/80'
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Icon className={cn('w-4 h-4', plan.color)} />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-white">
                                {plan.name}
                              </span>
                              {plan.popular && (
                                <Badge className="text-[9px] bg-linear-to-r from-violet-600 to-indigo-600 text-white border-0">
                                  Popular
                                </Badge>
                              )}
                              {isCurrent && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] bg-violet-500/10 text-violet-400 border-violet-500/20"
                                >
                                  Current
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {plan.jd} JDs · {plan.cv} CVs/JD
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="text-lg font-bold text-white">
                              {formatCurrency(price)}
                            </span>
                            <span className="text-xs text-slate-500">/mo</span>
                          </div>
                          {isCurrent ? (
                            <div className="w-20 text-center">
                              <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleUpgrade(plan.id)}
                              disabled={upgrading || isDowngrade}
                              className={cn(
                                'w-20 text-xs',
                                isDowngrade
                                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                  : 'bg-linear-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white'
                              )}
                            >
                              {upgrading ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : isDowngrade ? (
                                'Lower'
                              ) : (
                                'Upgrade'
                              )}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="text-[10px] text-slate-600 text-center">
                Demo mode: upgrades are simulated instantly. In production, this triggers Payhere checkout.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
