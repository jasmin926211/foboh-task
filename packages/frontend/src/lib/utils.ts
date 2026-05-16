import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function stringToColor(str: string): string {
  const colors = [
    'bg-amber-100', 'bg-blue-100', 'bg-emerald-100', 'bg-rose-100',
    'bg-purple-100', 'bg-orange-100', 'bg-cyan-100', 'bg-pink-100',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}
