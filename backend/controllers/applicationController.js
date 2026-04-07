import Application from '../models/Application.js';
import User from '../models/User.js';
import JobRequirement from '../models/JobRequirement.js';
import Notification from '../models/Notification.js';
import Faculty from '../models/Faculty.js';
import Applicant from '../models/Applicant.js';

// @desc    Apply for a job
// @route   POST /api/applications/:jobId
// @access  Private/Applicant
export const applyForJob = async (req, res) => {
  try {
    const job = await JobRequirement.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      applicant: req.user._id, // Notice: we should look up applicant _id not user _id. Wait. Req.user._id is the User id.
      job: req.params.jobId
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }
    
    // Get applicant ID
    const applicant = await User.findById(req.user._id);

    // Simplification for the example, actual applicant ID from Applicant model needed
    const { default: Applicant } = await import('../models/Applicant.js');
    const applicantProfile = await Applicant.findOne({ user: req.user._id });

    if (!applicantProfile) {
      return res.status(404).json({ message: 'Applicant profile not found' });
    }

    const application = new Application({
      applicant: applicantProfile._id,
      job: job._id,
      status: 'Applied'
    });

    const createdApplication = await application.save();

    res.status(201).json(createdApplication);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get my applications
// @route   GET /api/applications/my-applications
// @access  Private/Applicant
export const getMyApplications = async (req, res) => {
  try {
    const { default: Applicant } = await import('../models/Applicant.js');
    const applicantProfile = await Applicant.findOne({ user: req.user._id });

    if (!applicantProfile) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    const applications = await Application.find({ applicant: applicantProfile._id })
      .populate('job', 'title department status');

    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all applications for a job
// @route   GET /api/applications/job/:jobId
// @access  Private/Admin
export const getApplicationsForJob = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.jobId })
      .populate({
        path: 'applicant',
        populate: { path: 'user', select: 'name email' }
      });
      
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Admin
  export const updateApplicationStatus = async (req, res) => {
  try {
    const { status, remarks, interviewDate, interviewTime, interviewVenue, interviewRequirements, rating } = req.body;
    const application = await Application.findById(req.params.id)
      .populate({ path: 'applicant', populate: { path: 'user' } })
      .populate('job');

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    application.status = status || application.status;
    if (remarks) application.remarks = remarks;
    if (rating !== undefined) application.rating = rating;
    if (interviewDate) application.interviewDate = interviewDate;
    if (interviewTime) application.interviewTime = interviewTime;
    if (interviewVenue) application.interviewVenue = interviewVenue;
    if (interviewRequirements) application.interviewRequirements = interviewRequirements;

    await application.save();

    // Sync with Applicant profile
    const applicantProfile = await Applicant.findById(application.applicant._id);
    if (applicantProfile) {
      if (status) applicantProfile.status = status;
      if (rating !== undefined) applicantProfile.rating = rating;
      if (remarks) applicantProfile.rejectionReason = remarks;
      if (interviewDate) applicantProfile.interviewDate = interviewDate;
      if (interviewTime) applicantProfile.interviewTime = interviewTime;
      if (interviewVenue) applicantProfile.interviewVenue = interviewVenue;
      if (interviewRequirements) applicantProfile.interviewRequirements = interviewRequirements;
      await applicantProfile.save();
    }

    // Send notification
    const io = req.app.get('socketio');
    const notification = await Notification.create({
      recipient: application.applicant.user._id,
      message: `Your application status for ${application.job.title} has been updated to ${status}.`,
      type: status === 'Interview' ? 'Interview' : 'Application'
    });

    io.emit(`notification-${application.applicant.user._id}`, notification);

    // If Selected, move to Faculty DB automatically
    if (status === 'Selected') {
      const existingFaculty = await Faculty.findOne({ user: application.applicant.user._id });
      if (!existingFaculty) {
        await Faculty.create({
          user: application.applicant.user._id,
          department: application.job.department,
          designation: application.job.title,
        });
      }
    }

    // Mock Email Notification
    if (status === 'Interview') {
      console.log(`
        --- MOCK EMAIL SENT to ${application.applicant.user.email} ---
        Subject: Interview Invitation for ${application.job.title}
        
        Dear ${application.applicant.user.name},
        
        We are pleased to invite you for an interview for the position: ${application.job.title}.
        Date: ${new Date(interviewDate).toLocaleDateString()}
        Time: ${interviewTime}
        Venue: ${interviewVenue}
        Requirements: ${interviewRequirements}
        
        Please check your dashboard for more details.
        ------------------------------------------
      `);
    }

    if (status === 'Rejected') {
      console.log(`
        --- MOCK EMAIL SENT to ${application.applicant.user.email} ---
        Subject: Update on your Application for ${application.job.title}
        
        Dear ${application.applicant.user.name},
        
        Thank you for your interest in the position: ${application.job.title}. 
        After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.
        
        Feedback: ${remarks}
        
        We wish you the best in your future endeavors.
        ------------------------------------------
      `);
    }

    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get Admin Analytics
// @route   GET /api/applications/analytics
// @access  Private/Admin
export const getAdminAnalytics = async (req, res) => {
  try {
    const totalJobs = await JobRequirement.countDocuments();
    const totalApplications = await Application.countDocuments();
    const totalApplicants = await Applicant.countDocuments();
    
    const statusCounts = await Applicant.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    const topCandidates = await Applicant.find({ rating: { $exists: true, $ne: null } })
      .populate('user', 'name email')
      .sort({ rating: -1 })
      .limit(5);

    res.json({
      totalJobs,
      totalApplications,
      totalApplicants,
      statusCounts,
      topCandidates
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
