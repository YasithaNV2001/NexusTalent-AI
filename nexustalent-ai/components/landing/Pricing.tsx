'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check, Zap, Building2, Rocket, Crown } from 'lucide-react'
import { cn, formatCurrency } from '@/lib/utils'

const TIERS = [
  {
    id: 'starter',
    name: 'Starter',
    icon: Zap,
    monthly: 19,
    annual: 15,
    jd_quota: 10,
    cv_quota: 50,
    description: 'Perfect for freelance recruiters and solo hiring managers.',
    features: [
      '10 Job Descriptions / cycle',
      '50 CVs per Job Description',
      'AI candidate ranking',
      'Bulk PDF upload',
      'Candidate export',
      'Email support',
    ],
    is_popular: false,
    cta: 'Start Free Trial',
    color: 'border-white/10',
    iconBg: 'from-slate-500/20 to-slate-600/20',
    iconColor: 'text-slate-300',
  },
  {
    id: 'growth',
    name: 'Growth',
    icon: Rocket,
    monthly: 49,
    annual: 39,
    jd_quota: 50,
    cv_quota: 200,
    description: 'For growing teams scaling their hiring process.',
    features: [
      '50 Job Descriptions / cycle',
      '200 CVs per Job Description',
      'AI candidate ranking',
      'Bulk PDF upload',
      'Advanced filters & sorting',
      'Priority email support',
      '7-day free trial included',
    ],
    is_popular: true,
    cta: 'Start Free Trial',
    color: 'border-violet-500/50',
    iconBg: 'from-violet-500/20 to-indigo-500/20',
    iconColor: 'text-violet-400',
  },
  {
    id: 'scale',
    name: 'Scale',
    icon: Building2,
    monthly: 99,
    annual: 79,
    jd_quota: 'Unlimited',
    cv_quota: 500,
    description: 'For recruitment agencies and high-volume hiring teams.',
    features: [
      'Unlimited Job Descriptions',
      '500 CVs per Job Description',
      'AI candidate ranking',
      'Bulk PDF upload',
      'Advanced analytics',
      'API access (coming soon)',
      'Dedicated support',
    ],
    is_popular: false,
    cta: 'Start Free Trial',
    color: 'border-indigo-500/30',
    iconBg: 'from-indigo-500/20 to-blue-500/20',
    iconColor: 'text-indigo-400',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    icon: Crown,
    monthly: null,
    annual: null,
    jd_quota: 'Unlimited',
    cv_quota: 'Unlimited',
    description: 'Custom solution for large organizations and white-label.',
    features: [
      'Unlimited everything',
      'White-label option',
      'SSO / SAML integration',
      'Custom AI model fine-tuning',
      'SLA guarantee',
      'Dedicated account manager',
      'On-premise option',
    ],
    is_popular: false,
    cta: 'Contact Sales',
    color: 'border-white/10',
    iconBg: 'from-amber-500/20 to-yellow-500/20',
    iconColor: 'text-amber-400',
  },
]

export default function Pricing() {
  const [annual, setAnnual] = useState(false)
  const router = useRouter()

  const handleCTA = (tierId: string) => {
    if (tierId === 'enterprise') {
      document.querySelector('#contact')?.scrollIntoView({ behavior: 'smooth' })
    } else {
      const interval = annual ? 'annual' : 'monthly'
      router.push(`/auth/login?mode=signup&role=hr_manager&plan=${tierId}&billing=${interval}`)
    }
  }

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
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto mb-8">
            Start free for 7 days. No credit card required. Cancel anytime.
          </p>

          {/* Toggle */}
          <div className="flex items-center justify-center gap-3">
            <span className={cn('text-sm', !annual ? 'text-white' : 'text-slate-500')}>
              Monthly
            </span>
            <button
              onClick={() => setAnnual(!annual)}
              className={cn(
                'relative w-12 h-6 rounded-full transition-colors duration-300',
                annual ? 'bg-violet-600' : 'bg-slate-700'
              )}
            >
              <motion.div
                animate={{ x: annual ? 24 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-4 h-4 rounded-full bg-white"
              />
            </button>
            <span className={cn('text-sm', annual ? 'text-white' : 'text-slate-500')}>
              Annual
              <Badge
                variant="outline"
                className="ml-2 text-xs border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
              >
                Save 20%
              </Badge>
            </span>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {TIERS.map((tier, i) => {
            const Icon = tier.icon
            const price = annual ? tier.annual : tier.monthly

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className={cn(
                  'relative flex flex-col rounded-2xl p-6 border transition-all duration-300',
                  'bg-slate-900/60 backdrop-blur-sm',
                  tier.color,
                  tier.is_popular && 'glow-sm scale-[1.02]'
                )}
              >
                {tier.is_popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-0 shadow-lg shadow-violet-500/30 text-xs px-3">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tier.iconBg} border border-white/10 flex items-center justify-center`}>
                    <Icon className={`w-4 h-4 ${tier.iconColor}`} />
                  </div>
                  <h3 className="text-base font-semibold text-white">{tier.name}</h3>
                </div>

                {/* Price */}
                <div className="mb-4">
                  {price !== null ? (
                    <>
                      <div className="flex items-end gap-1">
                        <span className="text-3xl font-extrabold text-white">
                          {formatCurrency(price)}
                        </span>
                        <span className="text-slate-500 text-sm mb-1.5">/mo</span>
                      </div>
                      {annual && tier.monthly && (
                        <p className="text-xs text-slate-600 line-through">
                          {formatCurrency(tier.monthly)}/mo
                        </p>
                      )}
                    </>
                  ) : (
                    <div className="text-2xl font-extrabold gradient-text">Custom</div>
                  )}
                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {tier.description}
                  </p>
                </div>

                {/* Quota pills */}
                <div className="flex gap-2 mb-5">
                  <span className="text-xs px-2 py-1 rounded-md bg-violet-500/10 text-violet-400 border border-violet-500/20">
                    {tier.jd_quota} JDs
                  </span>
                  <span className="text-xs px-2 py-1 rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {tier.cv_quota} CVs/JD
                  </span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span className="text-xs text-slate-400">{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Button
                  onClick={() => handleCTA(tier.id)}
                  className={cn(
                    'w-full text-sm font-semibold transition-all',
                    tier.is_popular
                      ? 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-violet-500/25'
                      : tier.id === 'enterprise'
                      ? 'bg-gradient-to-r from-amber-600/80 to-yellow-600/80 hover:from-amber-500 hover:to-yellow-500 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-white border border-white/10'
                  )}
                >
                  {tier.cta}
                </Button>
              </motion.div>
            )
          })}
        </div>

        {/* B2C Free note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-slate-600 mt-8"
        >
          ✦ CV scoring for job seekers is{' '}
          <span className="text-slate-400 font-medium">always free</span>, forever.
          No account limits on personal CV uploads.
        </motion.p>
      </div>
    </section>
  )
}