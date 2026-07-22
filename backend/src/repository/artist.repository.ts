import { Artist } from '../model/artist.model';

export interface ArtistRepository {
  findAll(): Promise<Artist[]>;
  findById(id: string): Promise<Artist | null>;
}
