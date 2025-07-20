const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// It's best practice to use environment variables for credentials
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvv9qjg43',
  api_key: process.env.CLOUDINARY_API_KEY || '791972987199859',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'toGpnJYkXQKjAT-nV4ktgSerlOo'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'court-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

module.exports = { cloudinary, storage };