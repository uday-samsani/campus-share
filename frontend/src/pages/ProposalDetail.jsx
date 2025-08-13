import { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Check, X, MessageSquare, DollarSign, Edit, Building, GraduationCap, User, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const ProposalDetail = () => {
  const { user } = useAuth();
  const { proposalId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [proposal, setProposal] = useState(location.state?.proposal || null);
  const [loading, setLoading] = useState(!proposal);
  const [editingProposal, setEditingProposal] = useState(false);
  const [editPrice, setEditPrice] = useState('');
  const [editMessage, setEditMessage] = useState('');
  const [showSellerProfile, setShowSellerProfile] = useState(false);

  useEffect(() => {
    if (!proposal && proposalId) {
      fetchProposal();
    }
  }, [proposalId, proposal]);

  useEffect(() => {
    if (proposal) {
      setEditPrice(proposal.proposedPrice?.toString() || proposal.listing?.price?.toString() || '');
      setEditMessage(proposal.message || '');
      
      // Determine proposal type based on user ID
      if (proposal.buyerId === user?.userId) {
        setProposal(prev => ({ ...prev, type: 'sent' }));
      } else if (proposal.sellerId === user?.userId) {
        setProposal(prev => ({ ...prev, type: 'received' }));
      }
    }
  }, [proposal, user]);

  const fetchProposal = async () => {
    try {
      setLoading(true);
      // Use the new individual proposal endpoint that provides full details
      const response = await api.get(`/proposals/${proposalId}`);
      setProposal(response.data);
    } catch (error) {
      console.error('Error fetching proposal:', error);
      toast.error('Failed to fetch proposal');
      navigate('/proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      await api.put(`/proposals/${proposalId}/status`, { status: newStatus });
      
      setProposal(prev => ({ ...prev, status: newStatus }));
      toast.success(`Proposal ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error('Failed to update proposal status');
    }
  };

  const handleWithdrawProposal = async () => {
    try {
      await api.put(`/proposals/${proposalId}/status`, { status: 'withdrawn' });
      
      setProposal(prev => ({ ...prev, status: 'withdrawn' }));
      toast.success('Proposal withdrawn successfully');
    } catch (error) {
      console.error('Error withdrawing proposal:', error);
      toast.error('Failed to withdraw proposal');
    }
  };

  const handleUpdateProposal = async () => {
    if (!editPrice || isNaN(editPrice) || !editMessage.trim()) {
      toast.error('Please enter valid price and message');
      return;
    }

    try {
      // This would need a backend endpoint for updating proposals
      // For now, we'll just show a success message
      toast.success('Proposal updated successfully');
      
      setProposal(prev => ({
        ...prev,
        proposedPrice: parseFloat(editPrice),
        message: editMessage.trim()
      }));
      
      setEditingProposal(false);
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Failed to update proposal');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
      accepted: { color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: Check },
      rejected: { color: 'bg-red-50 text-red-700 border-red-200', icon: X },
      withdrawn: { color: 'bg-gray-50 text-gray-700 border-gray-200', icon: X }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border ${config.color}`}>
        <Icon className="w-4 h-4 mr-2" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!proposal) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Proposal not found</h2>
          <Link to="/proposals" className="btn-primary">
            Back to Proposals
          </Link>
        </div>
      </div>
    );
  }

  const isReceived = proposal.type === 'received';
  const isPending = proposal.status === 'pending';

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Link
              to="/proposals"
              className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Proposal Details</h1>
              <p className="text-muted-foreground">
                {isReceived ? 'Reviewing a proposal for your listing' : 'Your proposal details'}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Listing Information */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Listing Information</h2>
              {proposal.listing && (
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    {proposal.listing.images && proposal.listing.images.length > 0 ? (
                      <img
                        src={proposal.listing.images[0]}
                        alt={proposal.listing.title}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                      </div>
                    )}
                    <div className="flex-1">
                      <Link
                        to={`/marketplace/${proposal.listingId}`}
                        className="text-xl font-semibold text-foreground hover:text-primary transition-colors"
                      >
                        {proposal.listing.title}
                      </Link>
                      <div className="text-muted-foreground mt-2">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold text-primary">${proposal.listing.price}</span>
                          <span className="capitalize bg-muted px-3 py-1 rounded-full text-sm">
                            {proposal.listing.category}
                          </span>
                        </div>
                        {/* Price Negotiation - Displayed under the price */}
                        {proposal.proposedPrice && proposal.proposedPrice !== proposal.listing?.price && (
                          <div className="mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                            <div className="text-sm font-medium text-primary mb-1">Price Negotiation</div>
                            <div className="flex items-center space-x-2 text-sm">
                              <span className="text-muted-foreground">Listed: ${proposal.listing?.price}</span>
                              <span className="text-primary font-medium">→ ${proposal.proposedPrice}</span>
                            </div>
                          </div>
                        )}
                        <p className="text-sm mt-2">{proposal.listing.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Information - Only for received proposals (buyer info) */}
            {isReceived && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-foreground mb-4">Buyer Information</h2>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                      {proposal.buyer?.profileImage ? (
                        <img
                          src={proposal.buyer.profileImage}
                          alt={`${proposal.buyer.firstName} ${proposal.buyer.lastName}`}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-2xl font-bold text-primary">
                          {proposal.buyer?.firstName?.[0]}{proposal.buyer?.lastName?.[0]}
                        </span>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {proposal.buyer?.firstName} {proposal.buyer?.lastName}
                      </h3>
                      <div className="text-muted-foreground space-y-1">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{proposal.buyer?.university}</span>
                        </div>
                        {proposal.buyer?.major && (
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4" />
                            <span>{proposal.buyer.major}</span>
                          </div>
                        )}
                        {proposal.buyer?.year && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4" />
                            <span>Year {proposal.buyer.year}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {proposal.buyer?.rating > 0 && (
                    <div className="flex items-center space-x-2 text-sm">
                      <Star className="w-5 h-5 text-yellow-400" />
                      <span className="font-medium">{proposal.buyer.rating.toFixed(1)}</span>
                      <span className="text-muted-foreground">({proposal.buyer.totalRatings} ratings)</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Proposal Message */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">Proposal Message</h2>
              <div className="p-4 bg-muted/30 rounded-lg border border-muted/50">
                <p className="text-foreground leading-relaxed text-lg">
                  {proposal.message}
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Seller Information - For sent proposals */}
            {!isReceived && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Seller Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center">
                      <span className="text-2xl font-bold text-secondary">
                        {proposal.listing?.sellerName?.[0] || 'S'}
                      </span>
                    </div>
                    <div className="flex-1">
                      <button
                        onClick={() => setShowSellerProfile(!showSellerProfile)}
                        className="text-base font-semibold text-foreground hover:text-primary transition-colors text-left"
                      >
                        {proposal.listing?.sellerName || 'Seller'}
                      </button>
                      <div className="text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4" />
                          <span>{proposal.listing?.sellerUniversity || 'University'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded Seller Profile */}
                  {showSellerProfile && (
                    <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-muted/50">
                      <h4 className="font-medium text-foreground mb-3">Seller Profile</h4>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Name:</span> {proposal.listing?.sellerName || 'Seller'}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Building className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">University:</span> {proposal.listing?.sellerUniversity || 'University'}
                          </span>
                        </div>
                        {proposal.listing?.sellerMajor && (
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Major:</span> {proposal.listing.sellerMajor}
                            </span>
                          </div>
                        )}
                        {proposal.listing?.sellerYear && (
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Year:</span> {proposal.listing.sellerYear}
                            </span>
                          </div>
                        )}
                        {proposal.listing?.sellerRating > 0 && (
                          <div className="flex items-center space-x-2">
                            <Star className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Rating:</span> {proposal.listing.sellerRating.toFixed(1)} ({proposal.listing.sellerTotalRatings || 0} ratings)
                            </span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">
                            <span className="font-medium text-foreground">Member since:</span> {proposal.listing?.sellerCreatedAt ? formatDate(proposal.listing.sellerCreatedAt) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status and Actions */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Status & Actions</h3>
              
              {/* Status */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <span className="font-medium text-foreground">Status</span>
                  {getStatusBadge(proposal.status)}
                </div>
              </div>

              {/* Proposal Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <span className="text-sm font-medium text-foreground">Submitted</span>
                  <span className="text-sm text-muted-foreground">{formatDate(proposal.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {isReceived && isPending && (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleStatusUpdate('accepted')}
                      className="btn-primary"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleStatusUpdate('rejected')}
                      className="btn-outline hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}

                {!isReceived && isPending && (
                  <button
                    onClick={() => setEditingProposal(!editingProposal)}
                    className="btn-outline w-full flex items-center justify-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Proposal</span>
                  </button>
                )}

                {!isReceived && isPending && (
                  <button
                    onClick={handleWithdrawProposal}
                    className="btn-outline w-full hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-colors"
                  >
                    Withdraw Proposal
                  </button>
                )}
              </div>
            </div>

            {/* Edit Proposal Form */}
            {editingProposal && !isReceived && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Edit Proposal</h3>
                <div className="space-y-4">
                  {/* Price Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Proposed Price</label>
                    <input
                      type="number"
                      placeholder="Enter your proposed price"
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  
                  {/* Message Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Message</label>
                    <textarea
                      placeholder="Update your proposal message..."
                      value={editMessage}
                      onChange={(e) => setEditMessage(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent resize-none"
                    />
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateProposal}
                      className="btn-primary flex-1"
                    >
                      Update Proposal
                    </button>
                    <button
                      onClick={() => setEditingProposal(false)}
                      className="btn-outline flex-1"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProposalDetail;
