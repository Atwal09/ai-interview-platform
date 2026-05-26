import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiTrendingUp, FiMic, FiTarget, FiAward, FiBarChart } from 'react-icons/fi';
import {
  LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import api from '../services/api';
import Skeleton from '../components/ui/Skeleton';

const safe = (v) => (typeof v === 'number' && isFinite(v) ? v : 0);

const MetricCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
    <div className="flex items-center justify-between mb-3">
      <span className="text-sm text-slate-400">{label}</span>
      <Icon size={16} className={color} />
    </div>
    <div className="text-3xl font-bold text-white mb-2">
      {value != null && value !== 0 ? safe(value).toFixed(0) : '—'}
    </div>
    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-500"
        style={{ width: `${Math.min(safe(value), 100)}%` }}
      />
    </div>
  </div>
);

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [radarData, setRadarData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [statsRes, chartRes, lbRes, skillsRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get(`/dashboard/performance?days=${days}`),
          api.get('/dashboard/leaderboard?limit=5'),
          api.get('/dashboard/skills'),
        ]);

        setStats(statsRes.data.data);

        setChartData((chartRes.data.data.chart || []).map(d => ({
          date: d.date,
          score: safe(d.avgScore),
        })));

        setLeaderboard(lbRes.data.data.leaderboard || []);

        const skills = skillsRes.data.data.skills || [];
        setRadarData(skills.length > 0 ? skills.map(s => ({
          subject: s.type || s.subject,
          A: safe(s.avgScore),
        })) : [
          { subject: 'Communication', A: safe(statsRes.data.data.avgCommunication) },
          { subject: 'Technical', A: safe(statsRes.data.data.avgScore) },
          { subject: 'Confidence', A: safe(statsRes.data.data.avgScore) - 5 },
          { subject: 'Problem Solving', A: Math.max(safe(statsRes.data.data.avgScore) - 10, 0) },
          { subject: 'Leadership', A: Math.max(safe(statsRes.data.data.avgCommunication) - 8, 0) },
          { subject: 'Adaptability', A: Math.max(safe(statsRes.data.data.avgScore) - 3, 0) },
        ]);
      } catch {
        setStats({ avgScore: 0, avgCommunication: 0, totalInterviews: 0 });
        setChartData([]);
        setLeaderboard([]);
        setRadarData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [days]);

  const metrics = [
    { label: 'Overall Score', value: stats?.avgScore, color: 'text-violet-400', icon: FiAward },
    { label: 'Communication', value: stats?.avgCommunication, color: 'text-cyan-400', icon: FiMic },
    { label: 'Best Score', value: stats?.bestScore, color: 'text-emerald-400', icon: FiTarget },
    { label: 'Interviews Done', value: stats?.totalInterviews, color: 'text-orange-400', icon: FiBarChart },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Performance <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">Analytics</span>
          </h1>
          <p className="text-slate-400 mt-1 text-sm">Track your interview performance trends over time</p>
        </div>
        <div className="flex gap-2">
          {[7, 30, 90].map((d) => (
            <button key={d} onClick={() => setDays(d)}
              className={`text-sm px-4 py-2 rounded-lg border transition-all ${days === d
                ? 'border-violet-500 bg-violet-500/20 text-violet-300'
                : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
              {d}d
            </button>
          ))}
        </div>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loading
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
          : metrics.map((m) => <MetricCard key={m.label} {...m} />)
        }
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Line Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Score Over Time</h2>
          {loading ? <Skeleton className="h-48" /> : chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#1e1f2e', border: '1px solid #ffffff20', borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-slate-500 text-sm gap-2">
              <span className="text-3xl">📊</span>
              Complete your first interview to see your score trend
            </div>
          )}
        </div>

        {/* Radar Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <h2 className="text-base font-semibold text-white mb-4">Skill Dimensions</h2>
          {loading ? <Skeleton className="h-48" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#ffffff10" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                <Radar name="Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.2} />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5">
          <h2 className="text-base font-semibold text-white">🏆 Leaderboard — Top Performers</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? [...Array(5)].map((_, i) => (
            <div key={i} className="px-6 py-3"><Skeleton className="h-8" /></div>
          )) : leaderboard.length > 0 ? leaderboard.map((u, i) => (
            <div key={u._id || u.id || i} className="px-6 py-4 flex items-center gap-4">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-orange-700 text-white' : 'bg-white/10 text-slate-400'}`}>
                {i + 1}
              </div>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold shrink-0">
                {u.name?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white truncate">{u.name}</div>
                <div className="text-xs text-slate-400">{u.totalInterviews || 0} interviews</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-violet-400">{u.totalPoints || 0} pts</div>
                {u.avgScore > 0 && (
                  <div className="text-xs text-slate-400">{safe(u.avgScore).toFixed(1)} avg</div>
                )}
              </div>
            </div>
          )) : (
            <div className="py-12 text-center">
              <div className="text-3xl mb-2">🏅</div>
              <p className="text-slate-500 text-sm">Complete interviews to appear on the leaderboard</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
