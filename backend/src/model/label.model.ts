export interface Label {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  beginDate: string | null;
  artistIds: string[];
}
