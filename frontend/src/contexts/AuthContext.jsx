import { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import api from '../utils/api'

// JWT utility functions
const isTokenValid = (token) => {
  if (!token) return false
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    const currentTime = Date.now() / 1000
    
    // Check if token is expired (with 5 minute buffer)
    return payload.exp > currentTime + 300
  } catch (error) {
    return false
  }
}

const getTokenPayload = (token) => {
  if (!token) return null
  
  try {
    return JSON.parse(atob(token.split('.')[1]))
  } catch (error) {
    return null
  }
}

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const checkAuth = () => {
    try {
      const token = localStorage.getItem('token')
      
      if (token && isTokenValid(token)) {
        // Extract user info from JWT payload instead of making API call
        const payload = getTokenPayload(token)
        if (payload) {
          const userData = {
            _id: payload.userId,
            userId: payload.userId, // Add userId for consistency
            email: payload.email,
            firstName: payload.firstName,
            lastName: payload.lastName,
            university: payload.university,
            major: payload.major,
            year: payload.year
          }
          
          // Only update if user data has actually changed, but preserve profileImage
          setUser(prevUser => {
            if (!prevUser || JSON.stringify(prevUser) !== JSON.stringify(userData)) {
              // Preserve profileImage from previous user state if it exists
              return {
                ...userData,
                profileImage: prevUser?.profileImage || null
              }
            }
            return prevUser
          })
        } else {
          localStorage.removeItem('token')
          setUser(null)
        }
      } else {
        if (token) {
          localStorage.removeItem('token')
        }
        setUser(null)
      }
    } catch (error) {
      localStorage.removeItem('token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { token, user } = response.data
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      setUser(user)
      
      toast.success('Login successful! Welcome back!')
      navigate('/marketplace') // Redirect to marketplace after login
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { token, user } = response.data
      
      // Store token in localStorage
      localStorage.setItem('token', token)
      setUser(user)
      
      toast.success('Registration successful! Welcome to CampusShare!')
      navigate('/marketplace') // Redirect to marketplace after signup
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setUser(null)
    toast.success('Logged out successfully')
    navigate('/')
  }

  const updateProfile = async (updates) => {
    try {
      const response = await api.put('/users/profile', updates)
      
      // Merge the updates with existing user data to preserve all fields
      setUser(prevUser => ({
        ...prevUser,
        ...response.data
      }))
      
      toast.success('Profile updated successfully!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Profile update failed'
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth
  }

  useEffect(() => {
    checkAuth()
    
    // Set up periodic token validation (every 10 minutes)
    const interval = setInterval(() => {
      const token = localStorage.getItem('token')
      if (token && !isTokenValid(token)) {
        localStorage.removeItem('token')
        setUser(null)
      }
    }, 10 * 60 * 1000) // 10 minutes
    
    return () => clearInterval(interval)
  }, [])

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
