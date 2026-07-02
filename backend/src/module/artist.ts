export type ArtistType = 'Person' | 'Group';

export interface Artist {
  id: string;
  name: string;
  sortName: string;
  type: ArtistType;
  country: string | null;
  genres: string[];
  beginDate: string | null;
  endDate: string | null;
}
