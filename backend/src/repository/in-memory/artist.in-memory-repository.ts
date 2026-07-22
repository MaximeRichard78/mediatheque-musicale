import { Artist, ArtistType } from '../../model/artist.model';
import { ArtistRepository } from '../artist.repository';
import artistsJson from '../../data/artists.json';

interface RawArtist {
  id: string;
  name: string;
  'sort-name': string;
  type?: string;
  country?: string;
  'life-span'?: { begin?: string; end?: string };
  tags?: { name: string; count: number }[];
}

function toArtist(raw: RawArtist): Artist {
  const genres = (raw.tags ?? [])
    .filter((tag) => tag.count > 0)
    .sort((a, b) => b.count - a.count)
    .map((tag) => tag.name);

  return {
    id: raw.id,
    name: raw.name,
    sortName: raw['sort-name'],
    type: (raw.type as ArtistType) ?? 'Person',
    country: raw.country ?? null,
    genres,
    beginDate: raw['life-span']?.begin ?? null,
    endDate: raw['life-span']?.end ?? null,
  };
}

export class InMemoryArtistRepository implements ArtistRepository {
  private readonly artists: Artist[] = (artistsJson.artists as RawArtist[]).map(toArtist);

  async findAll(): Promise<Artist[]> {
    return this.artists;
  }

  async findById(id: string): Promise<Artist | null> {
    return this.artists.find((artist) => artist.id === id) ?? null;
  }
}
