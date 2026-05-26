import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheck, FiArrowRight } from 'react-icons/fi';

const plans = [
  { name: 'Free', price: 0, annualPrice: 0, desc: 'Perfect to get started', features: ['3 Mock Interviews/month', '1 Resume Analysis/month', 'Basic Speech Metrics', 'Community Support'], notIncluded: ['Advanced AI Analysis', 'Unlimited Interviews', 'Career Roadmap'], cta: 'Get Started Free', highlighted: false },
  { name: 'Pro', price: 29, annualPrice: 23, desc: 'For serious job seekers', features: ['Unlimited Mock Interviews', 'Unlimited Resume Analyses', 'Advanced Speech AI', 'AI Career Roadmap', 'Downloadable Reports', 'Priority Support', 'All Interview Types', 'Leaderboard Access'], notIncluded: [], cta: 'Start 7-Day Free Trial', highlighted: true },
  { name: 'Enterprise', price: 99, annualPrice: 79, desc: 'For teams & organizations', features: ['Everything in Pro', 'Team Dashboard (up to 50)', 'Custom Interview Domains', 'API Access', 'Dedicated Account Manager', 'Custom Branding', 'SSO / SAML', 'SLA Guarantee'], notIncluded: [], cta: 'Contact Sales', highlighted: false },
];

const faqs = [
  { q: 'Is the free plan actually free?', a: 'Yes! No credit card required. You get 3 mock interviews and 1 resume analysis per month at no cost.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel your subscription anytime from your account settings with no cancellation fees.' },
  { q: 'What AI model powers the interviews?', a: 'We use Google Gemini 1.5 Flash for all AI features — question generation, speech analysis, and resume scoring.' },
  { q: 'Is my data private?', a: 'Yes. All your interview recordings and resume data are encrypted and never shared with third parties.' },
  { q: 'Do you offer student discounts?', a: 'Yes! Students get 50% off Pro with a valid .edu email. Contact support@workforme.space.' },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">AI</div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">InterviewAI</span>
        </Link>
        <div className="flex gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white px-4 py-2">Login</Link>
          <Link to="/register" className="text-sm bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg transition-colors">Get Started</Link>
        </div>
      </nav>

      <div className="py-24 px-6">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Simple, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Transparent Pricing</span></h1>
          <p className="text-slate-400 text-lg mb-8">Start free. Upgrade when you need more power.</p>
          <div className="flex items-center justify-center gap-3">
            <span className={`text-sm ${!annual ? 'text-white' : 'text-slate-400'}`}>Monthly</span>
            <button onClick={() => setAnnual(!annual)} className={`relative w-12 h-6 rounded-full transition-colors ${annual ? 'bg-violet-600' : 'bg-slate-700'}`}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${annual ? 'left-7' : 'left-1'}`} />
            </button>
            <span className={`text-sm ${annual ? 'text-white' : 'text-slate-400'}`}>Annual <span className="text-emerald-400 font-semibold">Save 20%</span></span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {plans.map((p, i) => (
            <motion.div key={p.name} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className={`rounded-2xl p-8 border relative ${p.highlighted ? 'border-violet-500/50 bg-gradient-to-b from-violet-900/40 to-slate-900/40' : 'border-white/10 bg-white/5'}`}>
              {p.highlighted && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-cyan-600 text-xs font-semibold px-4 py-1 rounded-full">Most Popular</div>}
              <h3 className="text-xl font-bold mb-1">{p.name}</h3>
              <p className="text-slate-400 text-sm mb-4">{p.desc}</p>
              <div className="mb-6">
                <span className="text-4xl font-black">${annual ? p.annualPrice : p.price}</span>
                {p.price > 0 && <span className="text-slate-400 text-sm">/mo</span>}
                {annual && p.price > 0 && <div className="text-xs text-emerald-400 mt-1">billed annually</div>}
              </div>
              <Link to="/register" className={`block text-center py-3 rounded-xl font-semibold text-sm mb-6 transition-all ${p.highlighted ? 'bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white' : 'border border-white/20 hover:border-white/40 hover:bg-white/5'}`}>
                {p.cta}
              </Link>
              <ul className="space-y-2.5">
                {p.features.map((f) => <li key={f} className="flex items-center gap-2 text-sm text-slate-300"><FiCheck className="text-emerald-400 shrink-0" size={14} />{f}</li>)}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Frequently Asked <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Questions</span></h2>
          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <button className="w-full text-left px-5 py-4 flex items-center justify-between text-sm font-medium text-white hover:bg-white/5 transition-colors" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                  {faq.q}
                  <span className="text-slate-400 ml-4">{openFaq === i ? '−' : '+'}</span>
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-sm text-slate-400">{faq.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
