import { useEffect, useState } from 'react';
import { getJson, postJson } from '../api/client';
import { getFavoriteIds } from '../favorites';

interface Album {
  id: string;
  title: string;
  firstReleaseDate: string | null;
  artistName: string | null;
  labelName: string | null;
}

export function RecommendationList() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [favoriteAlbums, setFavoriteAlbums] = useState<Album[]>([]);
  const [recommendations, setRecommendations] = useState<Album[]>([]);
  const [boostRecent, setBoostRecent] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const ids = getFavoriteIds();
    setFavoriteIds(ids);
    getJson<Album[]>('/albums').then((albums) =>
      setFavoriteAlbums(albums.filter((album) => ids.includes(album.id))),
    );
  }, []);

  async function handleRecommend() {
    const results = await postJson<Album[]>(`/albums/recommendations?boostRecent=${boostRecent}`, {
      favoriteIds,
    });
    setRecommendations(results);
    setHasSearched(true);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
          Mes favoris ({favoriteAlbums.length})
        </h2>
        {favoriteAlbums.length === 0 ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Aucun favori pour l'instant : marque des albums en cliquant sur ♡ dans l'onglet Albums.
          </p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {favoriteAlbums.map((album) => (
              <li
                key={album.id}
                className="rounded-full bg-rose-50 px-3 py-1 text-sm text-rose-700"
              >
                ♥ {album.title} ({album.firstReleaseDate ?? '?'})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-4">
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={boostRecent}
            onChange={(e) => setBoostRecent(e.target.checked)}
            className="rounded accent-indigo-600"
          />
          booster les albums récents
        </label>
        <button
          className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          disabled={favoriteAlbums.length === 0}
          onClick={handleRecommend}
        >
          Voir mes recommandations
        </button>
      </div>

      {hasSearched && (
        <div>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-indigo-600">
            Recommandations
          </h2>
          <ul className="divide-y divide-slate-100">
            {recommendations.map((album, index) => (
              <li key={album.id} className="flex items-center gap-3 py-2.5">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{album.title}</p>
                  <p className="text-xs text-slate-500">
                    {album.firstReleaseDate ?? '?'} · {album.artistName ?? '?'} /{' '}
                    {album.labelName ?? '?'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
