import { useEffect, useState } from 'react';
import { getJson } from '../api/client';

interface Artist {
  id: string;
  name: string;
  type: 'Person' | 'Group';
  country: string | null;
  genres: string[];
}

export function ArtistList() {
  const [artists, setArtists] = useState<Artist[]>([]);
  const [genre, setGenre] = useState('');
  const [sortByGenre, setSortByGenre] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (genre) params.set('genre', genre);
    if (sortByGenre) params.set('sort', 'genre');

    getJson<Artist[]>(`/artists?${params.toString()}`).then(setArtists);
  }, [genre, sortByGenre]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          className="border px-2 py-1"
          placeholder="Filtrer par genre (ex: rock)"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <button className="border px-2 py-1" onClick={() => setSortByGenre((value) => !value)}>
          Trier par genre : {sortByGenre ? 'oui' : 'non'}
        </button>
      </div>

      <ul className="space-y-1">
        {artists.map((artist) => (
          <li key={artist.id}>
            <strong>{artist.name}</strong> ({artist.type}, {artist.country ?? '?'}) —{' '}
            {artist.genres.slice(0, 3).join(', ')}
          </li>
        ))}
      </ul>
    </div>
  );
}
