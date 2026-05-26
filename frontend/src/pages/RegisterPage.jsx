import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginSuccess } from '../store/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  const pw = form.password;
  const strength = pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 'strong' : pw.length >= 6 ? 'medium' : pw.length > 0 ? 'weak' : null;

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!agreed) { toast.error('Please accept the terms'); return; }
    if (strength === 'weak') { toast.error('Please use a stronger password'); return; }
    setLoading(true);
    try {
      const res = await api.post('/auth/register', form);
      const { user, token, refreshToken } = res.data.data;
      dispatch(loginSuccess({ user, token, refreshToken }));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Welcome to InterviewAI, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/40 to-violet-900/60" />
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-black mb-6">AI</div>
          <h2 className="text-3xl font-bold mb-4">Join 50,000+ Professionals</h2>
          <p className="text-slate-300 text-lg mb-8">Start your free account and begin practicing AI mock interviews today.</p>
          <div className="space-y-4">
            {[
              { n: '50K+', label: 'Users Registered' },
              { n: '95%', label: 'Interview Success Rate' },
              { n: '200+', label: 'Top Companies Hired' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-4 text-left">
                <div className="text-2xl font-bold bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{s.n}</div>
                <div className="text-sm text-slate-300">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <motion.div className="w-full max-w-md py-8" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-sm">AI</div>
            <span className="font-bold text-xl text-white">InterviewAI</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create your account</h1>
            <p className="text-slate-400">Free forever. No credit card required.</p>
          </div>

          <button onClick={handleGoogleRegister}
            className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] text-white py-3 rounded-xl text-sm font-medium transition-all mb-6">
            <FcGoogle size={18} /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-slate-500">or sign up with email</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <FiUser size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="John Doe" required minLength={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Email Address</label>
              <div className="relative">
                <FiMail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">Password</label>
              <div className="relative">
                <FiLock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="At least 8 characters" required
                  className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                  {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
              {strength && (
                <div className="mt-2 flex gap-1">
                  {['weak', 'medium', 'strong'].map((level, i) => (
                    <div key={level} className={`flex-1 h-1 rounded-full transition-colors ${
                      strength === 'strong' ? 'bg-emerald-500' : strength === 'medium' && i <= 1 ? 'bg-amber-500' : strength === 'weak' && i === 0 ? 'bg-red-500' : 'bg-white/10'
                    }`} />
                  ))}
                  <span className={`text-xs ml-2 ${strength === 'strong' ? 'text-emerald-400' : strength === 'medium' ? 'text-amber-400' : 'text-red-400'}`}>{strength}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-2">I am a</label>
              <div className="grid grid-cols-2 gap-2">
                {[{ val: 'user', label: '👤 Job Candidate' }, { val: 'recruiter', label: '🏢 Recruiter / HR' }].map((r) => (
                  <button key={r.val} type="button" onClick={() => setForm({ ...form, role: r.val })}
                    className={`py-2.5 text-sm rounded-xl border transition-all ${form.role === r.val ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} className="mt-0.5 accent-violet-500" />
              <span className="text-xs text-slate-400">I agree to the <a href="#" className="text-violet-400 hover:underline">Terms of Service</a> and <a href="#" className="text-violet-400 hover:underline">Privacy Policy</a></span>
            </label>

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all">
              {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating account...</> : <>Create Free Account <FiArrowRight size={14} /></>}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">Sign in →</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
