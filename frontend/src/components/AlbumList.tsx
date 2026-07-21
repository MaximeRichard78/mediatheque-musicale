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
    <li>
      <button onClick={() => onToggleFavorite(album.id)}>{isFavorite ? '♥' : '♡'}</button>{' '}
      <strong>{album.title}</strong> ({album.firstReleaseDate ?? '?'}) — {album.artistName ?? '?'} /{' '}
      {album.labelName ?? '?'}
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
      <div className="flex gap-2">
        <button
          className="border px-2 py-1"
          onClick={() => setOrder((value) => (value === 'asc' ? 'desc' : 'asc'))}
        >
          Tri par année : {order === 'asc' ? 'croissant' : 'décroissant'}
        </button>
        <button className="border px-2 py-1" onClick={() => setGroupByEra((value) => !value)}>
          Grouper par époque : {groupByEra ? 'oui' : 'non'}
        </button>
      </div>

      {groupByEra ? (
        Object.entries(groups ?? {}).map(([era, eraAlbums]) => (
          <div key={era}>
            <h2 className="font-bold">{era}</h2>
            <ul className="space-y-1">
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
        <ul className="space-y-1">
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
