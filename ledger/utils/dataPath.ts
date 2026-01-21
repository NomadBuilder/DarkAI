/**
 * Get the correct path for data files, respecting basePath
 * 
 * With BASE_PATH=/ledger, this ensures fetch calls use /ledger/data/processed/...
 * instead of /data/processed/...
 */

// Detect basePath from current URL
function getBasePath(): string {
  if (typeof window === 'undefined') {
    // Server-side: use env var
    return process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || ''
  }
  
  // Client-side: detect from current path
  const pathname = window.location.pathname
  if (pathname.startsWith('/ledger')) {
    return '/ledger'
  }
  return ''
}

// Get the correct path for data files
export function getDataPath(path: string): string {
  const basePath = getBasePath()
  // Remove leading slash if present
  const cleanPath = path.startsWith('/') ? path.slice(1) : path
  return basePath ? `${basePath}/${cleanPath}` : `/${cleanPath}`
}

// Convenience function for data files
export function getDataFile(filename: string): string {
  return getDataPath(`data/processed/${filename}`)
}
