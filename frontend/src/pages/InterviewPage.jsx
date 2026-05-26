import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiBriefcase, FiCode, FiUser, FiGlobe, FiArrowRight, FiInfo } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

const interviewTypes = [
  { id: 'hr', label: 'HR Interview', desc: 'Culture fit, background, motivation', icon: FiUser, color: 'from-violet-500 to-purple-600' },
  { id: 'technical', label: 'Technical', desc: 'DSA, System Design, Coding concepts', icon: FiCode, color: 'from-cyan-500 to-blue-600' },
  { id: 'behavioral', label: 'Behavioral', desc: 'STAR method, soft skills, leadership', icon: FiBriefcase, color: 'from-emerald-500 to-teal-600' },
  { id: 'domain_specific', label: 'Domain-Specific', desc: 'Role & industry specific questions', icon: FiGlobe, color: 'from-orange-500 to-amber-600' },
];

const domains = ['Software Engineering', 'Data Science', 'Product Management', 'Marketing', 'Finance', 'Design (UI/UX)', 'DevOps / Cloud', 'Machine Learning', 'Cybersecurity', 'Business Analysis'];
const difficulties = ['easy', 'medium', 'hard'];
const questionCounts = [5, 7, 10, 15];
const durations = [15, 20, 30, 45, 60];

const tips = [
  'Speak clearly and at a moderate pace — avoid rushing.',
  'Use the STAR method for behavioral questions.',
  'Take a 5-second pause to think before answering.',
  'Quantify achievements: "Improved performance by 40%" vs "improved performance".',
  'Ask clarifying questions when needed — it shows engagement.',
];

export default function InterviewPage() {
  const navigate = useNavigate();
  const [type, setType] = useState('technical');
  const [domain, setDomain] = useState('Software Engineering');
  const [difficulty, setDifficulty] = useState('medium');
  const [questionCount, setQuestionCount] = useState(10);
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await api.post('/interviews', {
        title: `${domain} ${interviewTypes.find(t => t.id === type)?.label}`,
        type, domain: domain.toLowerCase().replace(/ /g, '_'),
        difficulty, questionCount, durationMinutes: duration,
      });
      const interviewId = res.data.data.interview.id;
      navigate(`/interview/${interviewId}`);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create interview. Check your connection.');
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Start <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">AI Interview</span></h1>
        <p className="text-slate-400 mt-1 text-sm">Configure your interview session below</p>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Interview Type */}
          <div>
            <h2 className="text-base font-semibold text-white mb-4">Interview Type</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {interviewTypes.map((t) => (
                <button key={t.id} onClick={() => setType(t.id)}
                  className={`text-left p-4 rounded-xl border transition-all ${type === t.id ? 'border-violet-500 bg-violet-500/10' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                  <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${t.color} flex items-center justify-center mb-3`}>
                    <t.icon size={16} className="text-white" />
                  </div>
                  <div className="text-sm font-semibold text-white">{t.label}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Domain (only for domain_specific / technical) */}
          {(type === 'domain_specific' || type === 'technical') && (
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Domain / Field</h2>
              <div className="flex flex-wrap gap-2">
                {domains.map((d) => (
                  <button key={d} onClick={() => setDomain(d)}
                    className={`text-sm px-4 py-2 rounded-lg border transition-all ${domain === d ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 text-slate-300 hover:border-white/20'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div>
            <h2 className="text-base font-semibold text-white mb-3">Difficulty</h2>
            <div className="flex gap-3">
              {difficulties.map((d) => (
                <button key={d} onClick={() => setDifficulty(d)}
                  className={`flex-1 py-3 rounded-xl border capitalize font-medium text-sm transition-all
                    ${difficulty === d
                      ? d === 'easy' ? 'border-emerald-500 bg-emerald-500/20 text-emerald-300'
                        : d === 'medium' ? 'border-amber-500 bg-amber-500/20 text-amber-300'
                        : 'border-red-500 bg-red-500/20 text-red-300'
                      : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Questions & Duration */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Questions</h2>
              <div className="flex gap-2">
                {questionCounts.map((q) => (
                  <button key={q} onClick={() => setQuestionCount(q)}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${questionCount === q ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {q}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-base font-semibold text-white mb-3">Duration (min)</h2>
              <div className="flex flex-wrap gap-2">
                {durations.map((d) => (
                  <button key={d} onClick={() => setDuration(d)}
                    className={`py-2 px-3 rounded-lg border text-sm font-medium transition-all ${duration === d ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-white/10 text-slate-400 hover:border-white/20'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-60 text-white py-4 rounded-xl font-semibold text-base transition-all hover:shadow-lg hover:shadow-violet-500/25"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Generating AI Questions...
              </>
            ) : (
              <>Start Interview <FiArrowRight /></>
            )}
          </button>
        </div>

        {/* Tips Panel */}
        <div className="space-y-4">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <FiInfo size={16} className="text-violet-400" />
              <h3 className="text-sm font-semibold text-white">Interview Tips</h3>
            </div>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="flex gap-3 text-xs text-slate-300 leading-relaxed">
                  <span className="text-violet-400 font-bold shrink-0">{i + 1}.</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-gradient-to-br from-violet-900/30 to-cyan-900/30 border border-violet-500/20 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-2">Session Summary</h3>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex justify-between"><span className="text-slate-400">Type</span><span className="capitalize">{type.replace('_', ' ')}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Difficulty</span><span className="capitalize">{difficulty}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Questions</span><span>{questionCount}</span></div>
              <div className="flex justify-between"><span className="text-slate-400">Duration</span><span>{duration} min</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
