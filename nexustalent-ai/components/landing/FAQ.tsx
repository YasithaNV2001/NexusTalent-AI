'use client'

import { motion } from 'framer-motion'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const FAQS = [
  {
    q: 'Is the CV scoring really free forever?',
    a: 'Yes. Job seekers can upload CVs, get ATS scores, use the live editor, and export PDF/DOCX documents completely free with no usage limits on personal uploads.',
  },
  {
    q: 'Do I need a credit card for the 7-day trial?',
    a: 'No. The 7-day free trial for B2B HR features requires only an email address. You only enter payment details when you choose to upgrade to a paid plan.',
  },
  {
    q: 'What happens to my unused JD quota if I close a job?',
    a: 'Closing or archiving a job description does not restore your quota. Quota is measured as the total number of JDs created within your current billing cycle, regardless of status. This ensures fair, predictable usage across all plan tiers.',
  },
  {
    q: 'How accurate is the AI candidate ranking?',
    a: 'Our AI analyzes skills matches, experience alignment, keyword density, and semantic relevance between CVs and job descriptions. In testing, it achieves over 90% agreement with senior human recruiters on top-5 shortlists.',
  },
  {
    q: 'What file formats are supported for CV uploads?',
    a: 'We currently support PDF files up to 10MB per file. DOCX support is planned for v1.1. Exported CVs can be downloaded as PDF or DOCX.',
  },
  {
    q: 'Is my data secure and private?',
    a: 'All CVs are encrypted at rest and in transit using AES-256. Row-level security in the database ensures complete data isolation between organizations. We never share or sell your data.',
  },
  {
    q: 'Can I upgrade or downgrade my plan at any time?',
    a: 'Yes. You can upgrade at any time and your new quota takes effect immediately with a new billing cycle. Downgrades take effect at the end of your current billing period.',
  },
  {
    q: 'Do you offer annual billing discounts?',
    a: 'Yes. Annual billing saves approximately 20% compared to monthly billing. Starter drops from $19 to $15/mo, Growth from $49 to $39/mo, and Scale from $99 to $79/mo.',
  },
]

export default function FAQ() {
  return (
    <section className="py-24 sm:py-32 relative">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
          <p className="text-slate-400">
            Everything you need to know about NexusTalent AI.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <Accordion type="single" collapsible className="space-y-3">
            {FAQS.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="glass rounded-xl border border-white/5 px-6 hover:bg-white/5 transition-colors data-[state=open]:bg-white/5"
              >
                <AccordionTrigger className="text-left text-sm font-medium text-slate-200 hover:text-white hover:no-underline py-5">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-400 leading-relaxed pb-5">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </motion.div>
      </div>
    </section>
  )
}