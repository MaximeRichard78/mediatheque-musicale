const STORAGE_KEY = 'favoriteAlbumIds';

export function getFavoriteIds(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function toggleFavorite(id: string): string[] {
  const current = getFavoriteIds();
  const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}
