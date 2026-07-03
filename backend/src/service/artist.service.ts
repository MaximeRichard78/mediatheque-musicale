import { Artist } from '../model/artist.model';
import { ArtistRepository } from '../repository/artist.repository';

export class ArtistService {
  constructor(private readonly artistRepository: ArtistRepository) {}

  async getAll(): Promise<Artist[]> {
    return this.artistRepository.findAll();
  }

  async getById(id: string): Promise<Artist | null> {
    return this.artistRepository.findById(id);
  }

  async filterByGenre(genre: string): Promise<Artist[]> {
    const artists = await this.artistRepository.findAll();
    const target = genre.toLowerCase();

    return artists.filter((artist) => artist.genres.some((g) => g.toLowerCase() === target));
  }

  async sortByGenre(): Promise<Artist[]> {
    const artists = await this.artistRepository.findAll();

    return [...artists].sort((a, b) => {
      const genreA = a.genres[0] ?? '';
      const genreB = b.genres[0] ?? '';
      return genreA.localeCompare(genreB) || a.name.localeCompare(b.name);
    });
  }
}
