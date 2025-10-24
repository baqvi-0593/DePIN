// Storage helpers with fallbacks for environments where localStorage might not be available

export const isStorageAvailable = (): boolean => {
  try {
    if (typeof window === 'undefined') return false;
    if (typeof localStorage === 'undefined') return false;
    
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const getStorageItem = (key: string): string | null => {
  if (!isStorageAvailable()) return null;
  
  try {
    return localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to get item ${key} from localStorage:`, error);
    return null;
  }
};

export const setStorageItem = (key: string, value: string): boolean => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to set item ${key} in localStorage:`, error);
    return false;
  }
};

export const removeStorageItem = (key: string): boolean => {
  if (!isStorageAvailable()) return false;
  
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Failed to remove item ${key} from localStorage:`, error);
    return false;
  }
};