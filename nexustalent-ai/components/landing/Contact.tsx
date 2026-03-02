'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Send, Mail, MessageSquare, Building2 } from 'lucide-react'

export default function Contact() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    company: '',
    subject: '',
    message: '',
  })

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!form.full_name || !form.email || !form.subject || !form.message) {
      toast.error('Please fill in all required fields.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!res.ok) throw new Error('Submission failed')

      toast.success("Message sent! We'll get back to you within 24 hours.")
      setForm({ full_name: '', email: '', company: '', subject: '', message: '' })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white mb-4">
            Get in <span className="gradient-text">Touch</span>
          </h2>
          <p className="text-slate-400 text-lg max-w-lg mx-auto">
            Questions about Enterprise plans, custom integrations, or partnership?
            Our team responds within 24 hours.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="rounded-2xl glass p-8 sm:p-10"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/5">
            {[
              { icon: Mail, label: 'Email Us', value: 'hello@nexustalent.ai', color: 'text-violet-400' },
              { icon: MessageSquare, label: 'Response Time', value: 'Within 24 hours', color: 'text-emerald-400' },
              { icon: Building2, label: 'Enterprise', value: 'Custom solutions', color: 'text-indigo-400' },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${color}`} />
                </div>
                <div>
                  <div className="text-xs text-slate-500">{label}</div>
                  <div className="text-sm text-slate-300 font-medium">{value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="full_name" className="text-sm text-slate-400">
                Full Name <span className="text-red-400">*</span>
              </Label>
              <Input
                id="full_name"
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                placeholder="John Smith"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm text-slate-400">
                Work Email <span className="text-red-400">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="john@company.com"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="company" className="text-sm text-slate-400">
                Company
              </Label>
              <Input
                id="company"
                name="company"
                value={form.company}
                onChange={handleChange}
                placeholder="Acme Corp"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="subject" className="text-sm text-slate-400">
                Subject <span className="text-red-400">*</span>
              </Label>
              <Input
                id="subject"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="Enterprise plan inquiry"
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="message" className="text-sm text-slate-400">
                Message <span className="text-red-400">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                placeholder="Tell us about your team size, hiring volume, and what you're looking to solve..."
                rows={5}
                className="bg-slate-900 border-white/10 text-white placeholder:text-slate-600 focus:border-violet-500/50 focus:ring-violet-500/20 resize-none"
              />
            </div>

            <div className="sm:col-span-2">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full sm:w-auto px-8 h-11 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold shadow-lg shadow-violet-500/25 transition-all disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {loading ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}