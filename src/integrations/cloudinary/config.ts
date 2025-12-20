import { v2 as cloudinary } from "cloudinary";
import { ENV } from "@/config/env";

// Configure Cloudinary
cloudinary.config({
  cloud_name: ENV.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: ENV.CLOUDINARY_API_KEY,
  api_secret: ENV.CLOUDINARY_API_SECRET,
  secure: true,
});

// No extra validation needed here because ENV.requireEnv already throws
export default cloudinary;
