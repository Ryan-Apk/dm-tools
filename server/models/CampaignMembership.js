// CampaignMembership model - the source of truth for who is in a campaign and in what role(s).
import mongoose from 'mongoose';
import Campaign from './Campaign.js';

const campaignMembershipSchema = new mongoose.Schema({
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  roles: { type: [String], enum: ['DM', 'PLAYER'], default: ['PLAYER'] },
  campaignDisplayName: { type: String, required: true },

  status: { type: String, enum: ['ACTIVE'], default: 'ACTIVE' },
  joinedAt: { type: Date, default: Date.now },
}, { timestamps: { createdAt: false, updatedAt: 'updatedAt' }, collection: 'campaignMemberships' });

campaignMembershipSchema.index({ campaignId: 1, userId: 1 }, { unique: true });
campaignMembershipSchema.index({ userId: 1 });

// Enforces the two cross-document invariants the spec calls out: a campaign always
// keeps at least one DM, and its owner always keeps the DM role. Runs whenever roles
// change (including on creation) since either invariant can be broken by a role edit.
campaignMembershipSchema.pre('save', async function enforceDmInvariants(next) {
  if (!this.isModified('roles')) return next();
  if (this.roles.includes('DM')) return next();

  try {
    const campaign = await Campaign.findById(this.campaignId).select('ownerId');

    if (campaign && campaign.ownerId.equals(this.userId)) {
      return next(new Error('The campaign owner must retain the DM role.'));
    }

    const remainingDMs = await this.constructor.countDocuments({
      campaignId: this.campaignId,
      status: 'ACTIVE',
      roles: 'DM',
      _id: { $ne: this._id },
    });

    if (remainingDMs === 0) {
      return next(new Error('A campaign must always retain at least one DM.'));
    }

    return next();
  } catch (err) {
    return next(err);
  }
});

campaignMembershipSchema.statics.getDMs = function getDMs(campaignId) {
  return this.find({ campaignId, status: 'ACTIVE', roles: 'DM' });
};

campaignMembershipSchema.statics.getMembers = function getMembers(campaignId) {
  return this.find({ campaignId, status: 'ACTIVE' });
};

campaignMembershipSchema.statics.getCampaignsForUser = function getCampaignsForUser(userId) {
  return this.find({ userId, status: 'ACTIVE' });
};

const CampaignMembership = mongoose.model('CampaignMembership', campaignMembershipSchema);
export default CampaignMembership;
