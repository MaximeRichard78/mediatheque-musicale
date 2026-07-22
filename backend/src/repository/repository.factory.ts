import { env } from '../config/env';
import { AlbumRepository } from './album.repository';
import { ArtistRepository } from './artist.repository';
import { LabelRepository } from './label.repository';

export interface Repositories {
  artistRepository: ArtistRepository;
  albumRepository: AlbumRepository;
  labelRepository: LabelRepository;
}

type RepositoriesBuilder = () => Repositories;

export class RepositoryFactory {
  private static registry = new Map<string, RepositoriesBuilder>();

  // On enregistre une implémentation ici, ailleurs dans le code (voir repository.registrations.ts).
  // La Factory n'a pas besoin d'être modifiée pour ajouter une nouvelle source de données.
  static register(dataSource: string, builder: RepositoriesBuilder): void {
    RepositoryFactory.registry.set(dataSource, builder);
  }

  static create(): Repositories {
    const builder = RepositoryFactory.registry.get(env.dataSource);

    if (!builder) {
      throw new Error(`Aucune implémentation enregistrée pour DATA_SOURCE="${env.dataSource}"`);
    }

    return builder();
  }
}
