import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faculty-recruitment');

import Application from './models/Application.js';
import User from './models/User.js';
import Applicant from './models/Applicant.js';
import JobRequirement from './models/JobRequirement.js';

async function fix() {
  try {
    const user = await User.findOne({ email: 'subash@gmail.com' });
    const applicant = await Applicant.findOne({ user: user._id });
    
    // Find the "Assistant Professor" job
    const job = await JobRequirement.findOne({ title: 'Assistant Professor' });
    
    if (job && applicant) {
        // Set rating to undefined/null or just $unset it. In mongoose, setting to undefined works with .save(), but let's use $unset
        await Application.updateOne(
            { applicant: applicant._id, job: job._id },
            { $unset: { rating: "" } }
        );
        console.log('Successfully removed rating from Subash Assistant Professor role.');
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fix();
