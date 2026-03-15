export function useLocalStorage() {
  const getLocalStorageItem = (key: string): string | null => {
    return localStorage.getItem(key) || null;
  };

  const setLocalStorageItem = (key: string, value: any): void => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const removeLocalStorageItem = (key: string): void => {
    localStorage.removeItem(key);
  };

  return { getLocalStorageItem, setLocalStorageItem, removeLocalStorageItem };
}
