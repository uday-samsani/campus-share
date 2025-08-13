import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Heart, MapPin, Star, User, Trash2, Eye } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Favorites = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await api.get('/favorites');
      setFavorites(response.data);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      toast.error('Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  };

  const removeFavorite = async (listingId) => {
    try {
      await api.delete(`/favorites/${listingId}`);
      setFavorites(prev => prev.filter(fav => fav.listingId !== listingId));
      toast.success('Removed from favorites');
    } catch (error) {
      console.error('Error removing favorite:', error);
      toast.error('Failed to remove from favorites');
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Please log in</h2>
          <Link to="/login" className="btn-primary">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-6">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-3">
            <Link
              to="/marketplace"
              className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
              <p className="text-sm text-muted-foreground">
                Your saved listings and items of interest
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-base font-medium text-foreground mb-2">No favorites yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Start browsing the marketplace and save items you're interested in.
            </p>
            <Link to="/marketplace" className="btn-primary text-sm px-4 py-2">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {favorites.map((listing) => (
              <div key={listing.listingId} className="card p-4 hover:shadow-md transition-all duration-200 group">
                {/* Image */}
                <div className="aspect-square bg-muted rounded-md overflow-hidden mb-3">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/50">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Heart className="w-8 h-8 text-primary/40" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-foreground text-base line-clamp-2 flex-1 mr-2">
                      {listing.title}
                    </h3>
                    <button
                      onClick={() => removeFavorite(listing.listingId)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-md transition-colors flex-shrink-0"
                      title="Remove from favorites"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="text-lg font-bold text-primary">
                    {listing.priceType === 'free' ? 'Free' : `$${listing.price}`}
                  </div>
                  
                  <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                      {listing.category}
                    </span>
                    <span>{listing.condition}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{listing.location}</span>
                  </div>

                  {/* Seller Info - Minimal */}
                  {listing.seller && (
                    <div className="flex items-center space-x-2 pt-2 border-t border-border">
                      <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                        {listing.seller.profileImage ? (
                          <img
                            src={listing.seller.profileImage}
                            alt={`${listing.seller.firstName} ${listing.seller.lastName}`}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs font-medium text-primary">
                            {listing.seller.firstName?.[0]}{listing.seller.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground text-xs">
                          {listing.seller.firstName} {listing.seller.lastName}
                        </div>
                        {listing.seller.rating > 0 && (
                          <div className="text-xs text-muted-foreground flex items-center">
                            <span className="text-yellow-400 mr-1">★</span>
                            {listing.seller.rating.toFixed(1)}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Link
                      to={`/marketplace/${listing.listingId}`}
                      className="btn-primary flex-1 text-center text-sm px-3 py-2 flex items-center justify-center space-x-2"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View Details</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Favorites;
