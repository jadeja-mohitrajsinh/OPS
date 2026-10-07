import mongoose from 'mongoose';

const EncryptedTokenSchema = new mongoose.Schema({
  ciphertext: { type: String, required: true, select: false },
  iv: { type: String, required: true, select: false },
  tag: { type: String, required: true, select: false },
}, { _id: false });

const OAuthConnectionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  provider: { type: String, enum: ['google'], required: true, default: 'google' },
  connectionType: { type: String, enum: ['connected_gmail'], required: true },
  googleSubject: { type: String, required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  scopes: [{ type: String, required: true }],
  encryptedTokens: { type: EncryptedTokenSchema, required: true, select: false },
  status: { type: String, enum: ['active', 'needs_reauth', 'paused', 'revoked', 'removed'], default: 'active', index: true },
  lastSuccessfulSyncAt: { type: Date, default: null },
  syncCursor: { type: String, default: '', select: false },
  watchExpiresAt: { type: Date, default: null },
}, { timestamps: true });

OAuthConnectionSchema.index({ userId: 1, googleSubject: 1, connectionType: 1 }, { unique: true });

export default mongoose.models.OAuthConnection || mongoose.model('OAuthConnection', OAuthConnectionSchema);
