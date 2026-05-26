import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiAward, FiFileText, FiClock, FiPlus, FiArrowRight, FiZap } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import Skeleton from '../components/ui/Skeleton';

const StatCard = ({ label, value, suffix = '', icon: Icon, color, trend }) => (
  <motion.div
    className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all"
    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -2 }}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center`}>
        <Icon size={18} className="text-white" />
      </div>
      {trend !== undefined && (
        <span className={`text-xs px-2 py-1 rounded-full ${trend >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <div className="text-3xl font-bold text-white mb-1">{value}{suffix}</div>
    <div className="text-slate-400 text-sm">{label}</div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-slate-800 border border-white/10 rounded-xl p-3 text-sm">
        <p className="text-slate-400">{label}</p>
        <p className="text-violet-400 font-semibold">{payload[0].value?.toFixed(1)} pts</p>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user } = useSelector((s) => s.auth);
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentInterviews, setRecentInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, chartRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/performance'),
        ]);
        const s = statsRes.data.data;
        setStats(s);
        setRecentInterviews(s.recentInterviews || []);
        setChartData((chartRes.data.data.chart || []).map(d => ({
          date: d.date,
          score: d.avgScore,
        })));
      } catch (err) {
        setStats({ totalInterviews: 0, avgScore: 0, practiceHours: 0, streakDays: 0, totalPoints: 0 });
        setChartData([]);
        setRecentInterviews([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Interviews', value: stats?.totalInterviews ?? 0, icon: FiAward, color: 'from-violet-500 to-purple-600', trend: 12 },
    { label: 'Avg Score', value: stats?.avgScore || '—', suffix: stats?.avgScore ? '/100' : '', icon: FiTrendingUp, color: 'from-cyan-500 to-blue-600', trend: 5 },
    { label: 'Best Score', value: stats?.bestScore || '—', suffix: stats?.bestScore ? '/100' : '', icon: FiFileText, color: 'from-emerald-500 to-teal-600' },
    { label: 'Practice Hours', value: stats?.practiceHours ? parseFloat(stats.practiceHours).toFixed(1) : '0', suffix: 'h', icon: FiClock, color: 'from-orange-500 to-amber-600', trend: 8 },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              Welcome back, <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}!</span> 👋
            </h1>
            <p className="text-slate-400 mt-1 text-sm">
              {stats?.currentStreak > 0 ? `🔥 ${stats.currentStreak} day streak! Keep going!` : 'Ready to practice today?'}
            </p>
          </div>
          <button
            onClick={() => navigate('/interview')}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:shadow-lg hover:shadow-violet-500/25 whitespace-nowrap"
          >
            <FiPlus size={16} /> Start Interview
          </button>
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />) :
          statCards.map((s, i) => <StatCard key={s.label} {...s} />)
        }
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-white">Performance (Last 30 Days)</h2>
          {loading ? <Skeleton className="h-48" /> : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500">
              <FiTrendingUp size={32} className="mb-2 opacity-40" />
              <p className="text-sm">No interview data yet</p>
              <button onClick={() => navigate('/interview')} className="mt-3 text-violet-400 text-sm underline">Start your first interview →</button>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          {[
            { label: 'Start AI Interview', desc: 'Practice with AI questions', icon: FiAward, path: '/interview', color: 'from-violet-500 to-purple-600' },
            { label: 'Analyze Resume', desc: 'Get your ATS score', icon: FiFileText, path: '/resume', color: 'from-emerald-500 to-teal-600' },
            { label: 'View Analytics', desc: 'Track your progress', icon: FiTrendingUp, path: '/analytics', color: 'from-cyan-500 to-blue-600' },
          ].map((a) => (
            <motion.button
              key={a.label}
              onClick={() => navigate(a.path)}
              className="w-full flex items-center gap-4 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/[0.07] rounded-xl p-4 transition-all text-left group"
              whileHover={{ x: 4 }}
            >
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0`}>
                <a.icon size={16} className="text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white">{a.label}</div>
                <div className="text-xs text-slate-400">{a.desc}</div>
              </div>
              <FiArrowRight size={14} className="text-slate-500 group-hover:text-slate-300 transition-colors" />
            </motion.button>
          ))}

          {/* AI Tip */}
          <div className="bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-violet-500/20 rounded-xl p-4 mt-2">
            <div className="flex items-center gap-2 mb-2">
              <FiZap size={14} className="text-violet-400" />
              <span className="text-xs font-semibold text-violet-300">AI Tip of the Day</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">Use the STAR method (Situation, Task, Action, Result) to structure behavioral interview answers for maximum impact.</p>
          </div>
        </div>
      </div>

      {/* Recent Interviews */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5">
          <h2 className="text-lg font-semibold text-white">Recent Interviews</h2>
          <button onClick={() => navigate('/analytics')} className="text-sm text-violet-400 hover:text-violet-300">View all →</button>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12" />)}</div>
        ) : recentInterviews.length > 0 ? (
          <div className="divide-y divide-white/5">
            {recentInterviews.map((interview) => (
              <div key={interview.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">{interview.title}</div>
                  <div className="text-xs text-slate-400">{interview.type} · {interview.difficulty}</div>
                </div>
                <div className="text-right shrink-0">
                  {interview.overall_score ? (
                    <div className="text-sm font-semibold text-emerald-400">{parseFloat(interview.overall_score).toFixed(1)}/100</div>
                  ) : (
                    <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">{interview.status}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-slate-500">
            <FiAward size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No interviews yet</p>
            <button onClick={() => navigate('/interview')} className="mt-3 text-violet-400 text-sm underline">Start your first mock interview →</button>
          </div>
        )}
      </div>
    </div>
  );
}
