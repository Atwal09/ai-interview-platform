import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUpload, FiFileText, FiDownload, FiTrash2, FiAlertCircle } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';
import DropZone from '../components/resume/DropZone';
import ATSScoreCard from '../components/resume/ATSScoreCard';
import SuggestionList from '../components/resume/SuggestionList';

const tabs = ['ATS Score', 'Sections', 'AI Suggestions', 'Keywords'];

export default function ResumePage() {
  const [activeTab, setActiveTab] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [targetRole, setTargetRole] = useState('');

  const onUpload = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file only');
      return;
    }
    setUploading(true);
    setUploadProgress(0);
    const fd = new FormData();
    fd.append('resume', file);
    if (targetRole) fd.append('targetRole', targetRole);

    try {
      const res = await api.post('/resume/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (e) => setUploadProgress(Math.round((e.loaded * 100) / e.total)),
      });
      setResult(res.data.data.resume);
      toast.success('Resume analyzed successfully!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [targetRole]);

  const scores = result?.scores;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-white">Resume <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">ATS Analyzer</span></h1>
        <p className="text-slate-400 mt-1 text-sm">Upload your PDF resume and get an instant ATS score with AI-powered suggestions</p>
      </motion.div>

      {!result ? (
        <div className="max-w-2xl mx-auto space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-2">Target Job Role (optional)</label>
            <input
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Software Engineer, Data Scientist, Product Manager"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50 transition-colors"
            />
          </div>
          <DropZone onFileSelect={onUpload} disabled={uploading} />
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Uploading & analyzing...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" animate={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Resume Header */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <FiFileText size={18} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">{result.file_name}</div>
                <div className="text-xs text-slate-400">{result.target_role && `Target: ${result.target_role}`}</div>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    const res = await api.get(`/resume/${result.id}/download`, { responseType: 'blob' });
                    const url = URL.createObjectURL(new Blob([res.data]));
                    const a = document.createElement('a'); a.href = url; a.download = 'resume-report.json'; a.click();
                  } catch { toast.error('Download failed'); }
                }}
                className="flex items-center gap-2 text-sm border border-white/10 hover:border-white/20 text-slate-300 px-4 py-2 rounded-lg transition-colors"
              >
                <FiDownload size={14} /> Download Report
              </button>
              <button onClick={() => setResult(null)} className="flex items-center gap-2 text-sm border border-red-500/30 hover:bg-red-500/10 text-red-400 px-4 py-2 rounded-lg transition-colors">
                <FiUpload size={14} /> Upload New
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
            {tabs.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(i)}
                className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === i ? 'bg-white/10 text-white' : 'text-slate-400 hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === 0 && <ATSScoreCard scores={scores} />}

              {activeTab === 1 && (
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Contact Info', ok: scores?.has_contact_info },
                    { label: 'Professional Summary', ok: scores?.has_summary },
                    { label: 'Work Experience', ok: scores?.has_experience },
                    { label: 'Education', ok: scores?.has_education },
                    { label: 'Skills Section', ok: scores?.has_skills },
                    { label: 'Projects', ok: scores?.has_projects },
                    { label: 'Certifications', ok: scores?.has_certifications },
                  ].map((s) => (
                    <div key={s.label} className={`flex items-center gap-3 p-4 rounded-xl border ${s.ok ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${s.ok ? 'bg-emerald-500' : 'bg-red-500/50'}`}>
                        {s.ok ? <span className="text-white text-xs">✓</span> : <FiAlertCircle size={10} className="text-red-300" />}
                      </div>
                      <span className="text-sm text-slate-300">{s.label}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 2 && <SuggestionList suggestions={scores?.ai_suggestions || []} />}

              {activeTab === 3 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-emerald-400 mb-3">✓ Matched Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {(scores?.matched_keywords || []).map((kw) => (
                        <span key={kw} className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full">{kw}</span>
                      ))}
                      {!scores?.matched_keywords?.length && <p className="text-slate-500 text-xs">No matched keywords detected</p>}
                    </div>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                    <h3 className="text-sm font-semibold text-red-400 mb-3">✗ Missing Keywords</h3>
                    <div className="flex flex-wrap gap-2">
                      {(scores?.missing_keywords || []).map((kw) => (
                        <span key={kw} className="text-xs bg-red-500/20 text-red-300 border border-red-500/30 px-3 py-1 rounded-full">{kw}</span>
                      ))}
                      {!scores?.missing_keywords?.length && <p className="text-slate-500 text-xs">Great! No major missing keywords</p>}
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
