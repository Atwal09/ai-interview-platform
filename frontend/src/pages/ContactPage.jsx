import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiClock, FiSend } from 'react-icons/fi';
import toast from 'react-hot-toast';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    setTimeout(() => {
      toast.success('Message sent! We\'ll get back to you within 24 hours.');
      setForm({ name: '', email: '', subject: '', message: '' });
      setSending(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] text-white">
      <nav className="border-b border-white/5 px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-sm font-bold">AI</div>
          <span className="font-bold text-xl bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">InterviewAI</span>
        </Link>
        <Link to="/login" className="text-sm text-slate-400 hover:text-white">Login</Link>
      </nav>

      <div className="py-24 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4">Get in <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Touch</span></h1>
          <p className="text-slate-400 text-lg">Have questions? We'd love to hear from you.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              {[
                { icon: FiMail, label: 'Email Us', value: 'support@workforme.space', sub: 'We reply within 24 hours' },
                { icon: FiMapPin, label: 'Our Location', value: 'workforme.space', sub: 'Deployed on AWS Cloud' },
                { icon: FiClock, label: 'Support Hours', value: '24/7 AI Support', sub: 'Human support: Mon–Fri, 9am–6pm IST' },
              ].map((item) => (
                <div key={item.label} className="flex gap-4 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-violet-400" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="text-slate-300 text-sm">{item.value}</div>
                    <div className="text-slate-500 text-xs">{item.sub}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-violet-500/20 rounded-2xl p-6">
              <div className="text-2xl font-bold text-white mb-1">⚡ Typical Response Time</div>
              <div className="text-slate-300 text-sm">Under 2 hours for Pro customers, 24 hours for Free plan.</div>
            </div>
          </div>

          {/* Form */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <form onSubmit={handleSubmit} className="bg-white/5 border border-white/10 rounded-2xl p-8 space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                {[{ key: 'name', label: 'Full Name', placeholder: 'John Doe' }, { key: 'email', label: 'Email', placeholder: 'you@example.com', type: 'email' }].map((f) => (
                  <div key={f.key}>
                    <label className="block text-xs text-slate-400 mb-2">{f.label}</label>
                    <input type={f.type || 'text'} value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      placeholder={f.placeholder} required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Subject</label>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="How can we help?" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-2">Message</label>
                <textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us more about your question or issue..." required rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors resize-none" />
              </div>
              <button type="submit" disabled={sending}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all">
                {sending ? 'Sending...' : <><FiSend size={14} /> Send Message</>}
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
