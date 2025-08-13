import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Users, BookOpen, Calendar, MapPin } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const CreateGroup = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    course: '',
    subject: '',
    maxMembers: 10,
    isPrivate: false
  })
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setFormData({
      ...formData,
      [e.target.name]: value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.name || !formData.description || !formData.course || !formData.subject) {
      toast.error('Please fill in all required fields')
      return
    }

    setLoading(true)

    try {
      await api.post('/groups', formData)
      toast.success('Study group created successfully!')
      navigate('/study-groups')
    } catch (error) {
      console.error('Error creating group:', error)
      toast.error('Failed to create study group. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create Study Group</h1>
          <p className="text-muted-foreground">
            Start a new study group and connect with fellow students
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Group Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., CS101 Study Group"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-foreground mb-2">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Describe your study group..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-foreground mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    id="course"
                    name="course"
                    required
                    value={formData.course}
                    onChange={handleChange}
                    className="input-field"
                    placeholder="e.g., CS101"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject *
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    required
                    value={formData.subject}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select subject</option>
                    <option value="computer science">Computer Science</option>
                    <option value="mathematics">Mathematics</option>
                    <option value="physics">Physics</option>
                    <option value="chemistry">Chemistry</option>
                    <option value="biology">Biology</option>
                    <option value="engineering">Engineering</option>
                    <option value="business">Business</option>
                    <option value="arts">Arts & Humanities</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="maxMembers" className="block text-sm font-medium text-foreground mb-2">
                    Maximum Members
                  </label>
                  <input
                    type="number"
                    id="maxMembers"
                    name="maxMembers"
                    min="2"
                    max="50"
                    value={formData.maxMembers}
                    onChange={handleChange}
                    className="input-field"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    name="isPrivate"
                    checked={formData.isPrivate}
                    onChange={handleChange}
                    className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm font-medium text-foreground">
                    Private Group
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/study-groups')}
              className="btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateGroup
