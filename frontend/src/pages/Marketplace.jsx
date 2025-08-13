import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Filter, BookOpen, Laptop, Cloud, Settings, Heart, Plus } from 'lucide-react'
import api from '../utils/api'
import { useAuth } from '../contexts/AuthContext'

const Marketplace = () => {
  const { user } = useAuth()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    category: '',
    priceType: '',
    condition: '',
    search: ''
  })
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchListings()
  }, [filters, currentPage])

  const fetchListings = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 12,
        ...filters
      })
      
      const response = await api.get(`/listings?${params}`)
      setListings(response.data.listings)
      setTotalPages(response.data.totalPages)
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setCurrentPage(1)
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

  const getCategoryLabel = (category) => {
    switch (category) {
      case 'textbook':
        return 'Textbook'
      case 'laptop':
        return 'Laptop'
      case 'cloud-credits':
        return 'Cloud Credits'
      case 'equipment':
        return 'Equipment'
      default:
        return 'Other'
    }
  }

  const getPriceTypeLabel = (priceType) => {
    switch (priceType) {
      case 'sale':
        return 'For Sale'
      case 'rent':
        return 'For Rent'
      case 'free':
        return 'Free'
      default:
        return priceType
    }
  }

  const getConditionLabel = (condition) => {
    switch (condition) {
      case 'new':
        return 'New'
      case 'like-new':
        return 'Like New'
      case 'good':
        return 'Good'
      case 'fair':
        return 'Fair'
      case 'poor':
        return 'Poor'
      default:
        return condition
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

        {/* Header with Create Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Marketplace</h1>
            <p className="text-muted-foreground">Find and share academic resources with fellow students</p>
          </div>
          
          <Link
            to={user ? "/create-listing" : "/login"}
            className="btn-primary inline-flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>{user ? 'List an Item' : 'Sign in to List'}</span>
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="mb-6">
          {/* Compact Search and Filters Row */}
          <div className="flex items-center gap-3 max-w-3xl">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search listings..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 pl-9"
              />
            </div>
            
            {/* Compact Category Filter */}
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 min-w-[110px]"
            >
              <option value="">All Categories</option>
              <option value="textbook">📚 Textbooks</option>
              <option value="laptop">💻 Laptops</option>
              <option value="cloud-credits">☁️ Cloud Credits</option>
              <option value="equipment">🔧 Equipment</option>
              <option value="other">📦 Other</option>
            </select>
            
            {/* Compact Price Type Filter */}
            <select
              value={filters.priceType}
              onChange={(e) => handleFilterChange('priceType', e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 min-w-[100px]"
            >
              <option value="">All Types</option>
              <option value="sale">💰 Sale</option>
              <option value="rent">📅 Rent</option>
              <option value="free">🎁 Free</option>
            </select>
            
            {/* Compact Condition Filter */}
            <select
              value={filters.condition}
              onChange={(e) => handleFilterChange('condition', e.target.value)}
              className="px-3 py-2 text-sm border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 min-w-[90px]"
            >
              <option value="">All Conditions</option>
              <option value="new">✨ New</option>
              <option value="like-new">🌟 Like New</option>
              <option value="good">👍 Good</option>
              <option value="fair">😐 Fair</option>
              <option value="poor">⚠️ Poor</option>
            </select>
          </div>
        </div>

        {/* Listings Grid */}
        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">
              No listings found matching your criteria
            </div>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new items
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
              {listings.map((listing) => (
                <Link
                  key={listing.listingId}
                  to={`/marketplace/${listing.listingId}`}
                  className="group block"
                >
                  <div className="card hover:shadow-lg transition-all duration-300 group-hover:shadow-xl overflow-hidden">
                    <div className="aspect-square bg-muted overflow-hidden">
                      {listing.images && listing.images.length > 0 ? (
                        <img
                          src={listing.images[0]}
                          alt={listing.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                            {getCategoryIcon(listing.category)}
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                          {getCategoryLabel(listing.category)}
                        </span>
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                          {getPriceTypeLabel(listing.priceType)}
                        </span>
                      </div>
                      
                      <h3 className="font-semibold text-foreground mb-2 line-clamp-2 text-sm leading-tight group-hover:text-primary transition-colors">
                        {listing.title}
                      </h3>
                      
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-primary">
                          {listing.priceType === 'free' ? 'Free' : `$${listing.price}`}
                        </span>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-muted text-muted-foreground">
                          {getConditionLabel(listing.condition)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                        <span className="flex items-center">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mr-1.5"></span>
                          {listing.location}
                        </span>
                        <span className="flex items-center">
                          <span className="w-1 h-1 bg-muted-foreground rounded-full mr-1.5"></span>
                          {listing.views} views
                        </span>
                      </div>
                      
                      <div className="flex items-center pt-3 border-t border-border">
                        {listing.seller ? (
                          <>
                            <div className="flex items-center space-x-2">
                              <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-xs font-medium text-primary">
                                  {listing.seller.firstName?.[0]}{listing.seller.lastName?.[0]}
                                </span>
                              </div>
                              <div>
                                <div className="text-xs font-medium text-foreground">
                                  {listing.seller.firstName} {listing.seller.lastName}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {listing.seller.university}
                                  {listing.seller.major && ` • ${listing.seller.major}`}
                                </div>
                              </div>
                            </div>
                            {/* Only show rating if it exists and is greater than 0 */}
                            {listing.seller.rating && listing.seller.rating > 0 ? (
                              <div className="flex items-center space-x-1 ml-auto">
                                <span className="text-sm font-medium text-foreground">
                                  {listing.seller.rating.toFixed(1)}
                                </span>
                                <span className="text-yellow-400">★</span>
                              </div>
                            ) : (
                              <div className="flex items-center space-x-1 ml-auto">
                                <span className="text-xs text-muted-foreground">No ratings</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="flex items-center space-x-3 text-muted-foreground">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <span className="text-sm">?</span>
                            </div>
                            <div>
                              <div className="text-sm">Unknown Seller</div>
                              <div className="text-xs">Seller information unavailable</div>
                            </div>
                          </div>
                        )}
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

export default Marketplace
