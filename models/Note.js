import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, default: '' },
  area: { type: String, default: '' },
  project: { type: String, default: '' },
  tags: [{ type: String }],
  type: { type: String, enum: ['note', 'idea', 'insight', 'reference'], default: 'note' },
  isPinned: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.models.Note || mongoose.model('Note', NoteSchema);
