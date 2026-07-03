import { SupabaseClient } from '@supabase/supabase-js';
import { Artist, ArtistType } from '../../model/artist.model';
import { ArtistRepository } from '../artist.repository';

interface ArtistRow {
  id: string;
  name: string;
  sort_name: string;
  type: string;
  country: string | null;
  genres: string[];
  begin_date: string | null;
  end_date: string | null;
}

function toArtist(row: ArtistRow): Artist {
  return {
    id: row.id,
    name: row.name,
    sortName: row.sort_name,
    type: row.type as ArtistType,
    country: row.country,
    genres: row.genres,
    beginDate: row.begin_date,
    endDate: row.end_date,
  };
}

export class SupabaseArtistRepository implements ArtistRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findAll(): Promise<Artist[]> {
    const { data, error } = await this.client.from('artists').select('*');
    if (error) throw error;

    return (data as ArtistRow[]).map(toArtist);
  }

  async findById(id: string): Promise<Artist | null> {
    const { data, error } = await this.client
      .from('artists')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;

    return data ? toArtist(data as ArtistRow) : null;
  }
}
