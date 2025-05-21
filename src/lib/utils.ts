import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Ensures a path has a trailing slash unless it's the homepage
 * This helps prevent unnecessary redirects when links are clicked
 * @param path The URL path to process
 * @returns The path with a trailing slash (except for homepage)
 */
export function ensureTrailingSlash(path: string): string {
  if (!path) return "/";
  
  // Don't modify the homepage
  if (path === "/") return path;
  
  // Skip hash links and external URLs
  if (path.startsWith("#") || path.includes("://")) return path;
  
  // Add trailing slash if not present
  return path.endsWith("/") ? path : `${path}/`;
}