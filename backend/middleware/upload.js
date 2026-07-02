const multer = require('multer');
const path = require('path');

// Configure Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'selfie') {
      cb(null, path.join(__dirname, '..', 'uploads', 'selfies'));
    } else if (file.fieldname === 'audio') {
      cb(null, path.join(__dirname, '..', 'uploads', 'voice_notes'));
    } else {
      cb(null, path.join(__dirname, '..', 'uploads'));
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || (file.fieldname === 'selfie' ? '.jpg' : '.m4a');
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

module.exports = multer({ storage });
