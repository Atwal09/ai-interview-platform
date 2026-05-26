import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUsers, FiBarChart2, FiShield, FiSearch, FiMoreVertical, FiDownload } from 'react-icons/fi';
import api from '../services/api';
import Skeleton from '../components/ui/Skeleton';
import toast from 'react-hot-toast';

const tabs = ['Overview', 'Users', 'API Usage', 'Logs'];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [apiUsage, setApiUsage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, usersRes] = await Promise.all([
          api.get('/admin/stats'),
          api.get(`/admin/users?page=${page}&limit=10&search=${search}`),
        ]);
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data.users);
        setTotalUsers(usersRes.data.data.pagination?.total || 0);
        if (activeTab === 2) {
          const usageRes = await api.get('/admin/api-usage');
          setApiUsage(usageRes.data.data.usage);
        }
      } catch (err) {
        toast.error('Failed to load admin data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [page, search]);

  const updateUser = async (userId, data) => {
    try {
      await api.patch(`/admin/users/${userId}`, data);
      setUsers(u => u.map(user => user.id === userId ? { ...user, ...data } : user));
      toast.success('User updated');
    } catch { toast.error('Update failed'); }
  };

  const exportUsers = async () => {
    try {
      const res = await api.get('/admin/export/users', { responseType: 'blob' });
      const url = URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a'); a.href = url; a.download = 'users-export.csv'; a.click();
    } catch { toast.error('Export failed'); }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <FiShield className="text-violet-400" /> Admin <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Dashboard</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Platform management and analytics</p>
        </div>
        <button onClick={exportUsers} className="flex items-center gap-2 border border-white/10 hover:border-white/20 text-slate-300 px-4 py-2 rounded-xl text-sm transition-colors">
          <FiDownload size={14} /> Export Users
        </button>
      </motion.div>

      {/* Stats */}
      {loading ? (
        <div className="grid sm:grid-cols-4 gap-4">{[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}</div>
      ) : stats && (
        <div className="grid sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Users', value: stats.users?.total, sub: `${stats.users?.active} active`, color: 'from-violet-500 to-purple-600' },
            { label: 'Interviews', value: stats.interviews?.total, sub: `${stats.interviews?.completed} completed`, color: 'from-cyan-500 to-blue-600' },
            { label: 'Daily Active Users', value: stats.dau, sub: 'Today', color: 'from-emerald-500 to-teal-600' },
            { label: 'Resumes Analyzed', value: stats.resumes?.total, sub: 'All time', color: 'from-orange-500 to-amber-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="text-3xl font-bold text-white">{s.value?.toLocaleString()}</div>
              <div className="text-sm text-slate-400 mt-1">{s.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1 w-fit">
        {tabs.map((tab, i) => (
          <button key={tab} onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === i ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
            {tab}
          </button>
        ))}
      </div>

      {/* Users Table */}
      {activeTab === 1 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between gap-4">
            <div className="relative">
              <FiSearch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search users..."
                className="bg-white/5 border border-white/10 rounded-lg pl-8 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 w-64" />
            </div>
            <span className="text-xs text-slate-400">{totalUsers} users total</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  {['Name', 'Email', 'Role', 'Status', 'Points', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs text-slate-400 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={7} className="px-6 py-3"><Skeleton className="h-6" /></td></tr>
                )) : users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold shrink-0">{u.name?.[0]}</div>
                        <span className="text-sm text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-400">{u.email}</td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300' : 'bg-violet-500/20 text-violet-300'}`}>{u.role}</span>
                    </td>
                    <td className="px-6 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>{u.status}</span>
                    </td>
                    <td className="px-6 py-3 text-sm text-slate-300">{u.total_points}</td>
                    <td className="px-6 py-3 text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3">
                      <button onClick={() => updateUser(u.id, { status: u.status === 'active' ? 'suspended' : 'active' })}
                        className={`text-xs px-3 py-1 rounded-lg border transition-colors ${u.status === 'active' ? 'border-red-500/30 text-red-400 hover:bg-red-500/10' : 'border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10'}`}>
                        {u.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-between">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors">← Previous</button>
            <span className="text-sm text-slate-400">Page {page}</span>
            <button disabled={users.length < 10} onClick={() => setPage(p => p + 1)} className="text-sm text-slate-400 hover:text-white disabled:opacity-30 transition-colors">Next →</button>
          </div>
        </div>
      )}

      {activeTab === 0 && (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center">
          <FiBarChart2 size={32} className="mx-auto text-slate-600 mb-3" />
          <p className="text-slate-400 text-sm">Platform overview analytics charts coming soon.</p>
        </div>
      )}
    </div>
  );
}
