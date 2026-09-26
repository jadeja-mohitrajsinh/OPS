import mongoose from 'mongoose';

const GSoCEvidenceRequirementSchema = new mongoose.Schema({
  requirementId: { type: String, required: true, unique: true },
  level: { 
    type: String, 
    enum: ['NONE', 'WEAK', 'BASIC', 'GOOD', 'STRONG', 'EXCELLENT'],
    default: 'NONE'
  },
  description: { type: String, default: '' },
  url: { type: String, default: '' },
  notes: { type: String, default: '' },
  missingAction: { type: String, default: '' },
  lastUpdated: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.models.GSoCEvidenceRequirement || mongoose.model('GSoCEvidenceRequirement', GSoCEvidenceRequirementSchema);
