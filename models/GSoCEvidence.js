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

const GSoCEvidenceSchema = new mongoose.Schema({
  requirement: { type: String, required: true },
  evidence: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  strength: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  url: { type: String, default: '' },
  notes: { type: String, default: '' },
  missingAction: { type: String, default: '' },
  category: { 
    type: String, 
    enum: ['TECHNICAL', 'PROJECT', 'OPEN_SOURCE', 'ORGANIZATION', 'COMMUNITY', 'PROPOSAL'],
    required: true
  },
  relatedSkill: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCSkill' },
  relatedProject: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProject' },
  relatedContribution: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCContribution' },
  relatedOrganization: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCOrganization' },
  relatedProposal: { type: mongoose.Schema.Types.ObjectId, ref: 'GSoCProposal' },
  timelineGates: [TimelineGateSchema],
  currentGate: { type: String, enum: ['L1', 'L2', 'L3', 'L4', 'L5'], default: 'L1' },
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  dateAchieved: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCEvidence || mongoose.model('GSoCEvidence', GSoCEvidenceSchema);