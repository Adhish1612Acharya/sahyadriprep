import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET,
  secure: true, // Use HTTPS
});

// Validate configuration
if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
    !process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 
    !process.env.NEXT_PUBLIC_CLOUDINARY_API_SECRET) {
  console.warn('⚠️ Cloudinary configuration is incomplete. Check your environment variables.');
}

export default cloudinary