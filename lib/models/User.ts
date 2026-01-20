import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    coins: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    streak: {
      type: Number,
      default: 0,
    },
    completedTasks: {
      type: Number,
      default: 0,
    },
    avatar: {
      type: String,
      default: "Users",
    },
    lastTaskCompletionDate: {
      type: Date,
      default: null,
    },
    totalEarned: {
      type: Number,
      default: 0,
    },
    bestStreak: {
      type: Number,
      default: 0,
    },
    rankThisWeek: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate level based on total coins earned
userSchema.virtual("calculatedLevel").get(function () {
  return Math.floor(this.totalEarned / 500) + 1;
});

// Pre-save middleware to update level
userSchema.pre("save", function () {
  this.level = Math.floor(this.totalEarned / 500) + 1;
  if (this.streak > this.bestStreak) {
    this.bestStreak = this.streak;
  }
});

export const User = mongoose.models.User || mongoose.model("User", userSchema);
