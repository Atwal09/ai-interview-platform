import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { loginStart, loginSuccess, loginFailure } from '../store/authSlice';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    dispatch(loginStart());
    try {
      const res = await api.post('/auth/login', form);
      const { user, token, refreshToken } = res.data.data;
      dispatch(loginSuccess({ user, token, refreshToken }));
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      navigate('/dashboard');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Login failed. Check your credentials.';
      dispatch(loginFailure(msg));
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!forgotEmail) { toast.error('Please enter your email'); return; }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail });
      toast.success('Password reset link sent to your email!');
      setForgot(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL}/api/auth/google`;
  };

  return (
    <div className="min-h-screen bg-[#0a0b14] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-900/60 to-cyan-900/40" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-600/30 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-cyan-600/20 rounded-full blur-3xl" />
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-black mb-6">AI</div>
          <h2 className="text-3xl font-bold mb-4">InterviewAI</h2>
          <p className="text-slate-300 text-lg mb-8">Practice smarter. Interview with confidence. Land your dream job.</p>
          <div className="space-y-3 text-left w-full max-w-xs">
            {['Unlimited AI mock interviews', 'Real-time speech analysis', 'ATS resume scorer', 'Personalized career roadmap'].map((f) => (
              <div key={f} className="flex items-center gap-3 text-sm text-slate-200">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <span className="text-emerald-400 text-xs">✓</span>
                </div>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
          {/* Mobile Logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-sm">AI</div>
            <span className="font-bold text-xl text-white">InterviewAI</span>
          </div>

          {!forgot ? (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
                <p className="text-slate-400">Sign in to continue your interview prep</p>
                {searchParams.get('error') === 'oauth_failed' && <div className="mt-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">Google sign-in failed. Please try again.</div>}
              </div>

              <button onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] text-white py-3 rounded-xl text-sm font-medium transition-all mb-6">
                <FcGoogle size={18} /> Continue with Google
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-slate-500">or sign in with email</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
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
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs text-slate-400">Password</label>
                    <button type="button" onClick={() => setForgot(true)} className="text-xs text-violet-400 hover:text-violet-300">Forgot password?</button>
                  </div>
                  <div className="relative">
                    <FiLock size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input type={showPw ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Enter your password" required
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors">
                      {showPw ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition-all mt-2">
                  {loading ? <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Signing in...</> : <>Sign In <FiArrowRight size={14} /></>}
                </button>

                {/* Demo credentials */}
                <div className="bg-white/5 border border-white/5 rounded-xl p-3 text-xs text-slate-400">
                  <strong className="text-slate-300">Demo:</strong> demo@workforme.space / Demo@123456
                </div>
              </form>

              <p className="mt-6 text-center text-sm text-slate-400">
                Don't have an account?{' '}
                <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">Create one free →</Link>
              </p>
            </>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
              <p className="text-slate-400 mb-8">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="relative">
                  <FiMail size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="email" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="your@email.com" required
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                </div>
                <button type="submit" disabled={loading}
                  className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm">
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button type="button" onClick={() => setForgot(false)} className="w-full text-slate-400 text-sm hover:text-white transition-colors">← Back to Sign In</button>
              </form>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
