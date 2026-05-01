const multer = require('multer');
const { storage } = require('../config/cloudinary');

/**
 * Multer middleware configured with Cloudinary storage.
 * Accepts up to 5 files (images or videos) with a 10 MB size limit each.
 */
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB per file
    },
    fileFilter: (req, file, cb) => {
        // Allow images and videos only
        if (
            file.mimetype.startsWith('image/') ||
            file.mimetype.startsWith('video/')
        ) {
            cb(null, true);
        } else {
            cb(new Error('Only image and video files are allowed'), false);
        }
    },
});

module.exports = upload;
