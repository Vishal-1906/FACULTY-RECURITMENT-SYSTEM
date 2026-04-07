import express from 'express';
import { getProfile, updateProfile, uploadDocuments, deleteDocument, getAllApplicants, getHighMatches, updateApplicantStatus } from '../controllers/applicantController.js';
import { protect, admin } from '../middlewares/authMiddleware.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();

// Multer config for local storage
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename(req, file, cb) {
    const uniqueName = `${req.user._id}-${Date.now()}${path.extname(file.originalname)}`;
    console.log(`Uploading file: ${file.originalname} -> ${uniqueName}`);
    cb(null, uniqueName);
  }
});

function checkFileType(file, cb) {
  const filetypes = /pdf|doc|docx/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only PDF, DOC, and DOCX files are allowed!'));
  }
}

const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  }
});

router.route('/profile')
  .get(protect, getProfile)
  .put(protect, updateProfile);

// Enhanced upload middleware with better error handling
const uploadMiddleware = (req, res, next) => {
  upload.fields([
    { name: 'resume', maxCount: 1 },
    { name: 'marksheet12', maxCount: 1 },
    { name: 'degree', maxCount: 1 }
  ])(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('Multer Error:', err);
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Unknown Upload Error:', err);
      return res.status(400).json({ message: err.message });
    }
    console.log('Multer successfully processed files:', req.files);
    next();
  });
};

router.post('/upload-documents', protect, uploadMiddleware, uploadDocuments);
router.delete('/documents/:field', protect, deleteDocument);
router.get('/', protect, admin, getAllApplicants);
router.get('/high-matches', protect, admin, getHighMatches);
router.put('/:id/status', protect, admin, updateApplicantStatus);

export default router;
