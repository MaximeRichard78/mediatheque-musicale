export interface Track {
  id: string;
  title: string;
  lengthMs: number | null;
}

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
