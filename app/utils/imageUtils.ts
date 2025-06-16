export function getDisplayableProductImageUrl(imageUrl?: string | null): string {
  const placeholder = '/images/placeholder.jpg';

  if (!imageUrl || imageUrl.trim() === '') {
    return placeholder;
  }

  // If it's an old path like /images/some-uploaded-file.png, correct it to /uploads/images/some-uploaded-file.png
  if (imageUrl.startsWith('/images/') && imageUrl !== placeholder) {
    const filename = imageUrl.substring('/images/'.length);
    return `/uploads/images/${filename}`;
  }

  // Otherwise, assume it's correct (e.g., /uploads/images/uuid.png, /images/placeholder.jpg, or a full external URL)
  return imageUrl;
}
