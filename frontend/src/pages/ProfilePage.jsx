import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiSave, FiBell, FiTrash2, FiCamera } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import { setUser } from '../store/authSlice';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { user } = useSelector((s) => s.auth);
  const [activeSection, setActiveSection] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', targetRole: user?.target_role || '', experienceLevel: user?.experience_level || 'mid' });
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      const res = await api.put('/auth/me', form);
      dispatch(setUser(res.data.data.user));
      toast.success('Profile updated!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    if (passwords.new.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    setSaving(true);
    try {
      await api.post('/auth/change-password', { currentPassword: passwords.current, newPassword: passwords.new });
      toast.success('Password changed!');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile Info', icon: FiUser },
    { id: 'security', label: 'Password & Security', icon: FiLock },
    { id: 'notifications', label: 'Notifications', icon: FiBell },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold text-white">Account <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Settings</span></h1>
        <p className="text-slate-400 mt-1 text-sm">Manage your profile and preferences</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Sidebar Nav */}
        <div className="space-y-2">
          {/* Avatar */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center mb-4">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-bold mx-auto">
                {user?.name?.[0]}
              </div>
              <button className="absolute bottom-0 right-0 w-6 h-6 bg-white/10 border border-white/20 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors">
                <FiCamera size={10} />
              </button>
            </div>
            <div className="mt-3 text-sm font-semibold text-white">{user?.name}</div>
            <div className="text-xs text-slate-400">{user?.email}</div>
            <span className="inline-block mt-2 text-xs bg-violet-500/20 text-violet-300 border border-violet-500/30 px-2 py-0.5 rounded-full capitalize">{user?.role}</span>
          </div>

          {sections.map((s) => (
            <button key={s.id} onClick={() => setActiveSection(s.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${activeSection === s.id ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30' : 'text-slate-400 hover:bg-white/5 border border-transparent'}`}>
              <s.icon size={16} />
              {s.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6">
          {activeSection === 'profile' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Profile Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Full Name</label>
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Email (read-only)</label>
                  <input value={user?.email} readOnly className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Target Job Role</label>
                  <input value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">Experience Level</label>
                  <select value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}
                    className="w-full bg-[#1a1b2e] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50">
                    {['entry', 'junior', 'mid', 'senior', 'lead'].map((l) => (
                      <option key={l} value={l} className="capitalize">{l.charAt(0).toUpperCase() + l.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <div className={`w-2 h-2 rounded-full ${user?.email_verified ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  {user?.email_verified ? 'Email verified' : 'Email not verified'}
                </div>
                <div className="text-xs text-slate-400">• {user?.total_points || 0} total points</div>
              </div>
              <button onClick={handleProfileSave} disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all">
                {saving ? 'Saving...' : <><FiSave size={14} /> Save Changes</>}
              </button>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Change Password</h2>
              {['current', 'new', 'confirm'].map((field) => (
                <div key={field}>
                  <label className="block text-xs text-slate-400 mb-2 capitalize">{field === 'confirm' ? 'Confirm New Password' : `${field} Password`}</label>
                  <input type="password" value={passwords[field]} onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500/50 transition-colors" />
                </div>
              ))}
              <button onClick={handlePasswordChange} disabled={saving}
                className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all">
                {saving ? 'Updating...' : <><FiLock size={14} /> Update Password</>}
              </button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="space-y-5">
              <h2 className="text-lg font-semibold text-white">Notification Preferences</h2>
              {[
                { label: 'Interview completion alerts', desc: 'Get notified when your interview analysis is ready' },
                { label: 'Weekly performance summary', desc: 'Receive a weekly email with your progress stats' },
                { label: 'Resume analysis complete', desc: 'Notification when resume ATS scoring is done' },
                { label: 'New features & updates', desc: 'Stay updated with the latest InterviewAI features' },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                  <div>
                    <div className="text-sm text-white">{n.label}</div>
                    <div className="text-xs text-slate-400">{n.desc}</div>
                  </div>
                  <div className="w-10 h-6 bg-violet-600 rounded-full relative cursor-pointer">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
