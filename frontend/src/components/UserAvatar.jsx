import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  BookOpen, 
  Users, 
  Plus,
  Crown,
  Heart,
  MessageSquare
} from 'lucide-react'

const UserAvatar = () => {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!user) return null

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-accent transition-colors"
        aria-label="User menu"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center overflow-hidden">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm font-medium text-primary-foreground">
              {user.firstName[0]}{user.lastName[0]}
            </span>
          )}
        </div>
        <span className="hidden md:block text-sm font-medium text-foreground">
          {user.firstName}
        </span>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50">
          {/* User Info Header */}
          <div className="p-4 border-b border-border bg-gradient-to-r from-primary/5 to-secondary/5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center overflow-hidden">
                {user.profileImage ? (
                  <img
                    src={user.profileImage}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-primary-foreground">
                    {user.firstName[0]}{user.lastName[0]}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <div className="font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {user.email}
                </div>
                <div className="text-xs text-muted-foreground flex items-center">
                  <Crown className="w-3 h-3 mr-1" />
                  {user.university}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="p-2">
            <Link
              to="/create-listing"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <Plus className="w-5 h-5 text-primary" />
              <span className="text-foreground">List an Item</span>
            </Link>
            
            <Link
              to="/create-group"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <Users className="w-5 h-5 text-primary" />
              <span className="text-foreground">Create Study Group</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="p-2 border-t border-border">
            <Link
              to="/marketplace"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Marketplace</span>
            </Link>
            
            <Link
              to="/study-groups"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <Users className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Study Groups</span>
            </Link>

            <Link
              to="/favorites"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <Heart className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">My Favorites</span>
            </Link>

            <Link
              to="/proposals"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Proposals</span>
            </Link>
          </div>

          {/* User Settings */}
          <div className="p-2 border-t border-border">
            <Link
              to="/profile"
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-5 h-5 text-muted-foreground" />
              <span className="text-foreground">Profile</span>
            </Link>
            
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 w-full p-3 rounded-lg hover:bg-accent transition-colors text-left text-foreground"
            >
              <LogOut className="w-5 h-5 text-muted-foreground" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserAvatar
