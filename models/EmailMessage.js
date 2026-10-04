import mongoose from 'mongoose';

const EmailMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  sourceAccountId: { type: mongoose.Schema.Types.ObjectId, ref: 'OAuthConnection', required: true, index: true },
  gmailMessageId: { type: String, required: true },
  gmailThreadId: { type: String, default: '' },
  from: { type: String, default: '' },
  subject: { type: String, default: '' },
  snippet: { type: String, default: '' },
  labelIds: [{ type: String }],
  receivedAt: { type: Date, default: null },
  isImportant: { type: Boolean, default: false },
  isUnread: { type: Boolean, default: false },
  lastSyncedAt: { type: Date, default: null },
}, { timestamps: true });

EmailMessageSchema.index({ userId: 1, sourceAccountId: 1, gmailMessageId: 1 }, { unique: true });
EmailMessageSchema.index({ userId: 1, isImportant: 1, receivedAt: -1 });

export default mongoose.models.EmailMessage || mongoose.model('EmailMessage', EmailMessageSchema);
