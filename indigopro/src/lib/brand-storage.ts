import type { BrandProfile } from '@/types/brand';

const BRAND_KEY = 'indigopro_brand_profile_v1';

export function saveBrandProfile(profile: BrandProfile): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(BRAND_KEY, JSON.stringify(profile));
}

export function loadBrandProfile(): BrandProfile | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(BRAND_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as BrandProfile;
  } catch {
    return null;
  }
}

export function clearBrandProfile(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(BRAND_KEY);
}
