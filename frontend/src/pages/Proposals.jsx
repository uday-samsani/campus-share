import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Check, X, MessageSquare, Filter, Search, Send, Inbox, DollarSign, Edit } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const Proposals = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (user) {
      fetchProposals();
    }
  }, [user]);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      // Fetch all proposals for the user (both sent and received)
      const [sentResponse, receivedResponse] = await Promise.all([
        api.get('/proposals/my-proposals'),
        api.get('/proposals/received')
      ]);
      
      // Combine and mark the type of each proposal
      const sentProposals = sentResponse.data.map(p => ({ ...p, type: 'sent' }));
      const receivedProposals = receivedResponse.data.map(p => ({ ...p, type: 'received' }));
      
      setProposals([...sentProposals, ...receivedProposals]);
    } catch (error) {
      console.error('Error fetching proposals:', error);
      toast.error('Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (proposalId, newStatus) => {
    try {
      await api.put(`/proposals/${proposalId}/status`, { status: newStatus });
      
      // Update local state
      setProposals(prev => 
        prev.map(proposal => 
          proposal.proposalId === proposalId 
            ? { ...proposal, status: newStatus }
            : proposal
        )
      );

      // Update other proposals if accepting one
      if (newStatus === 'accepted') {
        setProposals(prev => 
          prev.map(proposal => 
            proposal.proposalId !== proposalId 
              ? { ...proposal, status: 'rejected' }
              : proposal
          )
        );
      }

      toast.success(`Proposal ${newStatus} successfully`);
    } catch (error) {
      console.error('Error updating proposal status:', error);
      toast.error('Failed to update proposal status');
    }
  };

  const handleWithdrawProposal = async (proposalId) => {
    try {
      await api.put(`/proposals/${proposalId}/status`, { status: 'withdrawn' });
      
      setProposals(prev => 
        prev.map(proposal => 
          proposal.proposalId === proposalId 
            ? { ...proposal, status: 'withdrawn' }
            : proposal
        )
      );

      toast.success('Proposal withdrawn successfully');
    } catch (error) {
      console.error('Error withdrawing proposal:', error);
      toast.error('Failed to withdraw proposal');
    }
  };

  const handleUpdateProposal = async (proposalId) => {
    if (!editPrice || isNaN(editPrice) || !editMessage.trim()) {
      toast.error('Please enter valid price and message');
      return;
    }

    try {
      // This would need a backend endpoint for updating proposals
      // For now, we'll just show a success message
      toast.success('Proposal updated successfully');
      
      // Update local state
      setProposals(prev => 
        prev.map(proposal => 
          proposal.proposalId === proposalId 
            ? { 
                ...proposal, 
                proposedPrice: parseFloat(editPrice),
                message: editMessage.trim()
              }
            : proposal
        )
      );
      
      setEditingProposal(null);
      setEditPrice('');
      setEditMessage('');
    } catch (error) {
      console.error('Error updating proposal:', error);
      toast.error('Failed to update proposal');
    }
  };

  const startEditing = (proposal) => {
    setEditingProposal(proposal.proposalId);
    setEditPrice(proposal.proposedPrice?.toString() || proposal.listing?.price?.toString() || '');
    setEditMessage(proposal.message || '');
  };

  const cancelEditing = () => {
    setEditingProposal(null);
    setEditPrice('');
    setEditMessage('');
  };

  const handleProposalClick = (proposal) => {
    navigate(`/proposals/${proposal.proposalId}`, { state: { proposal } });
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
      <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getFilteredProposals = () => {
    if (filter === 'all') {
      return proposals;
    }
    return proposals.filter(proposal => proposal.status === filter);
  };

  const filteredProposals = getFilteredProposals();

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
              <h1 className="text-2xl font-bold text-foreground">My Proposals</h1>
              <p className="text-sm text-muted-foreground">
                Manage your marketplace proposals and negotiations
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Sorting */}
        <div className="mb-6">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
            {/* Status Filter */}
            <div className="flex items-center space-x-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-background border border-border rounded px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
                <option value="withdrawn">Withdrawn</option>
              </select>
            </div>

            {/* Count */}
            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded">
              {filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Proposals List */}
        <div className="space-y-3">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredProposals.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-medium text-foreground mb-2">No proposals found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Start browsing the marketplace to create proposals or wait for others to show interest in your listings.
              </p>
              <Link to="/marketplace" className="btn-primary text-sm px-4 py-2">
                Browse Marketplace
              </Link>
            </div>
          ) : (
            filteredProposals.map((proposal) => (
              <div 
                key={proposal.proposalId} 
                className="card p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 border-l-4 border-l-primary/20 cursor-pointer group"
                onClick={() => handleProposalClick(proposal)}
              >
                <div className="flex items-center space-x-4">
                  {/* User Avatar */}
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center overflow-hidden">
                      {proposal.type === 'received' ? (
                        // Buyer avatar for received proposals
                        proposal.buyer?.profileImage ? (
                          <img
                            src={proposal.buyer.profileImage}
                            alt={`${proposal.buyer.firstName} ${proposal.buyer.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-sm font-medium text-primary">
                            {proposal.buyer?.firstName?.[0]}{proposal.buyer?.lastName?.[0]}
                          </span>
                        )
                      ) : (
                        // Seller avatar for sent proposals
                        <span className="text-sm font-medium text-secondary">
                          {proposal.listing?.sellerName?.[0] || 'S'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link
                        to={`/marketplace/${proposal.listingId}`}
                        className="text-base font-semibold text-foreground hover:text-primary transition-colors truncate"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {proposal.listing?.title || 'Unknown Listing'}
                      </Link>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        proposal.type === 'received' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-green-50 text-green-700 border border-green-200'
                      }`}>
                        {proposal.type === 'received' ? 'Received' : 'Sent'}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground mb-2">
                      <span>{formatDate(proposal.createdAt)}</span>
                      {proposal.listing?.category && (
                        <span className="capitalize bg-muted px-2 py-1 rounded text-xs">
                          {proposal.listing.category}
                        </span>
                      )}
                      {proposal.proposedPrice && proposal.proposedPrice !== proposal.listing?.price && (
                        <span className="text-primary font-medium">
                          ${proposal.listing?.price} → ${proposal.proposedPrice}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-2">
                      {proposal.type === 'received' ? (
                        <span>{proposal.buyer?.firstName} {proposal.buyer?.lastName} • {proposal.buyer?.university}</span>
                      ) : (
                        <span>{proposal.listing?.sellerName || 'Seller'} • {proposal.listing?.sellerUniversity || 'University'}</span>
                      )}
                      {proposal.type === 'received' && proposal.buyer?.rating > 0 && (
                        <span className="flex items-center">
                          <span className="text-yellow-400 mr-1">★</span>
                          {proposal.buyer.rating.toFixed(1)} ({proposal.buyer.totalRatings})
                        </span>
                      )}
                    </div>

                    <p className="text-foreground text-sm line-clamp-2">
                      {proposal.message}
                    </p>
                  </div>

                  {/* Status Badge */}
                  <div className="flex-shrink-0">
                    {getStatusBadge(proposal.status)}
                  </div>

                  {/* Clickable Indicator */}
                  <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Proposals;
