import Applicant from '../models/Applicant.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// @desc    Get current applicant profile
// @route   GET /api/applicants/profile
// @access  Private (Applicant only)
export const getProfile = async (req, res) => {
  try {
    let applicant = await Applicant.findOne({ user: req.user._id }).populate('user', 'name email');
    
    if (!applicant) {
      console.log('Profile first load: creating applicant record for', req.user._id);
      applicant = await Applicant.create({ 
        user: req.user._id,
        name: req.user.name || 'Unknown'
      });
      // Re-populate user for consistency
      applicant = await Applicant.findById(applicant._id).populate('user', 'name email');
    }
    
    res.json(applicant);
  } catch (error) {
    console.error('getProfile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update applicant profile
// @route   PUT /api/applicants/profile
// @access  Private (Applicant only)
export const updateProfile = async (req, res) => {
  try {
    const applicant = await Applicant.findOne({ user: req.user._id });

    if (applicant) {
      // Update User name if provided
      if (req.body.name) {
        await User.findByIdAndUpdate(req.user._id, { name: req.body.name });
      }

      applicant.phone = req.body.phone || applicant.phone;
      applicant.address = req.body.address || applicant.address;
      applicant.education = req.body.education || applicant.education;
      applicant.experience = req.body.experience || applicant.experience;
      applicant.research = req.body.research || applicant.research;
      applicant.skills = req.body.skills || applicant.skills;
      
      // Handle document URLs
      applicant.resumeUrl = req.body.resumeUrl || applicant.resumeUrl;
      applicant.marksheet12Url = req.body.marksheet12Url || applicant.marksheet12Url;
      applicant.degreeUrl = req.body.degreeUrl || applicant.degreeUrl;
      
      // Calculate profile completeness
      const isComplete = !!(
        applicant.phone && 
        applicant.education.length > 0 && 
        applicant.resumeUrl && 
        applicant.marksheet12Url && 
        applicant.degreeUrl
      );
      applicant.profileComplete = isComplete;

      const updatedApplicant = await applicant.save();
      const populatedApplicant = await Applicant.findById(updatedApplicant._id).populate('user', 'name email');
      res.json(populatedApplicant);
    } else {
      res.status(404).json({ message: 'Applicant profile not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Upload resume
// @route   POST /api/applicants/upload-resume
// @access  Private (Applicant only)
// @desc    Upload documents (Resume, Marksheet12, Degree)
// @route   POST /api/applicants/upload-documents
// @access  Private (Applicant only)
export const uploadDocuments = async (req, res) => {
  try {
    console.log('Upload request received for user:', req.user?._id);
    let applicant = await Applicant.findOne({ user: req.user._id });

    if (!applicant) {
      console.log('Applicant profile not found, creating one for user:', req.user._id);
      applicant = await Applicant.create({ 
        user: req.user._id,
        name: req.user.name || 'Unknown' 
      });
    }

    if (req.files) {
      console.log('Files received in controller:', Object.keys(req.files));
      
      if (req.files.resume) {
        applicant.resumeUrl = `/uploads/${req.files.resume[0].filename}`;
        console.log('Resume URL updated:', applicant.resumeUrl);
      }
      if (req.files.marksheet12) {
        applicant.marksheet12Url = `/uploads/${req.files.marksheet12[0].filename}`;
        console.log('Marksheet12 URL updated:', applicant.marksheet12Url);
      }
      if (req.files.degree) {
        applicant.degreeUrl = `/uploads/${req.files.degree[0].filename}`;
        console.log('Degree URL updated:', applicant.degreeUrl);
      }
      
      const savedApplicant = await applicant.save();
      console.log('Applicant document status updated and saved.');
      
      res.json({ 
        message: 'Documents uploaded successfully', 
        resumeUrl: savedApplicant.resumeUrl,
        marksheet12Url: savedApplicant.marksheet12Url,
        degreeUrl: savedApplicant.degreeUrl
      });
    } else {
      console.warn('No files processed by Multer.');
      res.status(400).json({ message: 'No files uploaded' });
    }
  } catch (error) {
    console.error('Controller Error in uploadDocuments:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a specific document
// @route   DELETE /api/applicants/documents/:field
// @access  Private (Applicant only)
export const deleteDocument = async (req, res) => {
  try {
    const { field } = req.params;
    const applicant = await Applicant.findOne({ user: req.user._id });

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant profile not found' });
    }

    const fieldMap = {
      resume: 'resumeUrl',
      marksheet12: 'marksheet12Url',
      degree: 'degreeUrl'
    };

    const urlField = fieldMap[field];
    if (!urlField || !applicant[urlField]) {
      return res.status(400).json({ message: 'Document not found or invalid field' });
    }

    // Attempt to delete file from disk
    const relativePath = applicant[urlField];
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const fullPath = path.join(__dirname, '..', relativePath);

    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
        console.log(`Deleted file from disk: ${fullPath}`);
      } catch (err) {
        console.error(`Error deleting file from disk: ${err.message}`);
        // Continue even if disk delete fails (maybe file was already gone)
      }
    }

    // Clear field in database
    applicant[urlField] = '';
    
    // Update completeness
    applicant.profileComplete = false;
    
    await applicant.save();

    res.json({ message: `${field} deleted successfully` });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all applicants (Admin only)
// @route   GET /api/applicants
// @access  Private/Admin
export const getAllApplicants = async (req, res) => {
  try {
    const applicants = await Applicant.find({}).populate('user', 'name email');
    res.json(applicants);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update applicant profile status (Admin only)
// @route   PUT /api/applicants/:id/status
// @access  Private/Admin
export const updateApplicantStatus = async (req, res) => {
  try {
    const { status, interviewDate, interviewTime, interviewVenue, interviewRequirements, rejectionReason, rating } = req.body;
    const applicant = await Applicant.findById(req.params.id).populate('user', 'name email');

    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

    applicant.status = status || applicant.status;
    if (rating !== undefined) applicant.rating = rating;
    
    if (interviewDate) applicant.interviewDate = interviewDate;
    if (interviewTime) applicant.interviewTime = interviewTime;
    if (interviewVenue) applicant.interviewVenue = interviewVenue;
    if (interviewRequirements) applicant.interviewRequirements = interviewRequirements;
    if (rejectionReason) applicant.rejectionReason = rejectionReason;

    await applicant.save();

    // Sync with all Applications
    const { default: Application } = await import('../models/Application.js');
    const updateFields = {};
    if (status) updateFields.status = status;
    if (rating !== undefined) updateFields.rating = rating;
    if (rejectionReason) updateFields.remarks = rejectionReason;
    if (interviewDate) updateFields.interviewDate = interviewDate;
    if (interviewTime) updateFields.interviewTime = interviewTime;
    if (interviewVenue) updateFields.interviewVenue = interviewVenue;
    if (interviewRequirements) updateFields.interviewRequirements = interviewRequirements;
    
    if (Object.keys(updateFields).length > 0) {
      await Application.updateMany(
        { applicant: applicant._id },
        { $set: updateFields }
      );
    }

    // Send Real-Time Notification via Socket.io/Database
    const io = req.app.get('socketio');
    if (status === 'Interview' || status === 'Rejected' || status === 'Shortlisted') {
      await Notification.create({
        recipient: applicant.user._id,
        message: status === 'Interview' 
          ? `An interview has been scheduled for you on ${new Date(interviewDate).toLocaleDateString()} at ${interviewTime}.`
          : status === 'Rejected' 
          ? `Your application status has been updated. Feedback: ${rejectionReason}`
          : `Your profile has been shortlisted for further review!`,
        type: status === 'Interview' ? 'Interview' : 'Application'
      });
      // Emit socket event for real-time update
      io.to(applicant.user._id.toString()).emit('new-notification');
    }

    // Mock Email Notification
    if (status === 'Interview') {
      console.log(`
        --- MOCK EMAIL SENT to ${applicant.user.email} ---
        Subject: Interview Invitation - Faculty Recruitment
        
        Dear ${applicant.user.name},
        
        We are pleased to invite you for an interview.
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
        --- MOCK EMAIL SENT to ${applicant.user.email} ---
        Subject: Update on your Application - Faculty Recruitment
        
        Dear ${applicant.user.name},
        
        Thank you for your interest in our institution. 
        After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.
        
        Feedback: ${rejectionReason}
        
        We wish you the best in your future endeavors.
        ------------------------------------------
      `);
    }

    res.json(applicant);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get High Matches based on skills/research vs job requirements (Smart Screening)
// @route   GET /api/applicants/high-matches
// @access  Private/Admin
export const getHighMatches = async (req, res) => {
  try {
    const { default: JobRequirement } = await import('../models/JobRequirement.js');
    const applicants = await Applicant.find({}).populate('user', 'name email');
    const jobs = await JobRequirement.find({ status: 'Open' });

    // Simple matching algorithm: 
    // Score based on how many job requirements or department names appear in applicant's skills or research titles
    const scoredApplicants = applicants.map(applicant => {
      let score = 0;
      const applicantText = [
        ...(applicant.skills || []),
        ...applicant.research.map(r => r.title),
        ...applicant.research.map(r => r.publication),
        ...(applicant.education || []).map(e => e.degree),
        ...(applicant.education || []).map(e => e.institution)
      ].join(' ').toLowerCase();

      jobs.forEach(job => {
        const keywords = [
          job.title,
          job.department,
          ...(job.requirements || [])
        ];

        keywords.forEach(keyword => {
          if (keyword && applicantText.includes(keyword.toLowerCase())) {
            score += 10; // Found a match
          }
        });
      });

      return {
        ...applicant.toObject(),
        matchScore: score
      };
    });

    // Filter those with a score > 0 and sort by highest score
    const highMatches = scoredApplicants
      .filter(a => a.matchScore > 0)
      .sort((a, b) => b.matchScore - a.matchScore);

    res.json(highMatches);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
