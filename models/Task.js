import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  name: { type: String, required: true },
  project: { type: String, default: '' },
  area: { type: String, enum: ['Academic', 'Entrepreneur', 'Personal', 'GATE', 'College', 'Forge', 'Learning', 'Health', 'Communication', ''], default: '' },
  priority: { type: String, enum: ['P0', 'P1', 'P2', 'P3'], default: 'P1' },
  deadline: { type: Date },
  estimatedDuration: { type: Number, default: 30 }, // minutes
  energyLevel: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH'], default: 'MEDIUM' },
  status: { type: String, enum: ['TODO', 'IN_PROGRESS', 'BLOCKED', 'DONE', 'CANCELLED'], default: 'TODO' },
  owner: { type: String, default: 'Me' },
  dependencies: [{ type: String }],
  recurrence: { type: String, enum: ['none', 'daily', 'weekly', 'monthly', 'custom'], default: 'none' },
  recurrenceCustom: { type: String, default: '' },
  tags: [{ type: String }],
  notes: { type: String, default: '' },
  blockedReason: { type: String, default: '' },
  blockedBy: { type: String, default: '' },
  followUpDate: { type: Date },
  completedAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
