import mongoose from 'mongoose';

const GoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  timeframe: { type: String, enum: ['90_DAYS', '1_YEAR', '3_YEARS', '10_YEARS'], required: true },
  area: { type: String, default: '' },
  milestones: [{
    title: { type: String },
    dueDate: { type: Date },
    status: { type: String, enum: ['PENDING', 'DONE'], default: 'PENDING' },
    relatedProjects: [{ type: String }],
  }],
  status: { type: String, enum: ['ACTIVE', 'PAUSED', 'ACHIEVED', 'ABANDONED'], default: 'ACTIVE' },
  reviewDate: { type: Date },
  lastReviewed: { type: Date },
}, { timestamps: true });

export default mongoose.models.Goal || mongoose.model('Goal', GoalSchema);
