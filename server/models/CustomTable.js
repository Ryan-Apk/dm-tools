// CustomTable model - shared by campaign-specific tables and service-provided
// tables (campaignId: null), which are available across every campaign.
import mongoose from 'mongoose';

const entrySchema = new mongoose.Schema({
  // stable across edits/reordering so wrapped neighbouring results can display
  // their original positions even after entries are inserted/removed elsewhere
  index: { type: Number, required: true },
  rollValue: { type: Number, required: true },
  result: { type: String, required: true },
});

const customTableSchema = new mongoose.Schema({
  name: { type: String, required: true },
  campaignId: { type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null },

  entries: { type: [entrySchema], default: [] },

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true, collection: 'customTables' });

customTableSchema.index({ campaignId: 1 });

// tables usable within a campaign: its own tables plus service-provided ones
customTableSchema.statics.findAvailableForCampaign = function findAvailableForCampaign(campaignId) {
  return this.find({ $or: [{ campaignId }, { campaignId: null }] });
};

customTableSchema.methods.getEntryByRollValue = function getEntryByRollValue(rollValue) {
  return this.entries.find((entry) => entry.rollValue === rollValue) ?? null;
};

// returns the entry matching rollValue plus `range` neighbours on either side,
// wrapping around the ends of the table; each entry keeps its own stable `index`
// so the caller can still show where it originally sat in the table
customTableSchema.methods.getNeighbors = function getNeighbors(rollValue, range = 1) {
  const { entries } = this;
  if (entries.length === 0) return [];

  const centerPos = entries.findIndex((entry) => entry.rollValue === rollValue);
  if (centerPos === -1) return [];

  const neighbors = [];
  for (let offset = -range; offset <= range; offset += 1) {
    const wrappedPos = ((centerPos + offset) % entries.length + entries.length) % entries.length;
    neighbors.push(entries[wrappedPos]);
  }

  return neighbors;
};

const CustomTable = mongoose.model('CustomTable', customTableSchema);
export default CustomTable;
