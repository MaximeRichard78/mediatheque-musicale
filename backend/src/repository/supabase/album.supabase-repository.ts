import { SupabaseClient } from '@supabase/supabase-js';
import { Album } from '../../model/album.model';
import { AlbumRepository } from '../album.repository';

const ALBUM_SELECT = '*, artist:artists(name), label:labels(name), tracks(*)';

interface AlbumRow {
  id: string;
  title: string;
  primary_type: string | null;
  first_release_date: string | null;
  artist_id: string | null;
  label_id: string | null;
  artist: { name: string } | null;
  label: { name: string } | null;
  tracks: { id: string; title: string; length_ms: number | null }[];
}

function toAlbum(row: AlbumRow): Album {
  return {
    id: row.id,
    title: row.title,
    primaryType: row.primary_type,
    firstReleaseDate: row.first_release_date,
    artistId: row.artist_id,
    artistName: row.artist?.name ?? null,
    labelId: row.label_id,
    labelName: row.label?.name ?? null,
    tracks: row.tracks.map((track) => ({
      id: track.id,
      title: track.title,
      lengthMs: track.length_ms,
    })),
  };
}

export class SupabaseAlbumRepository implements AlbumRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAll(): Promise<Album[]> {
    const { data, error } = await this.client.from('albums').select(ALBUM_SELECT);
    if (error) throw error;

    return (data as unknown as AlbumRow[]).map(toAlbum);
  }

  async findById(id: string): Promise<Album | null> {
    const { data, error } = await this.client
      .from('albums')
      .select(ALBUM_SELECT)
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;

    return data ? toAlbum(data as unknown as AlbumRow) : null;
  }
}
