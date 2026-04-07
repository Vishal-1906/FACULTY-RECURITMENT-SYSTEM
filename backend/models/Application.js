import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
  applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'Applicant', required: true },
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'JobRequirement', required: true },
  status: { 
    type: String, 
    enum: ['Applied', 'Shortlisted', 'Interview', 'Selected', 'Rejected'], 
    default: 'Applied' 
  },
  remarks: { type: String },
  rating: { type: Number, min: 1, max: 10, default: null },
  interviewDate: { type: Date },
  interviewTime: { type: String },
  interviewVenue: { type: String },
  interviewRequirements: { type: String }
}, { timestamps: true });

const Application = mongoose.model('Application', applicationSchema);
export default Application;
