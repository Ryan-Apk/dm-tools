// RollEvent model - account-wide, campaign, die-specific, and table-specific
// histories are all just filtered views over this one collection.
import mongoose from 'mongoose';

const CLEANUP_MIN_AGE_MS = 30 * 24 * 60 * 60 * 1000;
const CLEANUP_MIN_OPENS_SINCE_DELETION = 4;

const changeSchema = new mongoose.Schema({
  previousResult: { type: Number, required: true },
  newResult: { type: Number, required: true },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  changedAt: { type: Date, default: Date.now },
}, { _id: false });

const rollEventSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', required: true },
  characterId: { type: mongoose.Schema.Types.ObjectId, required: true },

  type: { type: String, enum: ['DICE', 'CUSTOM_TABLE'], required: true },
  source: { type: String, enum: ['APP', 'MANUAL'], required: true },

  expression: { type: String, default: null },
  die: { type: String, default: null },
  result: { type: Number, required: true },

  tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'CustomTable', default: null },
  tableEntryId: { type: mongoose.Schema.Types.ObjectId, default: null },

  deletedAt: { type: Date, default: null },
  deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  deletionOpenCount: { type: Number, default: null },

  changes: { type: [changeSchema], default: [] },
}, { timestamps: { createdAt: 'createdAt', updatedAt: false }, collection: 'rollEvents' });

rollEventSchema.index({ userId: 1, createdAt: -1 });
rollEventSchema.index({ campaignId: 1, createdAt: -1 });
rollEventSchema.index({ campaignId: 1, die: 1 });
rollEventSchema.index({ tableId: 1 });
rollEventSchema.index({ deletedAt: 1 });

// soft-deletes the event, stamping the campaign's current openCount so cleanup can
// later tell how many times the campaign has been opened since the deletion
rollEventSchema.methods.softDelete = function softDelete(deletedByUserId, campaignOpenCount) {
  this.deletedAt = new Date();
  this.deletedBy = deletedByUserId;
  this.deletionOpenCount = campaignOpenCount;

  return this.save();
};

// records an edit to the result while preserving the prior value in the audit trail
rollEventSchema.methods.recordChange = function recordChange(newResult, changedByUserId) {
  this.changes.push({
    previousResult: this.result,
    newResult,
    changedBy: changedByUserId,
    changedAt: new Date(),
  });
  this.result = newResult;

  return this.save();
};

rollEventSchema.methods.isEligibleForCleanup = function isEligibleForCleanup(currentCampaignOpenCount, now = new Date()) {
  if (!this.deletedAt) return false;
  if (this.deletionOpenCount === null || this.deletionOpenCount === undefined) return false;

  const ageMs = now.getTime() - this.deletedAt.getTime();
  if (ageMs < CLEANUP_MIN_AGE_MS) return false;

  const opensSinceDeletion = currentCampaignOpenCount - this.deletionOpenCount;
  return opensSinceDeletion >= CLEANUP_MIN_OPENS_SINCE_DELETION;
};

// mirrors isEligibleForCleanup as a query, for a cleanup job to run directly against the DB
rollEventSchema.statics.findEligibleForCleanup = function findEligibleForCleanup(now = new Date()) {
  const cutoff = new Date(now.getTime() - CLEANUP_MIN_AGE_MS);

  return this.aggregate([
    { $match: { deletedAt: { $ne: null, $lte: cutoff } } },
    {
      $lookup: {
        from: 'campaigns',
        localField: 'campaignId',
        foreignField: '_id',
        as: 'campaign',
      },
    },
    { $unwind: '$campaign' },
    {
      $match: {
        $expr: {
          $gte: [
            { $subtract: ['$campaign.openCount', '$deletionOpenCount'] },
            CLEANUP_MIN_OPENS_SINCE_DELETION,
          ],
        },
      },
    },
    { $project: { campaign: 0 } },
  ]);
};

rollEventSchema.statics.findForUser = function findForUser(userId, filter = {}) {
  return this.find({ userId, deletedAt: null, ...filter }).sort({ createdAt: -1 });
};

rollEventSchema.statics.findForCampaign = function findForCampaign(campaignId, filter = {}) {
  return this.find({ campaignId, deletedAt: null, ...filter }).sort({ createdAt: -1 });
};

rollEventSchema.statics.findForDie = function findForDie(campaignId, die, filter = {}) {
  return this.find({
    campaignId, die, deletedAt: null, ...filter,
  }).sort({ createdAt: -1 });
};

rollEventSchema.statics.findForTable = function findForTable(tableId, filter = {}) {
  return this.find({ tableId, deletedAt: null, ...filter }).sort({ createdAt: -1 });
};

const RollEvent = mongoose.model('RollEvent', rollEventSchema);
export default RollEvent;
