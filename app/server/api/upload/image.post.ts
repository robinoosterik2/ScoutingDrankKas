// /server/api/upload/image.post.ts
import { defineEventHandler, readMultipartFormData } from 'h3';
import fs from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

// Define the directory where images will be stored.
// This path is relative to the project root, and then navigates into `app/public`
const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'images');

export default defineEventHandler(async (event) => {
    try {
        // Ensure the upload directory exists
        await fs.mkdir(UPLOAD_DIR, { recursive: true });

        const multipartFormData = await readMultipartFormData(event);
        const imageFile = multipartFormData?.find(part => part.name === 'image');

        if (!imageFile || !imageFile.data || !imageFile.filename) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: 'No image file provided or file data is missing.',
            });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!imageFile.type || !allowedTypes.includes(imageFile.type)) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Bad Request',
                message: `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`,
            });
        }

        // Generate a unique filename to prevent overwrites
        const fileExtension = path.extname(imageFile.filename);
        const uniqueFilename = `${randomUUID()}${fileExtension}`;
        const filePath = path.join(UPLOAD_DIR, uniqueFilename);

        // Save the file
        await fs.writeFile(filePath, imageFile.data);

        // Construct the public URL for the image
        // This URL will be relative to the `public` directory
        const publicImageUrl = `/uploads/images/${uniqueFilename}`;

        return {
            imageUrl: publicImageUrl,
        };

    } catch (error: any) {
        console.error('Error uploading image:', error);

        // Check if it's an h3 error and rethrow, otherwise create a generic server error
        if (error.statusCode) {
            throw error;
        }

        throw createError({
            statusCode: 500,
            statusMessage: 'Internal Server Error',
            message: 'Could not upload image.',
        });
    }
});
