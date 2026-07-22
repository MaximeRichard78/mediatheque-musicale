import { describe, expect, it } from 'vitest';
import { Album } from '../model/album.model';
import { Track } from '../model/track.model';
import { AlbumRepository } from '../repository/album.repository';
import { AlbumService } from './album.service';
import { WeightedSumScoringStrategy } from './scoring/weighted-sum-scoring.strategy';

function makeAlbum(overrides: Partial<Album>): Album {
  return {
    id: 'id',
    title: 'title',
    primaryType: 'Album',
    firstReleaseDate: null,
    artistId: null,
    artistName: null,
    labelId: null,
    labelName: null,
    tracks: [],
    ...overrides,
  };
}

function makeTracks(count: number, lengthMs: number): Track[] {
  return Array.from({ length: count }, (_, index) => ({
    id: `t${index}`,
    title: `Track ${index}`,
    lengthMs,
  }));
}

class FakeAlbumRepository implements AlbumRepository {
  constructor(private readonly albums: Album[]) {}

  async findAll(): Promise<Album[]> {
    return this.albums;
  }

  async findById(id: string): Promise<Album | null> {
    return this.albums.find((album) => album.id === id) ?? null;
  }
}

describe('AlbumService', () => {
  const albums = [
    makeAlbum({ id: '1', title: 'Abbey Road', firstReleaseDate: '1969-09-26' }),
    makeAlbum({ id: '2', title: 'A Night at the Opera', firstReleaseDate: '1975-11-21' }),
    makeAlbum({ id: '3', title: 'Thriller', firstReleaseDate: '1982-11-30' }),
  ];
  const service = new AlbumService(new FakeAlbumRepository(albums));

  it('sorts albums by release year ascending', async () => {
    const sorted = await service.sortByReleaseYear('asc');

    expect(sorted.map((album) => album.id)).toEqual(['1', '2', '3']);
  });

  it('sorts albums by release year descending', async () => {
    const sorted = await service.sortByReleaseYear('desc');

    expect(sorted.map((album) => album.id)).toEqual(['3', '2', '1']);
  });

  it('groups albums by era', async () => {
    const groups = await service.groupByEra();

    expect(Object.keys(groups).sort()).toEqual(['1960s', '1970s', '1980s']);
    expect(groups['1960s']).toHaveLength(1);
  });

  it('finds an album by id', async () => {
    const album = await service.getById('2');

    expect(album?.title).toBe('A Night at the Opera');
  });
});

describe('AlbumService.recommend', () => {
  const catalog = [
    makeAlbum({ id: 'old-short', firstReleaseDate: '1970', tracks: makeTracks(5, 200_000) }),
    makeAlbum({ id: 'mid', firstReleaseDate: '1990', tracks: makeTracks(8, 250_000) }),
    makeAlbum({ id: 'new-long', firstReleaseDate: '2010', tracks: makeTracks(12, 400_000) }),
    makeAlbum({ id: 'newer-longer', firstReleaseDate: '2020', tracks: makeTracks(15, 450_000) }),
  ];
  const service = new AlbumService(new FakeAlbumRepository(catalog));

  it('exclut du classement les albums déjà en favori (étape filtre)', async () => {
    const recommendations = await service.recommend(['old-short']);

    expect(recommendations.map((album) => album.id)).not.toContain('old-short');
  });

  it('renvoie un classement vide si aucun favori ne correspond à un album du catalogue', async () => {
    const recommendations = await service.recommend(['id-inconnu']);

    expect(recommendations).toEqual([]);
  });

  it('deux profils différents donnent deux classements différents (barycentre)', async () => {
    const recommendationsForOldFan = await service.recommend(['old-short']);
    const recommendationsForNewFan = await service.recommend(['newer-longer']);

    expect(recommendationsForOldFan.map((album) => album.id)).not.toEqual(
      recommendationsForNewFan.map((album) => album.id),
    );
    // le fan de "old-short" doit se voir recommander "mid" (le plus proche) en premier
    expect(recommendationsForOldFan[0].id).toBe('mid');
    // le fan de "newer-longer" doit se voir recommander "new-long" (le plus proche) en premier
    expect(recommendationsForNewFan[0].id).toBe('new-long');
  });

  it('deux stratégies de scoring différentes donnent deux classements différents pour le même profil', async () => {
    const withBarycentre = await service.recommend(['old-short']);

    const serviceWithWeightedSum = new AlbumService(
      new FakeAlbumRepository(catalog),
      () => new WeightedSumScoringStrategy([1, 1, 1, 1]),
    );
    const withWeightedSum = await serviceWithWeightedSum.recommend(['old-short']);

    expect(withBarycentre.map((album) => album.id)).not.toEqual(
      withWeightedSum.map((album) => album.id),
    );
  });

  it('boostRecent avantage les albums récents (decorator)', async () => {
    const withoutBoost = await service.recommend(['old-short'], false);
    const withBoost = await service.recommend(['old-short'], true);

    expect(withoutBoost.map((album) => album.id)).not.toEqual(withBoost.map((album) => album.id));

    // avec le boost, l'album le plus récent doit remonter dans le classement
    const rankWithoutBoost = withoutBoost.findIndex((album) => album.id === 'newer-longer');
    const rankWithBoost = withBoost.findIndex((album) => album.id === 'newer-longer');
    expect(rankWithBoost).toBeLessThan(rankWithoutBoost);
  });
});
