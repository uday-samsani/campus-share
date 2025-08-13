import { Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuth } from './contexts/AuthContext'
import { useTheme } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Marketplace from './pages/Marketplace'
import StudyGroups from './pages/StudyGroups'
import Profile from './pages/Profile'
import CreateListing from './pages/CreateListing'
import ListingDetail from './pages/ListingDetail'
import CreateGroup from './pages/CreateGroup'
import GroupDetail from './pages/GroupDetail'
import Proposals from './pages/Proposals'
import ProposalDetail from './pages/ProposalDetail'
import Favorites from './pages/Favorites'

import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { theme } = useTheme()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="marketplace/:id" element={<ListingDetail />} />
          <Route path="study-groups" element={<StudyGroups />} />
          <Route path="study-groups/:id" element={<GroupDetail />} />
          
          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<Profile />} />
            <Route path="create-listing" element={<CreateListing />} />
            <Route path="create-group" element={<CreateGroup />} />
            <Route path="proposals" element={<Proposals />} />
            <Route path="proposals/:proposalId" element={<ProposalDetail />} />
            <Route path="favorites" element={<Favorites />} />

          </Route>
        </Route>
      </Routes>
    </div>
  )
}

export default App
