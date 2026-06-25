// Effects table model for random effects tables to be the same structure
import mongoose from "mongoose";

// id disabled to save some space
const entrySchema = new mongoose.Schema({
    result: { type: String, required: true },
    hitCount: { type: Number, default: 0 }
}, { _id: false });

const effectsTableSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, default: "" },

    numEntries: { type: Number, required: false, default: 0 },
    numRolls: { type: Number, required: false, default: 0 },
    lastRolledAt: { type: Date, default: null, index: true },

    // campaign is assigned here just incase we have 2 items that are only supposed to be used in 1 campaign each
    // made an array to ensure it can be duplicated across multiple campaigns
    campaignIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Campaign', default: null }],

    entries: { type: [entrySchema], default: [] }

}, { timestamps: true }); // timestamps here adds 2 fields to tell us when something was created

const EffectsTable = mongoose.model("EffectsTable", effectsTableSchema);
export default EffectsTable;