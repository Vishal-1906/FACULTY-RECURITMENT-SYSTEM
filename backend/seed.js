import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import JobRequirement from './models/JobRequirement.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    
    // Clear existing data
    await User.deleteMany();
    await JobRequirement.deleteMany();

    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const applicantPassword = await bcrypt.hash('applicant123', salt);

    // Create Admin
    await User.create({
      name: 'System Administrator',
      email: 'admin@college.edu',
      password: adminPassword,
      role: 'Admin'
    });

    // Create Applicant
    await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: applicantPassword,
      role: 'Applicant'
    });

    // Create Sample Jobs
    await JobRequirement.create([
      {
        title: 'Assistant Professor (Computer Science)',
        department: 'Computer Science',
        description: 'We are looking for a passionate researcher in AI/ML to join our faculty.',
        requirements: ['PhD in Computer Science', '3+ years teaching experience', 'Research publications in top-tier journals'],
        experienceRequired: '3 Years',
        status: 'Open',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        title: 'Lecturer (Information Technology)',
        department: 'Information Technology',
        description: 'Position for teaching Web Technologies and Cloud Computing.',
        requirements: ['M.Tech in IT/CS', 'Proficiency in MERN stack', 'Good communication skills'],
        experienceRequired: '1 Year',
        status: 'Open',
        deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
