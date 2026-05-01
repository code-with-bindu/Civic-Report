const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

/**
 * Configure Cloudinary SDK with credentials from environment variables.
 */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Multer-Cloudinary storage engine.
 * Stores uploads in the "civic-issues" folder on Cloudinary.
 * Accepts images (jpg, png, webp) and videos (mp4, mov, avi).
 */
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => {
        // Determine resource type based on mimetype
        const isVideo = file.mimetype.startsWith('video');
        return {
            folder: 'civic-issues',
            resource_type: isVideo ? 'video' : 'image',
            allowed_formats: isVideo
                ? ['mp4', 'mov', 'avi']
                : ['jpg', 'jpeg', 'png', 'webp'],
        };
    },
});

module.exports = { cloudinary, storage };
