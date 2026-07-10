// Campaign model - DMs are derived from campaignMemberships rather than duplicated here.
import mongoose from 'mongoose';

// default grace period during which roll events can still be edited/undone after a session closes
const EDITING_GRACE_PERIOD_MS = 24 * 60 * 60 * 1000;

const campaignSchema = new mongoose.Schema({
  name: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  liveStatus: { type: String, enum: ['OPEN', 'CLOSED'], default: 'CLOSED' },
  openedAt: { type: Date, default: null },
  editingClosesAt: { type: Date, default: null },

  // supports deleted-roll retention without storing complete session history
  openCount: { type: Number, default: 0 },

  excalidrawUrl: { type: String, default: null },
}, { timestamps: true, collection: 'campaigns' });

campaignSchema.index({ ownerId: 1 });

// opens the campaign for a new live session
campaignSchema.methods.open = function open() {
  this.liveStatus = 'OPEN';
  this.openedAt = new Date();
  this.editingClosesAt = null;
  this.openCount += 1;

  return this.save();
};

// closes the campaign, starting the grace period during which roll events remain editable
campaignSchema.methods.close = function close(gracePeriodMs = EDITING_GRACE_PERIOD_MS) {
  this.liveStatus = 'CLOSED';
  this.editingClosesAt = new Date(Date.now() + gracePeriodMs);

  return this.save();
};

campaignSchema.methods.isEditable = function isEditable(now = new Date()) {
  if (this.liveStatus === 'OPEN') return true;
  return Boolean(this.editingClosesAt && now < this.editingClosesAt);
};

campaignSchema.statics.findOwnedBy = function findOwnedBy(ownerId) {
  return this.find({ ownerId });
};

const Campaign = mongoose.model('Campaign', campaignSchema);
export default Campaign;
