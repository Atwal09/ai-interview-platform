import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiZap } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import api from '../../services/api';

export default function AIChatbot() {
  const { token } = useSelector((s) => s.auth);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your AI career coach. Ask me anything about interviews, resume tips, or career advice! 🚀' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!token) return null;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(m => [...m, { role: 'user', content: userMsg }]);
    setLoading(true);
    try {
      const res = await api.post('/chat', { message: userMsg });
      setMessages(m => [...m, { role: 'assistant', content: res.data.data.response }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I\'m having trouble connecting. Please try again!' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Toggle Button */}
      <motion.button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-violet-600 to-cyan-600 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 transition-all"
        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
        aria-label="AI Chatbot"
      >
        {open ? <FiX size={22} className="text-white" /> : <FiMessageCircle size={22} className="text-white" />}
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 bg-[#13141f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 bg-gradient-to-r from-violet-900/50 to-cyan-900/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                <FiZap size={14} className="text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">AI Career Coach</div>
                <div className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Online · powered by Gemini AI
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="ml-auto text-slate-500 hover:text-white transition-colors">
                <FiX size={16} />
              </button>
            </div>

            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] text-sm rounded-2xl px-4 py-2.5 leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-br from-violet-600 to-cyan-600 text-white rounded-br-sm'
                      : 'bg-white/5 border border-white/10 text-slate-300 rounded-bl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3">
                    <div className="flex gap-1">
                      {[0, 0.2, 0.4].map((delay) => (
                        <div key={delay} className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Quick suggestions */}
            <div className="px-4 pb-2 flex gap-2 overflow-x-auto">
              {['STAR method', 'Resume tips', 'Salary negotiation'].map((s) => (
                <button key={s} onClick={() => { setInput(s); }}
                  className="text-xs whitespace-nowrap bg-white/5 border border-white/10 text-slate-400 hover:text-white px-3 py-1.5 rounded-full transition-colors shrink-0">
                  {s}
                </button>
              ))}
            </div>

            {/* Input */}
            <form onSubmit={sendMessage} className="px-4 pb-4">
              <div className="flex gap-2 bg-white/5 border border-white/10 rounded-xl overflow-hidden">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask anything about interviews..."
                  className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none"
                />
                <button type="submit" disabled={!input.trim() || loading}
                  className="px-3 text-violet-400 hover:text-violet-300 disabled:opacity-40 transition-colors">
                  <FiSend size={16} />
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
