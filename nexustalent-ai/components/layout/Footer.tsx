import Link from 'next/link'
import { Zap } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="relative border-t border-white/5 bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-white fill-white" />
              </div>
              <span className="font-bold text-base">
                Nexus<span className="gradient-text">Talent</span>
              </span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed">
              AI-powered talent intelligence for the modern workforce.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Product</h4>
            <ul className="space-y-2">
              {['Features', 'Pricing', 'How it Works', 'FAQ'].map((item) => (
                <li key={item}>
                  <Link
                    href={`#${item.toLowerCase().replace(/ /g, '-')}`}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">Company</h4>
            <ul className="space-y-2">
              {[
                { label: 'Contact Us', href: '#contact' },
                { label: 'Privacy Policy', href: '/privacy' },
                { label: 'Terms of Service', href: '/terms' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* For Teams */}
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3">For Teams</h4>
            <ul className="space-y-2">
              {[
                { label: 'HR Dashboard', href: '#pricing' },
                { label: 'Bulk CV Ranking', href: '#features' },
                { label: 'Enterprise', href: '#contact' },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">
            © {new Date().getFullYear()} NexusTalent AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built with ❤️ for global talent teams
          </p>
        </div>
      </div>
    </footer>
  )
}