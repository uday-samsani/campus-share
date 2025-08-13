import { useState } from 'react';
import { X, Send, DollarSign } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../utils/api';
import { toast } from 'react-hot-toast';

const SendProposal = ({ listing, isOpen, onClose, onProposalSent }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    message: '',
    proposedPrice: listing?.price || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to send a proposal');
      return;
    }

    if (formData.message.trim().length < 10) {
      toast.error('Message must be at least 10 characters long');
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post('/proposals', {
        listingId: listing.listingId,
        message: formData.message.trim(),
        proposedPrice: formData.proposedPrice ? parseFloat(formData.proposedPrice) : undefined
      });

      toast.success('Proposal sent successfully!');
      setFormData({ message: '', proposedPrice: listing?.price || '' });
      onProposalSent?.(response.data);
      onClose();
    } catch (error) {
      console.error('Error sending proposal:', error);
      const message = error.response?.data?.message || 'Failed to send proposal';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({ message: '', proposedPrice: listing?.price || '' });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Send Proposal</h2>
            <p className="text-sm text-muted-foreground mt-1">Express your interest in this item</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-accent rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Listing Info */}
          <div className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
            <h3 className="font-semibold text-foreground mb-2">{listing.title}</h3>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="font-medium">Current Price: ${listing.price}</span>
              <span className="capitalize bg-primary/10 text-primary px-2 py-1 rounded-md text-xs font-medium">
                {listing.category}
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Message */}
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                Your Message *
              </label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Tell the seller why you're interested and any questions you have..."
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent resize-none transition-colors"
                rows={4}
                required
                minLength={10}
                maxLength={500}
              />
              <div className="flex justify-between text-xs text-muted-foreground mt-2">
                <span className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${formData.message.length >= 10 ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                  Minimum 10 characters
                </span>
                <span className={`font-medium ${formData.message.length > 450 ? 'text-orange-500' : 'text-muted-foreground'}`}>
                  {formData.message.length}/500
                </span>
              </div>
            </div>

            {/* Proposed Price */}
            <div>
              <label htmlFor="proposedPrice" className="block text-sm font-medium text-foreground mb-2">
                Proposed Price (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="number"
                  id="proposedPrice"
                  value={formData.proposedPrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, proposedPrice: e.target.value }))}
                  placeholder={listing.price}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-3 py-3 border border-border rounded-lg bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full mr-2"></span>
                Leave empty to use the listed price
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || formData.message.trim().length < 10}
              className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Send Proposal</span>
                </>
              )}
            </button>
          </form>

          {/* Tips */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-xl border border-blue-200/50 dark:border-blue-800/30">
            <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-3 flex items-center">
              <span className="mr-2">💡</span>
              Tips for a great proposal
            </h4>
            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-2">
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Be polite and professional in your message
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Mention why you're interested in the item
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Ask relevant questions about the item
              </li>
              <li className="flex items-start">
                <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                Propose a fair price if negotiating
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendProposal;
