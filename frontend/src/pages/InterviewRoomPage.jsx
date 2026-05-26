import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSkipForward, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import api from '../services/api';
import toast from 'react-hot-toast';
import { addNotification } from '../store/notificationSlice';
import TimerDisplay from '../components/interview/TimerDisplay';
import WebcamFeed from '../components/interview/WebcamFeed';
import MicButton from '../components/interview/MicButton';
import QuestionCard from '../components/interview/QuestionCard';
import AnalysisPanel from '../components/interview/AnalysisPanel';
import LiveSpeechMetrics from '../components/interview/LiveSpeechMetrics';
import InterviewFeedbackDashboard from '../components/interview/InterviewFeedbackDashboard';

export default function InterviewRoomPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const elapsedRef = useRef(null);

  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [completedData, setCompletedData] = useState(null); // null = not done
  const [timerKey, setTimerKey] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [emotion, setEmotion] = useState('Focused');
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [responses, setResponses] = useState([]);

  const currentQuestion = questions[currentIdx];
  const progress = questions.length > 0 ? (currentIdx / questions.length) * 100 : 0;

  // Elapsed seconds counter for speech metrics
  useEffect(() => {
    if (!isRecording) return;
    if (!startTimeRef.current) startTimeRef.current = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.round((Date.now() - startTimeRef.current) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [isRecording]);

  // Load interview
  useEffect(() => {
    const fetchInterview = async () => {
      try {
        const res = await api.get(`/interviews/${id}`);
        const data = res.data.data.interview;
        setInterview(data);
        setQuestions(data.questions || []);
        // Start interview
        await api.post(`/interviews/${id}/start`).catch(() => {});
      } catch {
        toast.error('Failed to load interview');
        navigate('/interview');
      } finally {
        setLoading(false);
      }
    };
    fetchInterview();
  }, [id]);

  // Web Speech API
  const startRecording = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Use Chrome for speech recognition support');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    let finalTranscript = '';

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += t + ' ';
        else interim += t;
      }
      setTranscript(finalTranscript + interim);
    };
    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);
    recognition.start();
    recognitionRef.current = recognition;
    startTimeRef.current = Date.now();
    setIsRecording(true);
    setTranscript('');
    setElapsedSeconds(0);
  }, []);

  const stopRecording = useCallback(() => {
    recognitionRef.current?.stop();
    setIsRecording(false);
  }, []);

  const submitAnswer = async () => {
    if (!transcript.trim()) {
      toast.error('Record your answer first');
      return;
    }
    stopRecording();
    setSubmitting(true);
    try {
      const res = await api.post(`/interviews/${id}/respond`, {
        questionId: currentQuestion._id || currentQuestion.id,
        transcript: transcript.trim(),
      });
      const newAnalysis = res.data.data.analysis;
      setAnalysis(newAnalysis);
      setResponses(prev => [...prev, { ...res.data.data.response, questionText: currentQuestion.questionText }]);
      setShowAnalysis(true);
      toast.success('Answer analyzed!');
    } catch {
      toast.error('Analysis failed — moving on');
      setShowAnalysis(true);
      setAnalysis(null);
    } finally {
      setSubmitting(false);
    }
  };

  const nextQuestion = () => {
    setShowAnalysis(false);
    setAnalysis(null);
    setTranscript('');
    setElapsedSeconds(0);
    startTimeRef.current = null;
    setTimerKey(k => k + 1);
    if (currentIdx + 1 >= questions.length) {
      finishInterview();
    } else {
      setCurrentIdx(i => i + 1);
    }
  };

  const finishInterview = async () => {
    setEnding(true);
    setShowEndConfirm(false);
    const endingToast = toast.loading('Generating AI feedback…');
    try {
      const res = await api.post(`/interviews/${id}/complete`);
      const done = res.data.data.interview;
      toast.dismiss(endingToast);
      toast.success('Interview complete! Great job! 🎉');

      // Fire a real notification so the bell lights up
      dispatch(addNotification({
        type: 'success',
        title: '🎉 Interview Complete!',
        message: `You scored ${done.overallScore || 0}/100 on your ${done.type || ''} interview. Check your feedback!`,
        data: { interviewId: done._id },
      }));

      setInterview(done);
      setCompletedData(done);
    } catch {
      toast.dismiss(endingToast);
      toast.error('Could not save results');
      setCompletedData(interview || { aiFeedback: {} });
    } finally {
      setEnding(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="min-h-screen bg-[#0a0b14] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-slate-400 text-sm">Loading your interview…</p>
      </div>
    </div>
  );

  // ── Completed → Show full feedback dashboard ──────────────────────────────
  if (completedData) return (
    <InterviewFeedbackDashboard
      interview={completedData}
      responses={responses}
      overallScore={completedData.overallScore || 0}
    />
  );

  // ── Main Interview UI ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0a0b14] text-white flex flex-col">

      {/* End Interview Confirm Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-slate-900 border border-white/15 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
              <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto mb-4">
                <FiAlertTriangle size={22} className="text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-white text-center mb-2">End Interview?</h3>
              <p className="text-slate-400 text-sm text-center mb-5">
                You've answered {currentIdx} of {questions.length} questions. Your responses will be analyzed and scored.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setShowEndConfirm(false)}
                  className="flex-1 border border-white/10 hover:border-white/20 text-slate-400 py-2.5 rounded-xl text-sm font-medium transition-all">
                  Continue
                </button>
                <button onClick={finishInterview} disabled={ending}
                  className="flex-1 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {ending ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Finishing…</> : 'End & Get Feedback'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Header */}
      <div className="border-b border-white/5 px-4 py-3 flex items-center justify-between bg-white/[0.02] shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-violet-500 shrink-0" />
          <span className="text-sm font-medium text-white truncate">{interview?.title}</span>
          <span className="text-xs text-slate-500 bg-white/5 px-2 py-0.5 rounded-full capitalize shrink-0">{interview?.difficulty}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-xs text-slate-400 hidden sm:block">
            Question {currentIdx + 1} / {questions.length}
          </span>
          <TimerDisplay key={timerKey} initialTime={(interview?.durationMinutes || 30) * 60} onTimeUp={finishInterview} size="sm" />
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => setShowEndConfirm(true)}
            disabled={ending}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-400 transition-colors border border-white/10 hover:border-red-500/30 hover:bg-red-500/5 px-3 py-1.5 rounded-lg disabled:opacity-50 font-medium">
            <FiXCircle size={13} />
            {ending ? 'Ending…' : 'End Interview'}
          </motion.button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-0.5 bg-white/5 shrink-0">
        <motion.div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500"
          animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
      </div>

      {/* Main Content — 3 columns on large screens */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-6 overflow-hidden">

        {/* LEFT: Webcam + Mic + Transcript */}
        <div className="lg:col-span-2 border-r border-white/5 p-4 flex flex-col gap-3 overflow-y-auto">
          <WebcamFeed onEmotionChange={setEmotion} />

          <MicButton
            isRecording={isRecording}
            onToggle={() => isRecording ? stopRecording() : startRecording()}
          />

          {/* Transcript Box */}
          <div className="flex-1 min-h-24 bg-white/[0.03] border border-white/10 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1.5 flex items-center gap-1.5">
              {isRecording && <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />}
              {isRecording ? <span className="text-red-400">Recording...</span> : 'Your answer:'}
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {transcript || <span className="text-slate-600 italic">Press mic and start speaking…</span>}
            </p>
          </div>

          {/* Submit Button */}
          <motion.button
            whileHover={{ scale: transcript.trim() ? 1.01 : 1 }}
            whileTap={{ scale: 0.98 }}
            onClick={submitAnswer}
            disabled={submitting || !transcript.trim()}
            className="w-full bg-gradient-to-r from-violet-600 to-cyan-600 hover:from-violet-500 hover:to-cyan-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2">
            {submitting ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Analyzing with AI…</>
            ) : (
              <><FiCheckCircle size={16} />Submit & Analyze</>
            )}
          </motion.button>
        </div>

        {/* CENTER: Question + Analysis */}
        <div className="lg:col-span-3 p-4 flex flex-col gap-4 overflow-y-auto">
          {currentQuestion && (
            <QuestionCard
              question={currentQuestion.questionText}
              questionNumber={currentIdx + 1}
              totalQuestions={questions.length}
              type={currentQuestion.type || interview?.type || 'technical'}
              difficulty={currentQuestion.difficulty || interview?.difficulty || 'medium'}
            />
          )}

          <AnimatePresence>
            {showAnalysis && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <AnalysisPanel analysis={analysis} />
                <motion.button
                  whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}
                  onClick={nextQuestion}
                  className="mt-3 w-full flex items-center justify-center gap-2 border border-violet-500/40 hover:bg-violet-500/10 text-violet-300 py-3 rounded-xl font-semibold text-sm transition-all">
                  {currentIdx + 1 >= questions.length ? (
                    <><FiCheckCircle size={16} />Finish & Get Full Feedback</>
                  ) : (
                    <><FiSkipForward size={16} />Next Question ({currentIdx + 2}/{questions.length})</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Question dots progress */}
          <div className="flex gap-1.5 flex-wrap mt-auto">
            {questions.map((_, i) => (
              <div key={i} className={`h-1.5 flex-1 min-w-4 max-w-8 rounded-full transition-all ${
                i < currentIdx ? 'bg-violet-500' :
                i === currentIdx ? 'bg-cyan-400' :
                'bg-white/10'
              }`} />
            ))}
          </div>
        </div>

        {/* RIGHT: Live Speech Metrics */}
        <div className="lg:col-span-1 border-l border-white/5 p-3 hidden lg:block">
          <LiveSpeechMetrics
            transcript={transcript}
            isRecording={isRecording}
            elapsedSeconds={elapsedSeconds}
            emotion={emotion}
          />
        </div>
      </div>

      {/* Mobile: Live metrics bar at bottom */}
      <div className="lg:hidden border-t border-white/5 px-4 py-2 bg-white/[0.02] flex items-center gap-4 text-xs overflow-x-auto">
        <span className="text-slate-500 shrink-0">Live:</span>
        <span className="text-violet-300 shrink-0">Confidence: {isRecording ? '—' : '—'}</span>
        <span className="text-cyan-300 shrink-0">Emotion: {emotion}</span>
      </div>
    </div>
  );
}
