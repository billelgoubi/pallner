import { AppData, UserProfile, DayPlan } from '../types';

const STORAGE_KEY = 'holiday_hero_data_v1';

export const saveAppData = (data: AppData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save data", e);
  }
};

export const getAppData = (): AppData | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error("Failed to load data", e);
    return null;
  }
};

export const clearAppData = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
