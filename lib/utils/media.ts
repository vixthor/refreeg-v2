/**
 * Resolves a media key or URL into a displayable URL.
 * If the input is an S3 key, it returns the proxy API URL.
 * If it's already a full URL, it returns it as is.
 */
export function getMediaUrl(key: string | null | undefined): string {
  if (!key) return "";
  
  // If it's a full URL (http/https), return it as is
  if (key.startsWith("http://") || key.startsWith("https://")) {
    return key;
  }
  
  // Otherwise assume it's an S3 key and use our proxy
  return `/api/s3/image?key=${encodeURIComponent(key)}`;
}
