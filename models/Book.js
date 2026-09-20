import mongoose from 'mongoose';

const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, default: '' },
  status: { type: String, enum: ['WANT_TO_READ', 'READING', 'COMPLETED', 'ABANDONED'], default: 'WANT_TO_READ' },
  currentPage: { type: Number, default: 0 },
  totalPages: { type: Number, default: 0 },
  notes: [{ type: String }],
  quotes: [{ type: String }],
  ideas: [{ type: String }],
  applications: [{ type: String }],
  thingsLearned: [{ type: String }],
  thingApplied: { type: String, default: '' },
  startDate: { type: Date },
  endDate: { type: Date },
  rating: { type: Number, min: 1, max: 5 },
  area: { type: String, default: '' },
}, { timestamps: true });

export default mongoose.models.Book || mongoose.model('Book', BookSchema);
