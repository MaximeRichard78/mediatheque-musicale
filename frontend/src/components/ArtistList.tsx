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
      <div className="flex flex-wrap gap-2">
        <input
          className="flex-1 min-w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Filtrer par genre (ex: rock)"
          value={genre}
          onChange={(e) => setGenre(e.target.value)}
        />
        <button
          onClick={() => setSortByGenre((value) => !value)}
          className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
            sortByGenre
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          Trier par genre : {sortByGenre ? 'oui' : 'non'}
        </button>
      </div>

      <ul className="divide-y divide-slate-100">
        {artists.map((artist) => (
          <li key={artist.id} className="flex items-center justify-between gap-3 py-2.5">
            <div>
              <p className="font-semibold">{artist.name}</p>
              <p className="text-xs text-slate-500">
                {artist.genres.slice(0, 3).join(' · ') || 'genre inconnu'}
              </p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">
                {artist.type === 'Group' ? 'Groupe' : 'Solo'}
              </span>
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                {artist.country ?? '?'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
