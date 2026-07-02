import { Artist } from '../module/artist';

export interface ArtistRepository {
  findAll(): Promise<Artist[]>;
  findById(id: string): Promise<Artist | null>;
}
