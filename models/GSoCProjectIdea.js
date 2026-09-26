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

const GSoCProjectIdeaSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problem: { type: String, required: true },
  existingSystem: { type: String, default: '' },
  proposedSolution: { type: String, default: '' },
  technicalApproach: { type: String, default: '' },
  expectedDeliverables: [{ type: String }],
  timeline: { type: String, default: '' },
  risks: [{ type: String }],
  dependencies: [{ type: String }],
  difficulty: { type: String, enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'], default: 'INTERMEDIATE' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization', required: true },
  repository: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCRepository' },
  status: { 
    type: String, 
    enum: ['IDEA', 'RESEARCHING', 'DISCUSSING', 'VALIDATED', 'PROPOSAL_CANDIDATE', 'SELECTED_PROPOSAL', 'REJECTED'],
    default: 'IDEA'
  },
  relatedSkills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' }],
  relatedProjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' }],
  communityInteractions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'GSoCCommunityInteraction' }],
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  evidenceLevel: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  notes: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCProjectIdea || mongoose.model('GSoCProjectIdea', GSoCProjectIdeaSchema);