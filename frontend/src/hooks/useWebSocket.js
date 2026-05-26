import { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { io } from 'socket.io-client'
import { addNotification, setSocketConnected } from '../store/notificationSlice'

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'

const useWebSocket = () => {
  const dispatch = useDispatch()
  const { token, isAuthenticated } = useSelector((state) => state.auth)
  const { isConnected } = useSelector((state) => state.notifications)
  const socketRef = useRef(null)
  const [connectionError, setConnectionError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated || !token) return

    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    })

    const socket = socketRef.current

    socket.on('connect', () => {
      dispatch(setSocketConnected(true))
      setConnectionError(null)
    })

    socket.on('disconnect', () => {
      dispatch(setSocketConnected(false))
    })

    socket.on('connect_error', (err) => {
      setConnectionError(err.message)
      dispatch(setSocketConnected(false))
    })

    socket.on('notification', (notification) => {
      dispatch(addNotification(notification))
    })

    socket.on('interview:update', (data) => {
      dispatch(addNotification({
        type: 'interview',
        title: 'Interview Update',
        message: data.message,
        data,
      }))
    })

    socket.on('analysis:complete', (data) => {
      dispatch(addNotification({
        type: 'success',
        title: 'Analysis Complete',
        message: 'Your interview analysis is ready!',
        data,
      }))
    })

    socket.on('resume:analyzed', (data) => {
      dispatch(addNotification({
        type: 'success',
        title: 'Resume Analyzed',
        message: 'Your resume analysis is complete!',
        data,
      }))
    })

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
      }
    }
  }, [isAuthenticated, token, dispatch])

  const emit = (event, data) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data)
    }
  }

  const on = (event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback)
      return () => socketRef.current?.off(event, callback)
    }
  }

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    emit,
    on,
  }
}

export default useWebSocket
