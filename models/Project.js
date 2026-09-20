import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  dueDate: { type: Date },
  status: { type: String, enum: ['PENDING', 'DONE'], default: 'PENDING' },
});

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  objective: { type: String, default: '' },
  area: { type: String, enum: ['Academic', 'Entrepreneur', 'Personal', 'GATE', 'College', 'Forge', 'Learning', ''], default: '' },
  owner: { type: String, default: 'Me' },
  deadline: { type: Date },
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  milestones: [MilestoneSchema],
  people: [{ type: String }],
  decisions: [{ type: String }],
  risks: [{ type: String }],
  status: { type: String, enum: ['BACKLOG', 'PLANNED', 'ACTIVE', 'BLOCKED', 'REVIEW', 'DONE'], default: 'PLANNED' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
