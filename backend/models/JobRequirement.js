import mongoose from 'mongoose';

const jobRequirementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  department: { type: String, required: true },
  description: { type: String, required: true },
  requirements: [String],
  experienceRequired: { type: String },
  status: { type: String, enum: ['Open', 'Closed'], default: 'Open' },
  deadline: { type: Date }
}, { timestamps: true });

const JobRequirement = mongoose.model('JobRequirement', jobRequirementSchema);
export default JobRequirement;
