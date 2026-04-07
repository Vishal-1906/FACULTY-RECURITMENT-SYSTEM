import mongoose from 'mongoose';

const applicantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  phone: { type: String },
  address: { type: String },
  education: [{
    degree: String,
    institution: String,
    year: String,
    cgpa: Number
  }],
  experience: [{
    title: String,
    organization: String,
    duration: String,
    description: String
  }],
  research: [{
    title: String,
    publication: String,
    link: String
  }],
  skills: [String],
  rating: { type: Number, min: 1, max: 10, default: null },
  resumeUrl: { type: String },
  marksheet12Url: { type: String },
  degreeUrl: { type: String },
  profileComplete: { type: Boolean, default: false },
  status: { 
    type: String, 
    enum: ['Registered', 'Shortlisted', 'Interview', 'Selected', 'Rejected'], 
    default: 'Registered' 
  },
  interviewDate: { type: Date },
  interviewTime: { type: String },
  interviewVenue: { type: String },
  interviewRequirements: { type: String },
  rejectionReason: { type: String }
}, { timestamps: true });

const Applicant = mongoose.model('Applicant', applicantSchema);
export default Applicant;
