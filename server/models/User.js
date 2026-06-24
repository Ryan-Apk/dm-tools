// userModel.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: String,
    email: String,
    password: String,
    createdAt: Date,
    updatedAt: Date,
    lastLogin: Date,
});

const User = mongoose.model("User", userSchema);

export default User;