import { Profile, HistoryEntry } from '@/types/marcough';

const PROFILES_KEY = 'marcough_profiles';
const HISTORY_KEY = 'marcough_history';
const SELECTED_PROFILE_KEY = 'marcough_selected_profile';

export const getProfiles = (): Profile[] => {
  const stored = localStorage.getItem(PROFILES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const saveProfile = (profile: Profile): void => {
  const profiles = getProfiles();
  const existingIndex = profiles.findIndex(p => p.id === profile.id);
  
  if (existingIndex >= 0) {
    profiles[existingIndex] = profile;
  } else {
    profiles.push(profile);
  }
  
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
};

export const deleteProfile = (id: string): void => {
  const profiles = getProfiles().filter(p => p.id !== id);
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
  
  if (getSelectedProfileId() === id) {
    localStorage.removeItem(SELECTED_PROFILE_KEY);
  }
};

export const getSelectedProfileId = (): string | null => {
  return localStorage.getItem(SELECTED_PROFILE_KEY);
};

export const setSelectedProfileId = (id: string): void => {
  localStorage.setItem(SELECTED_PROFILE_KEY, id);
};

export const getSelectedProfile = (): Profile | null => {
  const id = getSelectedProfileId();
  if (!id) return null;
  return getProfiles().find(p => p.id === id) || null;
};

export const getHistory = (): HistoryEntry[] => {
  const stored = localStorage.getItem(HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addHistoryEntry = (entry: HistoryEntry): void => {
  const history = getHistory();
  history.unshift(entry);
  // Keep only last 50 entries
  const trimmed = history.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
};

export const clearHistory = (): void => {
  localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
};
