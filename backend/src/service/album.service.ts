import { Album } from '../model/album.model';
import { AlbumRepository } from '../repository/album.repository';
import { toAlbumVector } from './scoring/album-vector';
import { BarycentreScoringStrategy } from './scoring/barycentre-scoring.strategy';
import { ScoringStrategy } from './scoring/scoring-strategy';
import { barycentre, normalizeMatrix } from './scoring/vector-math';

export function releaseYear(album: Album): number | null {
  if (!album.firstReleaseDate) return null;
  const year = Number.parseInt(album.firstReleaseDate.slice(0, 4), 10);
  return Number.isNaN(year) ? null : year;
}

function era(year: number): string {
  const decade = Math.floor(year / 10) * 10;
  return `${decade}s`;
}

type ScoringStrategyFactory = (profile: number[]) => ScoringStrategy;

const defaultScoringStrategyFactory: ScoringStrategyFactory = (profile) =>
  new BarycentreScoringStrategy(profile);

export class AlbumService {
  constructor(
    private readonly albumRepository: AlbumRepository,
    private readonly createScoringStrategy: ScoringStrategyFactory = defaultScoringStrategyFactory,
  ) {}

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

  async recommend(favoriteIds: string[]): Promise<Album[]> {
    const albums = await this.albumRepository.findAll();

    // vectorisation : chaque album devient un point à 4 dimensions, puis on normalise (0-1)
    const vectors = albums.map(toAlbumVector);
    const normalizedVectors = normalizeMatrix(vectors);

    const favoriteVectors = albums
      .map((album, index) => ({ album, vector: normalizedVectors[index] }))
      .filter(({ album }) => favoriteIds.includes(album.id))
      .map(({ vector }) => vector);

    if (favoriteVectors.length === 0) return [];

    // profil : barycentre (moyenne attribut par attribut) des favoris
    const profile = barycentre(favoriteVectors);
    const strategy = this.createScoringStrategy(profile);

    // filtre : on ne recommande pas ce que l'utilisateur a déjà en favori
    const candidates = albums
      .map((album, index) => ({ album, vector: normalizedVectors[index] }))
      .filter(({ album }) => !favoriteIds.includes(album.id));

    // score : chaque candidat est noté par la stratégie de scoring choisie
    const scored = candidates.map(({ album, vector }) => ({
      album,
      score: strategy.score(vector),
    }));

    // tri : du plus pertinent au moins pertinent
    return scored.sort((a, b) => b.score - a.score).map(({ album }) => album);
  }
}
