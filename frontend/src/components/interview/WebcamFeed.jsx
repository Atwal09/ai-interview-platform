import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const WebcamFeed = ({ showFaceDetection = true, className = '', onEmotionChange }) => {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const emotionTimerRef = useRef(null)
  const [status, setStatus] = useState('requesting') // requesting | active | denied
  const [error, setError] = useState(null)
  const [faceDetected, setFaceDetected] = useState(false)
  const [emotion, setEmotion] = useState('Focused')
  const [eyeContact, setEyeContact] = useState(true)

  const EMOTIONS = ['Confident', 'Focused', 'Engaged', 'Calm', 'Nervous', 'Thinking']

  useEffect(() => {
    let mounted = true

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        })
        streamRef.current = stream
        if (!mounted) { stream.getTracks().forEach(t => t.stop()); return }

        // Set status immediately — don't wait for videoRef
        setStatus('active')
        setFaceDetected(true)

        // Attach stream to video element
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }

        // Simulate face/emotion detection
        emotionTimerRef.current = setInterval(() => {
          if (!mounted) return
          const detected = Math.random() > 0.08
          setFaceDetected(detected)
          setEyeContact(Math.random() > 0.2)
          if (detected) {
            const e = EMOTIONS[Math.floor(Math.random() * EMOTIONS.length)]
            setEmotion(e)
            onEmotionChange?.(e)
          }
        }, 3500)
      } catch (err) {
        if (mounted) { setError(err.message); setStatus('denied') }
      }
    }

    startCamera()

    return () => {
      mounted = false
      clearInterval(emotionTimerRef.current)
      streamRef.current?.getTracks().forEach(t => t.stop())
    }
  }, [])

  // Attach stream when video element mounts (handles timing issues)
  const videoCallbackRef = (node) => {
    videoRef.current = node
    if (node && streamRef.current) {
      node.srcObject = streamRef.current
    }
  }

  // Canvas overlay drawing
  useEffect(() => {
    if (!canvasRef.current || !showFaceDetection || status !== 'active') return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let rafId

    const draw = () => {
      if (!videoRef.current) { rafId = requestAnimationFrame(draw); return }
      canvas.width = videoRef.current.videoWidth || 640
      canvas.height = videoRef.current.videoHeight || 480
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      if (faceDetected) {
        const bx = canvas.width * 0.28, by = canvas.height * 0.08
        const bw = canvas.width * 0.44, bh = canvas.height * 0.65
        const cs = 18

        ctx.strokeStyle = eyeContact ? 'rgba(139,92,246,0.85)' : 'rgba(245,158,11,0.85)'
        ctx.lineWidth = 2
        ctx.setLineDash([8, 4])
        ctx.strokeRect(bx, by, bw, bh)
        ctx.setLineDash([])
        ctx.lineWidth = 3

        const corners = [
          [[bx, by + cs], [bx, by], [bx + cs, by]],
          [[bx + bw - cs, by], [bx + bw, by], [bx + bw, by + cs]],
          [[bx, by + bh - cs], [bx, by + bh], [bx + cs, by + bh]],
          [[bx + bw - cs, by + bh], [bx + bw, by + bh], [bx + bw, by + bh - cs]],
        ]
        corners.forEach(([a, b, c]) => {
          ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.lineTo(...c); ctx.stroke()
        })

        // Label
        const label = emotion
        ctx.fillStyle = eyeContact ? 'rgba(139,92,246,0.9)' : 'rgba(245,158,11,0.9)'
        ctx.fillRect(bx, by - 24, label.length * 7 + 16, 22)
        ctx.fillStyle = 'white'
        ctx.font = '11px Inter, sans-serif'
        ctx.fillText(label, bx + 8, by - 7)
      }
      rafId = requestAnimationFrame(draw)
    }
    rafId = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafId)
  }, [faceDetected, emotion, eyeContact, showFaceDetection, status])

  if (status === 'denied') return (
    <div className={`flex flex-col items-center justify-center bg-slate-900 rounded-2xl border border-white/10 ${className}`} style={{ minHeight: 200 }}>
      <div className="text-4xl mb-2">📷</div>
      <p className="text-slate-400 text-sm font-medium">Camera Access Denied</p>
      <p className="text-slate-600 text-xs mt-1 text-center px-4">{error || 'Allow camera access in browser settings'}</p>
    </div>
  )

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-black ${className}`}>
      {/* Show spinner overlay ONLY while video hasn't loaded yet */}
      <AnimatePresence>
        {status === 'requesting' && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10 rounded-2xl">
            <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-slate-400 text-xs">Requesting camera...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <video ref={videoCallbackRef} autoPlay muted playsInline
        className="w-full h-full object-cover"
        style={{ transform: 'scaleX(-1)', minHeight: 200 }}
        onLoadedMetadata={() => setStatus('active')}
      />

      {showFaceDetection && (
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ transform: 'scaleX(-1)' }} />
      )}

      {/* Status badges */}
      {status === 'active' && (
        <>
          <motion.div animate={{ opacity: [1, 0.5, 1] }} transition={{ duration: 2, repeat: Infinity }}
            className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            <span className="text-white text-xs font-medium">LIVE</span>
          </motion.div>

          <div className="absolute top-2 right-2">
            <motion.div key={emotion} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className={`flex items-center gap-1 px-2 py-1 backdrop-blur-sm rounded-full text-xs font-medium border ${
                eyeContact
                  ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                  : 'bg-amber-500/20 border-amber-500/30 text-amber-400'
              }`}>
              {eyeContact ? '👁 Contact OK' : '👁 Look at Camera'}
            </motion.div>
          </div>

          <div className="absolute bottom-2 left-2 right-2">
            <div className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1 flex justify-between text-xs">
              <span className="text-slate-400">Expression:</span>
              <motion.span key={emotion} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-violet-300 font-medium">{emotion}</motion.span>
            </div>
          </div>
        </>
      )}

      {/* Vignette */}
      <div className="absolute inset-0 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] rounded-2xl pointer-events-none" />
    </div>
  )
}

export default WebcamFeed
