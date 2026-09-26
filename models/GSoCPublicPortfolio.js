import mongoose from 'mongoose';

const TimelineGateSchema = new mongoose.Schema({
  gate: { 
    type: String, 
    enum: ['L1', 'L2', 'L3', 'L4', 'L5'],
    default: 'L1'
  },
  gateName: { type: String, default: '' },
  startDate: { type: Date },
  targetDate: { type: Date },
  completedDate: { type: Date },
  status: { 
    type: String, 
    enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BLOCKED'],
    default: 'NOT_STARTED'
  },
  criteria: [{ type: String }],
  notes: { type: String, default: '' }
});

const GSoCPublicPortfolioSchema = new mongoose.Schema({
  type: { 
    type: String, 
    enum: ['GITHUB_REPOSITORY', 'GITHUB_PR', 'GITHUB_ISSUE', 'KAGGLE_NOTEBOOK', 'KAGGLE_COMPETITION', 'HUGGING_FACE_MODEL', 'HUGGING_FACE_DATASET', 'HUGGING_FACE_SPACE', 'RESEARCH_IMPLEMENTATION', 'TECHNICAL_ARTICLE', 'ML_DEMO', 'TECHNICAL_DOCUMENTATION'],
    required: true
  },
  url: { type: String, required: true },
  title: { type: String, required: true },
  date: { type: Date, default: Date.now },
  relatedSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' },
  quality: { 
    type: String, 
    enum: ['POOR', 'BASIC', 'GOOD', 'EXCELLENT'],
    default: 'BASIC'
  },
  description: { type: String, default: '' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  forks: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCPublicPortfolio || mongoose.model('GSoCPublicPortfolio', GSoCPublicPortfolioSchema);