// utils/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: 'djbldm8ma',
  api_key: '437778114917129',
  api_secret: '-8nYNXhMbpeS5heqws-aomJNHSs',
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'kilo_avatars',
    allowed_formats: ['jpg', 'jpeg', 'png'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
  },
});

module.exports = { cloudinary, storage };
