import { Album } from '../../model/album.model';
import { releaseYear } from '../album.service';

export const ALBUM_VECTOR_ATTRIBUTES = [
  'releaseYear',
  'trackCount',
  'averageTrackLengthMs',
  'totalDurationMs',
] as const;

export function toAlbumVector(album: Album): number[] {
  const knownLengths = album.tracks
    .map((track) => track.lengthMs)
    .filter((length): length is number => length !== null);

  const totalDurationMs = knownLengths.reduce((total, length) => total + length, 0);
  const averageTrackLengthMs = knownLengths.length > 0 ? totalDurationMs / knownLengths.length : 0;

  return [releaseYear(album) ?? 0, album.tracks.length, averageTrackLengthMs, totalDurationMs];
}
