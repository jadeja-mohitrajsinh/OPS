import mongoose from 'mongoose';

const ForgeResearchSchema = new mongoose.Schema({
  problem: { type: String, required: true },
  question: { type: String, default: '' },
  source: { type: String, default: '' },
  finding: { type: String, default: '' },
  insight: { type: String, default: '' },
  decision: { type: String, default: '' },
  nextAction: { type: String, default: '' },
  area: { type: String, enum: ['Product', 'Research', 'Competitors', 'UX_UI', 'Engineering', 'AI_ML', 'Marketing', 'Business', 'Users', 'Experiments', ''], default: '' },
  status: { type: String, enum: ['RESEARCH', 'INSIGHT', 'DECISION', 'ACTION', 'DONE'], default: 'RESEARCH' },
  tags: [{ type: String }],
}, { timestamps: true });

export default mongoose.models.ForgeResearch || mongoose.model('ForgeResearch', ForgeResearchSchema);
