import { describe, expect, it } from 'vitest';
import { Album } from '../model/album.model';
import { AlbumRepository } from '../repository/album.repository';
import { AlbumService } from './album.service';

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
