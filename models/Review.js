import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  type: { type: String, enum: ['WEEKLY', 'MONTHLY'], required: true },
  weekStart: { type: Date },
  monthYear: { type: String }, // e.g. "2026-09"
  responses: {
    // College
    collegeCompleted: { type: String, default: '' },
    collegeOverdue: { type: String, default: '' },
    collegeNext: { type: String, default: '' },
    // GATE
    gateMastered: { type: String, default: '' },
    gateWeak: { type: String, default: '' },
    gateQuestions: { type: String, default: '' },
    // Forge
    forgeBuilt: { type: String, default: '' },
    forgeLearned: { type: String, default: '' },
    forgeDecision: { type: String, default: '' },
    // People
    peopleFollowUp: { type: String, default: '' },
    peopleWaiting: { type: String, default: '' },
    // Health
    gymConsistency: { type: String, default: '' },
    sleep: { type: String, default: '' },
    // Communication
    voiceRecordings: { type: String, default: '' },
    commImprovement: { type: String, default: '' },
    // Life
    wentWell: { type: String, default: '' },
    failed: { type: String, default: '' },
    shouldChange: { type: String, default: '' },
    // Monthly extras
    accomplished: { type: String, default: '' },
    notAccomplished: { type: String, default: '' },
    mostTimeSpent: { type: String, default: '' },
    mostValue: { type: String, default: '' },
    stopDoing: { type: String, default: '' },
    startDoing: { type: String, default: '' },
    continueDoing: { type: String, default: '' },
    mainGoalNextMonth: { type: String, default: '' },
  },
  nextWeekOutcomes: [{
    title: { type: String },
    priority: { type: String, enum: ['MUST', 'SHOULD', 'IF_TIME'], default: 'SHOULD' },
  }],
  overallRating: { type: Number, min: 1, max: 10 },
}, { timestamps: true });

export default mongoose.models.Review || mongoose.model('Review', ReviewSchema);
