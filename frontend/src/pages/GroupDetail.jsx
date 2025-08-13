import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Calendar, MapPin, MessageCircle, BookOpen } from 'lucide-react'
import api from '../utils/api'

const GroupDetail = () => {
  const { id } = useParams()
  const [group, setGroup] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGroup()
  }, [id])

  const fetchGroup = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/groups/${id}`)
      setGroup(response.data)
    } catch (error) {
      console.error('Error fetching group:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!group) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Group not found</h2>
          <Link to="/study-groups" className="btn-primary">
            Back to Study Groups
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/study-groups"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Group Header */}
        <div className="card p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{group.name}</h1>
              <p className="text-muted-foreground text-lg">{group.description}</p>
            </div>
            <span className={`text-sm font-medium px-3 py-1 rounded ${
              group.status === 'active' 
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                : group.status === 'full'
                ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
            }`}>
              {group.status === 'active' ? 'Active' : 
               group.status === 'full' ? 'Full' : 'Inactive'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Course</div>
                <div className="font-medium">{group.course}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Members</div>
                <div className="font-medium">{group.currentMembers.length}/{group.maxMembers}</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-muted-foreground" />
              <div>
                <div className="text-sm text-muted-foreground">Created</div>
                <div className="font-medium">{new Date(group.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Meeting Schedule */}
        {group.meetingSchedule && group.meetingSchedule.length > 0 && (
          <div className="card p-6 mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Meeting Schedule</h2>
            <div className="space-y-3">
              {group.meetingSchedule.map((meeting, index) => (
                <div key={index} className="flex items-center space-x-4 p-3 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="font-medium capitalize">{meeting.day}</div>
                    <div className="text-sm text-muted-foreground">{meeting.time}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {meeting.isOnline ? 'Online' : meeting.location || 'On Campus'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Members */}
        <div className="card p-6 mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Members</h2>
          <div className="space-y-3">
            {group.currentMembers.map((member, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {member.user.firstName[0]}{member.user.lastName[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">
                      {member.user.firstName} {member.user.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {member.user.university}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    member.role === 'admin' 
                      ? 'bg-primary/10 text-primary' 
                      : 'bg-muted-foreground/10 text-muted-foreground'
                  }`}>
                    {member.role === 'admin' ? 'Admin' : 'Member'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(member.joinedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-4">
          <button className="btn-primary flex-1 flex items-center justify-center space-x-2">
            <MessageCircle className="w-4 h-4" />
            <span>Message Group</span>
          </button>
          <button className="btn-outline">
            <Users className="w-4 h-4" />
            <span>Join Group</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupDetail
