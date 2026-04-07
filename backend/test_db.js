import mongoose from 'mongoose';
const MONGO_URI = 'mongodb://127.0.0.1:27017/faculty-recruitment';
console.log('Connecting to:', MONGO_URI);
mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('SUCCESS: Connected to MongoDB');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Could not connect to MongoDB');
    console.error(err);
    process.exit(1);
  });
