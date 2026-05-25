import mongoose from 'mongoose';

const CodeConfigSchema = new mongoose.Schema({
  slug: { type: String, unique: true, required: true },
  location: { type: String, required: true },
  points: { type: Number, required: true },
  active: { type: Boolean, default: false },
  activated_at: { type: String, default: null },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null },
});

export default mongoose.models.CodeConfig || mongoose.model('CodeConfig', CodeConfigSchema);
