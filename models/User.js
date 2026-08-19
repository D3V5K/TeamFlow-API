const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters long']
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true
    },

    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long']
    },

    role: {
      type: String,
      enum: ['ADMIN', 'PROJECT_MANAGER', 'TEAM_LEADER', 'DEVELOPER'],
      default: 'DEVELOPER'
    },

    isBlocked: {
      type: Boolean,
      default: false
    },

    isVerified: {
      type: Boolean,
      default: false
    },

    failedAttempts: {
      type: Number,
      default: 0
    },

    lastLogin: {
      type: Date,
      default: null
    },

    lastLogout: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const User = mongoose.model('User', userSchema);

module.exports = User;