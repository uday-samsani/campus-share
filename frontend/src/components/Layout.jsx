import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { Moon, Sun, Menu, X } from 'lucide-react'
import { useState } from 'react'
import UserAvatar from './UserAvatar'
import icon from '../assets/icon.png'

const Layout = () => {
  const { user, loading, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img 
                  src={icon} 
                  alt="CampusShare Logo" 
                  className="h-8 w-8 rounded-lg object-cover"
                />
                <span className="font-bold text-xl text-foreground">CampusShare</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              <Link to="/marketplace" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Marketplace
              </Link>
              <Link to="/study-groups" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Study Groups
              </Link>
              {user && (
                <>
                  <Link to="/proposals" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Proposals
                  </Link>
                </>
              )}
            </nav>

            {/* Right side actions */}
            <div className="flex items-center space-x-4">
              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </button>

              {/* Auth buttons */}
              {!user ? (
                <div className="hidden md:flex items-center space-x-2">
                  <Link to="/login" className="btn-outline">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-4">
                  <UserAvatar />
                </div>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md hover:bg-accent transition-colors"
                aria-label="Toggle mobile menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 space-y-4">
              <Link to="/marketplace" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Marketplace
              </Link>
              <Link to="/study-groups" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Study Groups
              </Link>
              {user ? (
                <>
                  <div className="border-b border-border pb-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary-foreground">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-foreground">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Link to="/marketplace" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Marketplace
                  </Link>
                  <Link to="/study-groups" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Study Groups
                  </Link>

                  <Link to="/proposals" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Proposals
                  </Link>
                  <Link to="/create-listing" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    List Item
                  </Link>
                  <button
                    onClick={logout}
                    className="block w-full text-left text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Login
                  </Link>
                  <Link to="/register" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; 2024 CampusShare. All rights reserved.</p>
            <p className="mt-2">Connecting students through resource sharing and collaboration.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Layout
