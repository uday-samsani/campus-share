import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { User, Building, GraduationCap, Mail, Star, Edit, Save, X, Camera, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../utils/api'
import axios from 'axios'; // Added axios import

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    major: '',
    year: ''
  })
  const [loading, setLoading] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        major: user.major || '',
        year: user.year || ''
      })
    }
  }, [user])

  // Debug: Log user state changes
  useEffect(() => {
    console.log('User state changed in Profile component:', user);
    console.log('Profile image URL:', user?.profileImage);
  }, [user])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const result = await updateProfile(formData)
      if (result.success) {
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        major: user.major || '',
        year: user.year || ''
      })
    }
    setIsEditing(false)
  }

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Selected file:', file);
    console.log('File type:', file.type);
    console.log('File size:', file.size);
    console.log('Current user profileImage:', user.profileImage);

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('image', file);
      
      console.log('FormData created:', formData);
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      
      // Create a custom axios instance for file uploads (without JSON headers)
      const uploadApi = axios.create({
        baseURL: '/api',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          // Don't set Content-Type for FormData - let browser set it with boundary
        }
      });
      
      console.log('Sending request to /upload/profile-image');
      const response = await uploadApi.post('/upload/profile-image', formData);
      
      console.log('Upload response:', response.data);
      
      if (response.data.url) {
        console.log('Image uploaded successfully, updating profile with URL:', response.data.url);
        
        // Update profile with new image URL
        const result = await updateProfile({ profileImage: response.data.url });
        console.log('Profile update result:', result);
        
        if (result.success) {
          toast.success('Profile image updated successfully!');
          // Force a re-render by updating local state
          console.log('Profile updated successfully, new user state:', user);
          
          // Add a small delay to ensure the context has updated
          setTimeout(() => {
            console.log('User state after update:', user);
          }, 100);
        }
      } else {
        toast.error('Failed to get image URL from upload');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      console.error('Error response:', error.response?.data);
      if (error.response?.status === 503) {
        toast.error('Image upload service is not configured. Please contact support.');
      } else if (error.response?.status === 400) {
        toast.error('Invalid image file. Please try again.');
      } else {
        toast.error('Failed to upload image');
      }
    } finally {
      setUploadingImage(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account information and preferences
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="card p-6">
              <div className="text-center mb-6">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                    {user.profileImage ? (
                      <>
                        <img
                          src={user.profileImage}
                          alt={`${user.firstName} ${user.lastName}`}
                          className="w-full h-full object-cover"
                          onLoad={() => console.log('Profile image loaded successfully:', user.profileImage)}
                          onError={(e) => console.error('Profile image failed to load:', user.profileImage, e)}
                        />
                        {console.log('Rendering profile image:', user.profileImage)}
                      </>
                    ) : (
                      <>
                        <span className="text-3xl font-bold text-primary">
                          {user.firstName[0]}{user.lastName[0]}
                        </span>
                        {console.log('No profile image, showing initials')}
                      </>
                    )}
                  </div>
                  
                  {/* Image Upload Button */}
                  <label className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploadingImage}
                    />
                    {uploadingImage ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Camera className="w-4 h-4 text-white" />
                    )}
                  </label>
                </div>
                <h2 className="text-xl font-semibold text-foreground">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-muted-foreground">{user.email}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{user.university}</span>
                </div>
                
                {user.major && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{user.major}</span>
                  </div>
                )}
                
                {user.year && (
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Year {user.year}</span>
                  </div>
                )}

                {/* Only show rating if it exists */}
                {user.rating && user.totalRatings && (
                  <div className="flex items-center space-x-3">
                    <Star className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm text-muted-foreground">
                      {user.rating.toFixed(1)} ({user.totalRatings} ratings)
                    </span>
                  </div>
                )}
              </div>

              {/* Only show member since if createdAt exists */}
              {user.createdAt && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-sm text-muted-foreground">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Profile Details */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-foreground">Profile Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-outline flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="btn-primary flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{loading ? 'Saving...' : 'Save'}</span>
                    </button>
                    <button
                      onClick={handleCancel}
                      className="btn-outline flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        {user.firstName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        className="input-field"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        {user.lastName}
                      </div>
                    )}
                  </div>
                </div>

                {/* Major and Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Major
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="major"
                        value={formData.major}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="e.g., Computer Science"
                      />
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        {user.major || 'Not specified'}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Year
                    </label>
                    {isEditing ? (
                      <select
                        name="year"
                        value={formData.year}
                        onChange={handleChange}
                        className="input-field"
                      >
                        <option value="">Select year</option>
                        {[1, 2, 3, 4, 5, 6].map(year => (
                          <option key={year} value={year}>{year}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="p-3 bg-muted rounded-md">
                        {user.year ? `Year ${user.year}` : 'Not specified'}
                      </div>
                    )}
                  </div>
                </div>

                {/* Read-only Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      Email
                    </label>
                    <div className="p-3 bg-muted rounded-md flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span>{user.email}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      University
                    </label>
                    <div className="p-3 bg-muted rounded-md flex items-center space-x-2">
                      <Building className="w-4 h-4 text-muted-foreground" />
                      <span>{user.university}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Stats */}
            <div className="card p-6 mt-6">
              <h3 className="text-xl font-semibold text-foreground mb-4">Account Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Active Listings</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Study Groups</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{user.totalRatings}</div>
                  <div className="text-sm text-muted-foreground">Ratings</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
