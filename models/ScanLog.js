import mongoose from 'mongoose';

const ScanLogSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code_slug: { type: String, required: true },
  points_awarded: { type: Number, required: true },
  scanned_at: { type: String },
  distance_metres: { type: Number, default: null },
});

export default mongoose.models.ScanLog || mongoose.model('ScanLog', ScanLogSchema);
