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
    <div className="space-y-4">
      <div>
        <h2 className="font-bold">Mes favoris ({favoriteAlbums.length})</h2>
        {favoriteAlbums.length === 0 ? (
          <p>
            Aucun favori pour l'instant : marque des albums en cliquant sur ♡ dans l'onglet Albums.
          </p>
        ) : (
          <ul className="space-y-1">
            {favoriteAlbums.map((album) => (
              <li key={album.id}>
                {album.title} ({album.firstReleaseDate ?? '?'})
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex gap-2 items-center">
        <label className="flex items-center gap-1">
          <input
            type="checkbox"
            checked={boostRecent}
            onChange={(e) => setBoostRecent(e.target.checked)}
          />
          booster les albums récents
        </label>
        <button
          className="border px-2 py-1"
          disabled={favoriteAlbums.length === 0}
          onClick={handleRecommend}
        >
          Voir mes recommandations
        </button>
      </div>

      {hasSearched && (
        <div>
          <h2 className="font-bold">Recommandations</h2>
          <ul className="space-y-1">
            {recommendations.map((album) => (
              <li key={album.id}>
                <strong>{album.title}</strong> ({album.firstReleaseDate ?? '?'}) —{' '}
                {album.artistName ?? '?'} / {album.labelName ?? '?'}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
