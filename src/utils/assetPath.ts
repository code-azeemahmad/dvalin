/**
 * Resolves a public asset path taking into account the Vite deployment BASE_URL.
 * Supports root domain hosting (Cloudflare, Netlify) as well as subpath hosting (GitHub Pages).
 */
export function resolveAssetPath(filePath: string): string {
  if (!filePath) return '';
  if (
    filePath.startsWith('http://') ||
    filePath.startsWith('https://') ||
    filePath.startsWith('data:') ||
    filePath.startsWith('blob:')
  ) {
    return filePath;
  }

  const metaEnv = (import.meta as { env?: Record<string, string> }).env;
  const baseUrl = metaEnv?.BASE_URL || './';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = filePath.replace(/^\.?\/+/, '');

  return `${cleanBase}${cleanPath}`;
}
