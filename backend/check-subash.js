import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/faculty-recruitment');

import Applicant from './models/Applicant.js';
import Application from './models/Application.js';
import User from './models/User.js';

async function check() {
  try {
    const user = await User.findOne({ email: 'subash@gmail.com' });
    const applicant = await Applicant.findOne({ user: user._id });
    const applications = await Application.find({ applicant: applicant._id }).populate({ path: 'job', select: 'title' });
    
    console.log('Applicant status:', applicant.status);
    applications.forEach(app => {
        console.log(`Application for ${app.job.title} (ID: ${app._id}): ${app.status}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
