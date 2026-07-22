import { Album } from '../model/album.model';

export interface AlbumRepository {
  findAll(): Promise<Album[]>;
  findById(id: string): Promise<Album | null>;
}
