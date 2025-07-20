const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'dvv9qjg43',
  api_key: '791972987199859',
  api_secret: 'toGpnJYkXQKjAT-nV4ktgSerlOo'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'court-images',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

module.exports = { cloudinary, storage };