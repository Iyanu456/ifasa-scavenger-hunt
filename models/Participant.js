import mongoose from 'mongoose';

const ParticipantSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  department: { type: String, required: true },
  level: { type: String, required: true },
  total_points: { type: Number, default: 0 },
  codes_scanned: { type: [String], default: [] },
  registered_at: { type: String },
  disqualified: { type: Boolean, default: false },
  disqualified_at: { type: String, default: null },
  disqualified_by: { type: String, default: null },
});

export default mongoose.models.Participant || mongoose.model('Participant', ParticipantSchema);
