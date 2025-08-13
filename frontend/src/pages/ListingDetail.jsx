import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Heart, MapPin, Star, User, MessageSquare, Eye } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../utils/api'
import SendProposal from '../components/SendProposal'
import { toast } from 'react-hot-toast'

const ListingDetail = () => {
  const { id } = useParams()
  const { user } = useAuth()

  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showProposalModal, setShowProposalModal] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  useEffect(() => {
    fetchListing()
  }, [id])

  useEffect(() => {
    if (listing && user) {
      checkFavoriteStatus()
    }
  }, [listing, user])

  const checkFavoriteStatus = async () => {
    try {
      const response = await api.get(`/favorites/check/${listing.listingId}`)
      setIsFavorited(response.data.isFavorited)
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  const toggleFavorite = async () => {
    if (!user) {
      toast.error('Please log in to add favorites')
      return
    }

    try {
      setFavoriteLoading(true)
      
      if (isFavorited) {
        await api.delete(`/favorites/${listing.listingId}`)
        setIsFavorited(false)
        toast.success('Removed from favorites')
      } else {
        await api.post('/favorites', { listingId: listing.listingId })
        setIsFavorited(true)
        toast.success('Added to favorites')
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      toast.error('Failed to update favorites')
    } finally {
      setFavoriteLoading(false)
    }
  }

  const fetchListing = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/listings/${id}`)
      setListing(response.data)
    } catch (error) {
      console.error('Error fetching listing:', error)
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

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Listing not found</h2>
          <Link to="/marketplace" className="btn-primary">
            Back to Marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            to="/marketplace"
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div>
            <div className="aspect-square bg-muted rounded-lg overflow-hidden mb-4">
              {listing.images && listing.images.length > 0 ? (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <div className="text-muted-foreground">No image available</div>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div>
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-bold text-foreground">{listing.title}</h1>
                <button className="p-2 hover:bg-accent rounded-md transition-colors">
                  <Heart className="w-6 h-6 text-muted-foreground" />
                </button>
              </div>
              
              <div className="text-2xl font-bold text-primary mb-4">
                {listing.priceType === 'free' ? 'Free' : `$${listing.price}`}
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                <span className="bg-primary/10 text-primary px-2 py-1 rounded">
                  {listing.category}
                </span>
                <span>{listing.priceType}</span>
                <span>{listing.condition}</span>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <p className="text-foreground">{listing.description}</p>
              
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>{listing.location}</span>
              </div>
            </div>

            {/* Seller Info */}
            <div className="card p-4 mb-6">
              <h3 className="font-semibold text-foreground mb-3">Seller Information</h3>
              {listing.seller ? (
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {listing.seller.firstName?.[0]}{listing.seller.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {listing.seller.firstName} {listing.seller.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {listing.seller.university}
                      {listing.seller.major && ` • ${listing.seller.major}`}
                      {listing.seller.year && ` • Year ${listing.seller.year}`}
                    </div>
                    {/* Only show rating if it exists and is greater than 0 */}
                    {listing.seller.rating && listing.seller.rating > 0 && listing.seller.totalRatings && listing.seller.totalRatings > 0 ? (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span>{listing.seller.rating.toFixed(1)}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span>({listing.seller.totalRatings} ratings)</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                        <span className="text-muted-foreground">No ratings yet</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3 text-muted-foreground">
                  <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                    <span className="text-sm">?</span>
                  </div>
                  <div>
                    <div className="text-sm">Unknown Seller</div>
                    <div className="text-xs">Seller information unavailable</div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              {user && user.userId !== listing.sellerId ? (
                // Buyer actions
                <>
                  <button 
                    onClick={() => setShowProposalModal(true)}
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Proposal</span>
                  </button>
                  <button 
                    onClick={toggleFavorite}
                    disabled={favoriteLoading}
                    className={`btn-outline flex items-center justify-center space-x-2 ${
                      isFavorited ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : ''
                    }`}
                  >
                    {favoriteLoading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <Heart className={`w-4 h-4 ${isFavorited ? 'fill-current' : ''}`} />
                    )}
                    <span>{isFavorited ? 'Favorited' : 'Favorite'}</span>
                  </button>
                </>
              ) : user && user.userId === listing.sellerId ? (
                // Seller actions
                <>
                  <Link 
                    to="/proposals"
                    className="btn-primary flex-1 flex items-center justify-center space-x-2"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Proposals</span>
                  </Link>
                  <Link to={`/edit-listing/${listing.listingId}`} className="btn-outline">
                    <span>Edit Listing</span>
                  </Link>
                </>
              ) : (
                // Not logged in
                <Link to="/login" className="btn-primary flex-1 text-center">
                  <span>Login to Send Proposal</span>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Proposal Modal */}
        <SendProposal
          listing={listing}
          isOpen={showProposalModal}
          onClose={() => setShowProposalModal(false)}
          onProposalSent={() => {
            // Optionally refresh listing data or show success message
          }}
        />
      </div>
    </div>
  )
}

export default ListingDetail
