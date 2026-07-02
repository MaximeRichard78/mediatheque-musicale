import { Album, Track } from '../../module/album';
import { AlbumRepository } from '../album';
import linksJson from '../../data/links.json';
import recordingsJson from '../../data/recordings.json';
import releaseGroupsJson from '../../data/release-groups.json';

interface RawLinkRecording {
  id: string;
  title: string;
}

interface RawLinkAlbum {
  'release-group': { id: string; title: string };
  release: { id: string; title: string; date?: string };
  label?: { id: string; name: string };
  recordings: RawLinkRecording[];
}

interface RawLink {
  artist: { id: string; name: string };
  albums: RawLinkAlbum[];
}

interface RawRecording {
  id: string;
  length?: number;
}

interface RawReleaseGroup {
  id: string;
  'primary-type'?: string;
}

function toTrack(raw: RawLinkRecording, lengthById: Map<string, number>): Track {
  return {
    id: raw.id,
    title: raw.title,
    lengthMs: lengthById.get(raw.id) ?? null,
  };
}

function toAlbum(
  link: RawLink,
  album: RawLinkAlbum,
  lengthById: Map<string, number>,
  primaryTypeById: Map<string, string>,
): Album {
  const releaseGroup = album['release-group'];

  return {
    id: releaseGroup.id,
    title: releaseGroup.title,
    primaryType: primaryTypeById.get(releaseGroup.id) ?? null,
    firstReleaseDate: album.release.date ?? null,
    artistId: link.artist.id,
    artistName: link.artist.name,
    labelId: album.label?.id ?? null,
    labelName: album.label?.name ?? null,
    tracks: album.recordings.map((recording) => toTrack(recording, lengthById)),
  };
}

export class InMemoryAlbumRepository implements AlbumRepository {
  private readonly albums: Album[];

  constructor() {
    const lengthById = new Map<string, number>(
      (recordingsJson.recordings as RawRecording[])
        .filter((recording) => recording.length !== undefined)
        .map((recording) => [recording.id, recording.length as number]),
    );

    const primaryTypeById = new Map<string, string>(
      (releaseGroupsJson['release-groups'] as RawReleaseGroup[])
        .filter((releaseGroup) => releaseGroup['primary-type'] !== undefined)
        .map((releaseGroup) => [releaseGroup.id, releaseGroup['primary-type'] as string]),
    );

    this.albums = (linksJson.links as RawLink[]).flatMap((link) =>
      link.albums.map((album) => toAlbum(link, album, lengthById, primaryTypeById)),
    );
  }

  async findAll(): Promise<Album[]> {
    return this.albums;
  }

  async findById(id: string): Promise<Album | null> {
    return this.albums.find((album) => album.id === id) ?? null;
  }
}
