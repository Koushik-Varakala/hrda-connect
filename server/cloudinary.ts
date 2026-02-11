import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

if (!process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET) {
    console.warn("Missing Cloudinary credentials in environment variables");
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "hrda_connect",
        allowed_formats: ["jpg", "png", "jpeg", "webp"],
    } as any,
});

export const upload = multer({ storage: storage });

export const deleteImageFromCloudinary = async (imageUrl: string) => {
    try {
        if (!imageUrl || !imageUrl.includes("cloudinary")) return;

        // Extract public_id from URL
        // Example: .../upload/v123456/hrda_connect/xyz.jpg -> "hrda_connect/xyz"
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
        const match = imageUrl.match(regex);

        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId);
            console.log(`Deleted from Cloudinary: ${publicId}`);
        }
    } catch (error) {
        console.error("Cloudinary delete error:", error);
    }
};

export { cloudinary };
