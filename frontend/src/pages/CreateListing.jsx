import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, X, BookOpen, Laptop, Cloud, Settings } from 'lucide-react'
import api from '../utils/api'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

const CreateListing = () => {
  const navigate = useNavigate()
  const { user, loading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    price: '',
    priceType: '',
    condition: '',
    location: '',
    tags: ''
  })
  const [images, setImages] = useState([])
  const [loading, setLoading] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      toast.error('Please log in to create a listing')
      navigate('/login')
    }
  }, [user, authLoading, navigate])

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Don't render if not authenticated
  if (!user) {
    return null
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('Maximum 5 images allowed')
      return
    }
    
    const newImages = files.map(file => ({
      file,
      preview: URL.createObjectURL(file)
    }))
    
    setImages([...images, ...newImages])
  }

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index)
    setImages(newImages)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description || !formData.category || 
        !formData.price || !formData.priceType || !formData.condition || !formData.location) {
      toast.error('Please fill in all required fields')
      return
    }

    if (formData.priceType !== 'free' && (!formData.price || formData.price <= 0)) {
      toast.error('Please enter a valid price')
      return
    }

    setLoading(true)

    try {
      let imageUrls = []
      
      // Upload images to S3 if any are selected
      if (images.length > 0) {
        try {
          const formDataImages = new FormData()
          images.forEach(image => {
            formDataImages.append('images', image.file)
          })
          
          const uploadResponse = await api.post('/upload/images', formDataImages, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          })
          
          imageUrls = uploadResponse.data.images
        } catch (error) {
          if (error.response?.status === 503) {
            // S3 not configured, use placeholder images
            console.log('S3 not configured, using placeholder images');
            imageUrls = images.map(() => `https://via.placeholder.com/400x400?text=Item+Image`)
          } else {
            throw error;
          }
        }
      }
      
      const listingData = {
        ...formData,
        price: formData.priceType === 'free' ? 0 : parseFloat(formData.price),
        images: imageUrls,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      }

      await api.post('/listings', listingData)
      toast.success('Listing created successfully!')
      navigate('/marketplace')
    } catch (error) {
      toast.error(`Failed to create listing: ${error.response?.data?.message || error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'textbook':
        return <BookOpen className="w-5 h-5" />
      case 'laptop':
        return <Laptop className="w-5 h-5" />
      case 'cloud-credits':
        return <Cloud className="w-5 h-5" />
      default:
        return <Settings className="w-5 h-5" />
    }
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Listing</h1>
          <p className="text-muted-foreground">
            Share your textbooks, laptops, cloud credits, or other academic resources
          </p>
          

        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Introduction to Computer Science Textbook"
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
                  placeholder="Describe your item in detail..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-foreground mb-2">
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select category</option>
                    <option value="textbook">Textbook</option>
                    <option value="laptop">Laptop</option>
                    <option value="cloud-credits">Cloud Credits</option>
                    <option value="equipment">Equipment</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="condition" className="block text-sm font-medium text-foreground mb-2">
                    Condition *
                  </label>
                  <select
                    id="condition"
                    name="condition"
                    required
                    value={formData.condition}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select condition</option>
                    <option value="new">New</option>
                    <option value="like-new">Like New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Pricing</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="priceType" className="block text-sm font-medium text-foreground mb-2">
                  Price Type *
                </label>
                <select
                  id="priceType"
                  name="priceType"
                  required
                  value={formData.priceType}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Select price type</option>
                  <option value="sale">For Sale</option>
                  <option value="rent">For Rent</option>
                  <option value="free">Free</option>
                </select>
              </div>

              {formData.priceType !== 'free' && (
                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-foreground mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <input
                      type="number"
                      id="price"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleChange}
                      className="input-field pl-8"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Location and Tags */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Location & Details</h2>
            
            <div className="space-y-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-foreground mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  id="location"
                  name="location"
                  required
                  value={formData.location}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., Stanford University, CA"
                />
              </div>

              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-foreground mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="e.g., computer science, programming, algorithms"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Separate tags with commas
                </p>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Images</h2>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <div className="text-sm text-muted-foreground mb-4">
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="font-medium text-primary hover:text-primary/80">
                      Click to upload
                    </span>
                    {' '}or drag and drop
                  </label>
                  <input
                    id="image-upload"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF up to 5 images
                </p>
              </div>

              {/* Image Preview */}
              {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {images.map((image, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={image.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="space-y-3">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/marketplace')}
                className="btn-outline"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Creating...' : 'Create Listing'}
              </button>
            </div>
            

          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateListing
