import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function encodeURLComponent(value: string) {
  return encodeURIComponent(value.trim()).replace(/%20/g, "%20").replace(/\//g, "%2F");
}