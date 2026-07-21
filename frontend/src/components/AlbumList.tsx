import { useEffect, useState } from 'react';
import { getJson } from '../api/client';

interface Album {
  id: string;
  title: string;
  firstReleaseDate: string | null;
  artistName: string | null;
  labelName: string | null;
}

export function AlbumList() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  useEffect(() => {
    getJson<Album[]>(`/albums?sort=year&order=${order}`).then(setAlbums);
  }, [order]);

  return (
    <div className="space-y-4">
      <button
        className="border px-2 py-1"
        onClick={() => setOrder((value) => (value === 'asc' ? 'desc' : 'asc'))}
      >
        Tri par année : {order === 'asc' ? 'croissant' : 'décroissant'}
      </button>

      <ul className="space-y-1">
        {albums.map((album) => (
          <li key={album.id}>
            <strong>{album.title}</strong> ({album.firstReleaseDate ?? '?'}) —{' '}
            {album.artistName ?? '?'} / {album.labelName ?? '?'}
          </li>
        ))}
      </ul>
    </div>
  );
}
