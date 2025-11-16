/**
 * Utility functions for TrustLock Frontend
 */

import { clsx, type ClassValue } from 'clsx';

/**
 * Combines class names conditionally
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Creates a data URL from a File object
 * Used for displaying uploaded images before they're stored
 */
export async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Creates a base64 string from a File object (without data URL prefix)
 */
export async function fileToBase64(file: File): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  return dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
}

/**
 * Formats a date to a readable string
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Gets risk level from score
 */
export function getRiskLevel(score: number): 'low' | 'medium' | 'high' {
  if (score < 0.4) return 'low';
  if (score < 0.6) return 'medium';
  return 'high';
}

/**
 * Gets color for risk level
 */
export function getRiskColor(level: 'low' | 'medium' | 'high'): string {
  if (level === 'low') return 'var(--color-success)';
  if (level === 'medium') return 'var(--color-warning)';
  return 'var(--color-danger)';
}

