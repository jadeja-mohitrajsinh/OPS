import mongoose from 'mongoose';

const EvidenceLevelSchema = new mongoose.Schema({
  level: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  evidence: { type: String, default: '' },
  url: { type: String, default: '' },
  dateAchieved: { type: Date },
  lastUpdated: { type: Date, default: Date.now }
});

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

const GSoCSkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['PROGRAMMING', 'ML_FRAMEWORK', 'MATH', 'LIBRARY', 'TOOL', 'DOMAIN'],
    required: true
  },
  evidenceLevel: EvidenceLevelSchema,
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  relatedExperiments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCExperiment' }],
  relatedContributions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' }],
  relatedCommunityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  relatedDatasets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCDataset' }],
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  targetLevel: { type: String, enum: ['WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'], default: 'STRONG' },
  dueDate: { type: Date },
  notes: { type: String, default: '' },
  learningResources: [{ type: String }],
  practiceTasks: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Add text index for efficient search
GSoCSkillSchema.index({ name: 'text', category: 'text' });

export default mongoose.models.GSoCSkill || mongoose.model('GSoCSkill', GSoCSkillSchema);