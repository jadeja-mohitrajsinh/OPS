import mongoose from 'mongoose';

const CalendarPlanItemSchema = new mongoose.Schema({
  id: { type: String, required: true },
  timelineItemId: { type: String, default: '' },
  title: { type: String, required: true },
  type: { type: String, default: 'task' },
  hours: { type: Number, default: 1 },
  completed: { type: Boolean, default: false },
  completedAt: { type: Date },
  time: { type: String, default: '' },
  duration: { type: Number, default: 60 },
}, { _id: false });

const CalendarPlanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  items: { type: [CalendarPlanItemSchema], default: [] },
}, { timestamps: true });

CalendarPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.models.CalendarPlan || mongoose.model('CalendarPlan', CalendarPlanSchema);
