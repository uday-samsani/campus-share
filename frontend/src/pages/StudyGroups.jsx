import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Users, Calendar, MapPin, Plus, BookOpen } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const StudyGroups = () => {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    subject: '',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchGroups()
  }, [filters, currentPage])

  const fetchGroups = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...filters
      })
      
      const response = await api.get(`/groups?${params}`)
      setGroups(response.data.groups)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching groups:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
  }

  const getSubjectIcon = (subject) => {
    switch (subject.toLowerCase()) {
      case 'computer science':
      case 'cs':
        return <BookOpen className="w-5 h-5" />
      case 'mathematics':
      case 'math':
        return <BookOpen className="w-5 h-5" />
      case 'physics':
        return <BookOpen className="w-5 h-5" />
      case 'chemistry':
        return <BookOpen className="w-5 h-5" />
      default:
        return <BookOpen className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Study Groups</h1>
            <p className="text-muted-foreground">Join or create study groups to collaborate with peers</p>
          </div>
          
          <Link
            to={user ? "/create-group" : "/login"}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{user ? 'Create Group' : 'Sign in to Create'}</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          {/* Compact Search and Filters Row */}
          <div className="flex items-center gap-3 max-w-2xl">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search study groups..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 pl-9"
              />
            </div>
            
            {/* Compact Subject Filter */}
            <select
              value={filters.subject}
              onChange={(e) => handleFilterChange('subject', e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 min-w-[130px]"
            >
              <option value="">All Subjects</option>
              <option value="computer science">💻 Computer Science</option>
              <option value="mathematics">📐 Mathematics</option>
              <option value="physics">⚛️ Physics</option>
              <option value="chemistry">🧪 Chemistry</option>
              <option value="biology">🧬 Biology</option>
              <option value="engineering">⚙️ Engineering</option>
              <option value="business">💼 Business</option>
              <option value="arts">🎨 Arts & Humanities</option>
            </select>
          </div>
        </div>

        {/* Groups Grid */}
        {groups.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              No study groups found matching your criteria
            </div>
            <p className="text-muted-foreground mb-6">
              Try adjusting your filters or create a new study group
            </p>
            <Link to="/create-group" className="btn-primary">
              Create Your First Group
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {groups.map((group) => (
                <Link
                  key={group.groupId}
                  to={`/study-groups/${group.groupId}`}
                  className="group block"
                >
                  <div className="card hover:shadow-lg transition-all duration-300 group-hover:shadow-xl overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-5">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary/10 to-primary/20 rounded-xl flex items-center justify-center">
                          {getSubjectIcon(group.subject)}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          group.status === 'active' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border border-green-200'
                            : group.status === 'full'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border border-yellow-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200 border border-gray-200'
                        }`}>
                          {group.status === 'active' ? '🟢 Active' : 
                           group.status === 'full' ? '🟡 Full' : '⚫ Inactive'}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-3 line-clamp-2 text-lg leading-tight group-hover:text-primary transition-colors">
                        {group.name}
                      </h3>
                      
                      <p className="text-muted-foreground text-sm mb-5 line-clamp-2 leading-relaxed">
                        {group.description}
                      </p>
                      
                      <div className="space-y-3 mb-5">
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <BookOpen className="w-4 h-4 text-primary" />
                          <span className="font-medium">{group.course}</span>
                        </div>
                        
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <Users className="w-4 h-4 text-primary" />
                          <span>{group.currentMembers.length}/{group.maxMembers} members</span>
                        </div>
                        
                        {group.meetingSchedule && group.meetingSchedule.length > 0 && (
                          <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                            <Calendar className="w-4 h-4 text-primary" />
                            <span>
                              {group.meetingSchedule[0].day} {group.meetingSchedule[0].time}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span>
                            {group.meetingSchedule && group.meetingSchedule.length > 0 && group.meetingSchedule[0].isOnline
                              ? '🌐 Online'
                              : '🏫 On Campus'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center pt-4 border-t border-border">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {group.creator.firstName[0]}{group.creator.lastName[0]}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-foreground">
                              {group.creator.firstName} {group.creator.lastName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {group.creator.university}
                            </div>
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {new Date(group.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="btn-outline px-3 py-2 disabled:opacity-50"
                >
                  Previous
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-2 rounded-md ${
                      currentPage === page
                        ? 'bg-primary text-primary-foreground'
                        : 'btn-outline'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="btn-outline px-3 py-2 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default StudyGroups
