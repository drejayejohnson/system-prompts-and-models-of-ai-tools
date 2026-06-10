'use client';

import { useState, useEffect, useCallback } from 'react';
import type { BrandProfile } from '@/types/brand';
import { loadBrandProfile, saveBrandProfile, clearBrandProfile } from '@/lib/brand-storage';
import { createEmptyBrandProfile } from '@/lib/brand-voice';

export function useBrandProfile() {
  const [profile, setProfile] = useState<BrandProfile | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = loadBrandProfile();
    setProfile(stored);
    setIsLoaded(true);
  }, []);

  const updateProfile = useCallback((updates: Partial<BrandProfile>) => {
    setProfile((prev) => {
      const base = prev ?? createEmptyBrandProfile();
      const updated = { ...base, ...updates, updatedAt: new Date().toISOString() };
      saveBrandProfile(updated);
      return updated;
    });
  }, []);

  const setFullProfile = useCallback((p: BrandProfile) => {
    saveBrandProfile(p);
    setProfile(p);
  }, []);

  const resetProfile = useCallback(() => {
    clearBrandProfile();
    setProfile(null);
  }, []);

  return { profile, isLoaded, updateProfile, setFullProfile, resetProfile };
}
