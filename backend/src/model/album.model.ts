import { Track } from './track.model';

export interface Album {
  id: string;
  title: string;
  primaryType: string | null;
  firstReleaseDate: string | null;
  artistId: string | null;
  artistName: string | null;
  labelId: string | null;
  labelName: string | null;
  tracks: Track[];
}
