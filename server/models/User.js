// userModel.js
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  createdAt: Date,
  updatedAt: Date,
  lastLogin: Date,
  campaignAssigned: [{ type: String, default: null }],
  currentCampaign: { type: String, default: null },
  tokenVersion: String,
});

const User = mongoose.model('User', userSchema);

export default User;
