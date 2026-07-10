// Feedback model - immutable, so there is no updatedAt.
import mongoose from 'mongoose';

const feedbackSchema = new mongoose.Schema({
  category: { type: String, enum: ['CAMPAIGN', 'SERVICE'], required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  message: { type: String, required: true },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false }, collection: 'feedback' });

feedbackSchema.index({ campaignId: 1 });
feedbackSchema.index({ category: 1 });

// CAMPAIGN feedback must be tied to a campaign; SERVICE feedback must not be
feedbackSchema.pre('validate', function enforceCampaignIdMatchesCategory(next) {
  if (this.category === 'CAMPAIGN' && !this.campaignId) {
    return next(new Error('Campaign feedback must include a campaignId.'));
  }

  if (this.category === 'SERVICE' && this.campaignId) {
    return next(new Error('Service feedback must not include a campaignId.'));
  }

  return next();
});

feedbackSchema.statics.submitForCampaign = function submitForCampaign(campaignId, authorId, message) {
  return this.create({
    category: 'CAMPAIGN', campaignId, authorId, message,
  });
};

feedbackSchema.statics.submitForService = function submitForService(authorId, message) {
  return this.create({ category: 'SERVICE', authorId, message });
};

const Feedback = mongoose.model('Feedback', feedbackSchema);
export default Feedback;
