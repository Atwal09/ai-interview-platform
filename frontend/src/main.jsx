import React from 'react'
import ReactDOM from 'react-dom/client'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App.jsx'
import { store } from './store/index.js'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(15, 16, 32, 0.95)',
              color: '#f1f5f9',
              border: '1px solid rgba(139, 92, 246, 0.3)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
            },
            success: {
              iconTheme: {
                primary: '#10b981',
                secondary: 'rgba(15, 16, 32, 0.95)',
              },
            },
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'rgba(15, 16, 32, 0.95)',
              },
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
)
