import { useState, useRef, useCallback, useEffect } from 'react'

const useMediaRecorder = () => {
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioUrl, setAudioUrl] = useState(null)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState(null)
  const [stream, setStream] = useState(null)
  const [audioLevel, setAudioLevel] = useState(0)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)
  const analyzerRef = useRef(null)
  const animFrameRef = useRef(null)

  const startRecording = useCallback(async () => {
    try {
      setError(null)
      const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setStream(audioStream)

      // Audio level analyzer
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const source = audioContext.createMediaStreamSource(audioStream)
      source.connect(analyser)
      analyser.fftSize = 256
      analyzerRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      const checkLevel = () => {
        analyser.getByteFrequencyData(dataArray)
        const avg = dataArray.reduce((a, b) => a + b, 0) / dataArray.length
        setAudioLevel(Math.round((avg / 255) * 100))
        animFrameRef.current = requestAnimationFrame(checkLevel)
      }
      animFrameRef.current = requestAnimationFrame(checkLevel)

      const recorder = new MediaRecorder(audioStream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/ogg',
      })
      mediaRecorderRef.current = recorder
      chunksRef.current = []

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })
        setAudioBlob(blob)
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
      }

      recorder.start(100)
      setIsRecording(true)
      setDuration(0)

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1)
      }, 1000)
    } catch (err) {
      setError(err.message || 'Failed to access microphone.')
      console.error('MediaRecorder error:', err)
    }
  }, [])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)

      if (stream) {
        stream.getTracks().forEach(track => track.stop())
        setStream(null)
      }

      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }

      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current)
        animFrameRef.current = null
      }

      setAudioLevel(0)
    }
  }, [isRecording, stream])

  const resetRecording = useCallback(() => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
    }
    setAudioBlob(null)
    setAudioUrl(null)
    setDuration(0)
    setError(null)
    setAudioLevel(0)
    chunksRef.current = []
  }, [audioUrl])

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }, [isRecording, startRecording, stopRecording])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
      if (timerRef.current) clearInterval(timerRef.current)
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [])

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    formattedDuration: formatDuration(duration),
    error,
    audioLevel,
    startRecording,
    stopRecording,
    resetRecording,
    toggleRecording,
  }
}

export default useMediaRecorder
