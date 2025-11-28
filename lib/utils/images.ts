/**
 * Image utility functions for handling image URLs
 * Supports Supabase Storage, external URLs, and fallbacks
 */

/**
 * Get image URL with fallback support
 * @param imageUrl - Image URL from database (can be null/undefined)
 * @param fallback - Fallback URL or placeholder path
 * @returns Valid image URL
 */
export function getImageUrl(
  imageUrl: string | null | undefined,
  fallback?: string
): string {
  // Check for empty string, null, or undefined
  if (!imageUrl || imageUrl.trim() === "") {
    return fallback || 'https://api.dicebear.com/7.x/shapes/svg?seed=placeholder';
  }

  // If it's already a full URL (Supabase Storage or external)
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If it's a relative path, prepend Supabase Storage URL
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const storagePath = imageUrl.startsWith('/') ? imageUrl.slice(1) : imageUrl;
    return `${supabaseUrl}/storage/v1/object/public/tool-images/${storagePath}`;
  }

  // Always return a valid URL, never empty string
  return fallback || 'https://api.dicebear.com/7.x/shapes/svg?seed=placeholder';
}

/**
 * Get avatar URL with Dicebear fallback
 * @param avatarUrl - Avatar URL from database
 * @param email - User email for Dicebear seed
 * @param name - User name for Dicebear seed (fallback)
 * @returns Avatar URL
 */
export function getAvatarUrl(
  avatarUrl: string | null | undefined,
  email?: string,
  name?: string
): string {
  // Check for empty string, null, or undefined
  if (avatarUrl && avatarUrl.trim() !== "") {
    return getImageUrl(avatarUrl);
  }

  // Fallback to Dicebear - always return a valid URL
  const seed = (email && email.trim() !== "") || (name && name.trim() !== "") 
    ? (email || name || 'User') 
    : 'User';
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * Get tool logo URL with fallback
 * @param logoUrl - Logo URL from database
 * @param toolName - Tool name for placeholder
 * @returns Logo URL
 */
export function getToolLogoUrl(
  logoUrl: string | null | undefined,
  toolName: string
): string {
  // Check for empty string, null, or undefined
  if (logoUrl && logoUrl.trim() !== "") {
    return getImageUrl(logoUrl);
  }

  // Fallback - placeholder with first letter
  // Ensure toolName is not empty
  const name = toolName && toolName.trim() !== "" ? toolName : "Tool";
  const firstLetter = name.charAt(0).toUpperCase();
  return `/api/placeholder/64x64?text=${firstLetter}`;
}

/**
 * Get blog cover image URL with fallback
 * @param coverImage - Cover image URL from database
 * @returns Cover image URL
 */
export function getBlogCoverUrl(
  coverImage: string | null | undefined
): string {
  if (!coverImage) {
    // Fallback to a default blog cover
    return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop';
  }

  // If it's already a full URL (Supabase Storage or external)
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }

  // If it's a relative path, prepend Supabase Storage URL with blog-images bucket
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    const storagePath = coverImage.startsWith('/') ? coverImage.slice(1) : coverImage;
    return `${supabaseUrl}/storage/v1/object/public/blog-images/${storagePath}`;
  }

  // Fallback to Unsplash placeholder
  return 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=630&fit=crop';
}

/**
 * Check if image URL is from Dicebear (needs unoptimized prop)
 * @param imageUrl - Image URL to check
 * @returns true if Dicebear URL
 */
export function isDicebearUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  return imageUrl.includes('dicebear.com');
}

/**
 * Check if image URL is SVG (needs unoptimized prop)
 * @param imageUrl - Image URL to check
 * @returns true if SVG
 */
export function isSvgUrl(imageUrl: string | null | undefined): boolean {
  if (!imageUrl) return false;
  return imageUrl.endsWith('.svg') || imageUrl.includes('.svg?');
}

/**
 * Get optimized image props for Next.js Image component
 * @param imageUrl - Image URL
 * @param alt - Alt text
 * @param options - Additional options
 * @returns Image props object
 */
export function getImageProps(
  imageUrl: string | null | undefined,
  alt: string,
  options?: {
    width?: number;
    height?: number;
    fill?: boolean;
    priority?: boolean;
    className?: string;
  }
) {
  const url = getImageUrl(imageUrl);
  const needsUnoptimized = isDicebearUrl(url) || isSvgUrl(url);

  return {
    src: url,
    alt,
    ...(options?.fill ? { fill: true } : { width: options?.width || 400, height: options?.height || 300 }),
    ...(options?.priority && { priority: true }),
    ...(options?.className && { className: options.className }),
    ...(needsUnoptimized && { unoptimized: true }),
  };
}

