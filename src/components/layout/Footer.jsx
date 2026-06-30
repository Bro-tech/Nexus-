import React from 'react';
import { Logo } from '../ui/Logo';
import { PhoneCall } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="relative overflow-hidden bg-charcoal text-slate-400 border-t border-white/8">
      {/* Ambient layers */}
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-30" />
      <div className="pointer-events-none absolute inset-0 grid-fade opacity-10" />
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-purple-500/15 blur-3xl float-slow" />
      <div className="pointer-events-none absolute bottom-0 left-10 w-64 h-64 rounded-full bg-cyan-500/15 blur-3xl float-medium" />

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 mb-12">
          <div className="lg:col-span-2">
            <Logo className="mb-4" />
            <p className="text-slate-400 max-w-sm mb-6 text-sm font-medium">
              A calmer, more intentional way to track wellbeing and build lasting habits.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-200 text-sm font-semibold shadow-sm">
              <PhoneCall size={16} className="text-rose-400" />
              SOS Crisis Hotline
            </div>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Platform</h4>
            <ul className="space-y-3 text-slate-400 text-sm font-medium">
              {['Features', 'Science & Methods', 'Pricing', 'FAQ'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Resources</h4>
            <ul className="space-y-3 text-slate-400 text-sm font-medium">
              {['Community', 'Guides', 'Support', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-4 text-sm uppercase tracking-widest">Legal</h4>
            <ul className="space-y-3 text-slate-400 text-sm font-medium">
              {['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'Data Rights'].map((link) => (
                <li key={link}>
                  <a href="#" className="hover:text-white transition-colors">{link}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-500 text-sm">
          <p>© {new Date().getFullYear()} Nexus. All rights reserved.</p>
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            All systems operational
          </div>
        </div>
      </div>
    </footer>
  );
};

export { Footer };
