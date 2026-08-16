const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');

// Decide where and how to save the file (now on Cloudinary instead of disk)
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'asl-week4-uploads',
    resource_type: 'auto', // handles both images and PDFs correctly
  }
});

// Only allow certain file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPG, PNG, and PDF allowed.'), false);
  }
};

// Limit file size to 5MB
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

module.exports = upload;
