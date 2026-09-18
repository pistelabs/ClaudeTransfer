import { clsx } from 'clsx';
import type { ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn's class helper: conditional classes from clsx, then tailwind-merge to
 * settle conflicts so a `className` passed by a caller beats the component's own
 * utility for the same property. Plain CSS class names pass through untouched,
 * which is how the hand-written overrides in the stylesheets keep working.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
