import { Album } from '../module/album';
import { AlbumRepository } from '../repository/album';

function releaseYear(album: Album): number | null {
  if (!album.firstReleaseDate) return null;
  const year = Number.parseInt(album.firstReleaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function era(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

export class AlbumService {
  constructor(private readonly albumRepository: AlbumRepository) {}

  async getAll(): Promise<Album[]> {
    return this.albumRepository.findAll();
  }

  async getById(id: string): Promise<Album | null> {
    return this.albumRepository.findById(id);
  }

  async sortByReleaseYear(order: 'asc' | 'desc' = 'asc'): Promise<Album[]> {
    const albums = await this.albumRepository.findAll();

    return [...albums].sort((a, b) => {
      const yearA = releaseYear(a) ?? 0;
      const yearB = releaseYear(b) ?? 0;
      return order === 'asc' ? yearA - yearB : yearB - yearA;
    });
  }

  async groupByEra(): Promise<Record<string, Album[]>> {
    const albums = await this.albumRepository.findAll();
    const groups: Record<string, Album[]> = {};

    for (const album of albums) {
      const year = releaseYear(album);
      const key = year === null ? 'unknown' : era(year);
      groups[key] = groups[key] ?? [];
      groups[key].push(album);
    }

    return groups;
  }
}
