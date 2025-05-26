import React, { useState, useEffect } from 'react'
import Login from './components/Login'
import Signup from './components/Signup'
import Dashboard from './components/Dashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('login')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token')
    if (token) {
      // Verify token with backend
      fetch('http://localhost:5000/api/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUser(data.user)
          setCurrentPage('dashboard')
        } else {
          localStorage.removeItem('token')
        }
      })
      .catch(() => {
        localStorage.removeItem('token')
      })
      .finally(() => {
        setLoading(false)
      })
    } else {
      setLoading(false)
    }
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
    setCurrentPage('dashboard')
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setUser(null)
    setCurrentPage('login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {currentPage === 'login' && (
        <Login 
          onLogin={handleLogin} 
          onSwitchToSignup={() => setCurrentPage('signup')} 
        />
      )}
      {currentPage === 'signup' && (
        <Signup 
          onSignup={handleLogin}
          onSwitchToLogin={() => setCurrentPage('login')} 
        />
      )}
      {currentPage === 'dashboard' && (
        <Dashboard 
          user={user} 
          onLogout={handleLogout} 
        />
      )}
    </div>
  )
}

export default App