import { useEffect, useState } from 'react';
import { getJson } from '../api/client';
import { getFavoriteIds, toggleFavorite } from '../favorites';

interface Album {
  id: string;
  title: string;
  firstReleaseDate: string | null;
  artistName: string | null;
  labelName: string | null;
}

function AlbumRow({
  album,
  isFavorite,
  onToggleFavorite,
}: {
  album: Album;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <li className="flex items-center gap-3 py-2.5">
      <button
        onClick={() => onToggleFavorite(album.id)}
        className={`text-lg transition-transform hover:scale-110 ${
          isFavorite ? 'text-rose-500' : 'text-slate-300'
        }`}
        aria-label="Marquer en favori"
      >
        {isFavorite ? '♥' : '♡'}
      </button>
      <div className="min-w-0">
        <p className="font-semibold truncate">{album.title}</p>
        <p className="text-xs text-slate-500">
          {album.firstReleaseDate ?? '?'} · {album.artistName ?? '?'} · {album.labelName ?? '?'}
        </p>
      </div>
    </li>
  );
}

export function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [groups, setGroups] = useState<Record<string, Album[]> | null>(null);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');
  const [groupByEra, setGroupByEra] = useState(false);
  const [favoriteIds, setFavoriteIds] = useState<string[]>(getFavoriteIds());

  useEffect(() => {
    if (groupByEra) {
      getJson<Record<string, Album[]>>('/albums?group=era').then(setGroups);
    } else {
      getJson<Album[]>(`/albums?sort=year&order=${order}`).then(setAlbums);
    }
  }, [order, groupByEra]);

  function handleToggleFavorite(id: string) {
    setFavoriteIds(toggleFavorite(id));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button
          className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-200"
          onClick={() => setOrder((value) => (value === 'asc' ? 'desc' : 'asc'))}
        >
          Tri par année : {order === 'asc' ? 'croissant ↑' : 'décroissant ↓'}
        </button>
        <button
          onClick={() => setGroupByEra((value) => !value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            groupByEra
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Grouper par époque : {groupByEra ? 'oui' : 'non'}
        </button>
      </div>

      {groupByEra ? (
        Object.entries(groups ?? {}).map(([era, eraAlbums]) => (
          <div key={era}>
            <h2 className="mt-3 mb-1 text-sm font-bold uppercase tracking-wide text-indigo-600">
              {era}
            </h2>
            <ul className="divide-y divide-slate-100">
              {eraAlbums.map((album) => (
                <AlbumRow
                  key={album.id}
                  album={album}
                  isFavorite={favoriteIds.includes(album.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </ul>
          </div>
        ))
      ) : (
        <ul className="divide-y divide-slate-100">
          {albums.map((album) => (
            <AlbumRow
              key={album.id}
              album={album}
              isFavorite={favoriteIds.includes(album.id)}
              onToggleFavorite={handleToggleFavorite}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
