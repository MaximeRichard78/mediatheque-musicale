import { Album } from '../module/album';

export interface AlbumRepository {
  findAll(): Promise<Album[]>;
  findById(id: string): Promise<Album | null>;
}
