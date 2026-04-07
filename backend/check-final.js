import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faculty-recruitment');

import User from './models/User.js';
import Applicant from './models/Applicant.js';
import JobRequirement from './models/JobRequirement.js';
import Application from './models/Application.js';

async function check() {
  try {
    const user = await User.findOne({ email: 'subash@gmail.com' });
    const applicant = await Applicant.findOne({ user: user._id });
    const applications = await Application.find({ applicant: applicant._id }).populate('job');
    
    console.log('--- Subash Database State ---');
    applications.forEach(app => {
        console.log(`Job: ${app.job?.title}`);
        console.log(`Status: ${app.status}`);
        console.log(`Rating: ${app.rating}`);
        console.log(`ID: ${app._id}`);
        console.log('---');
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
