import { SupabaseClient } from '@supabase/supabase-js';
import { Label } from '../../model/label.model';
import { LabelRepository } from '../label.repository';

interface LabelRow {
  id: string;
  name: string;
  type: string | null;
  country: string | null;
  begin_date: string | null;
}

function toLabel(row: LabelRow, artistIds: string[]): Label {
  return {
    id: row.id,
    name: row.name,
    type: row.type,
    country: row.country,
    beginDate: row.begin_date,
    artistIds,
  };
}

export class SupabaseLabelRepository implements LabelRepository {
  constructor(private readonly client: SupabaseClient) {}

  private async findArtistIdsByLabelId(labelIds: string[]): Promise<Map<string, string[]>> {
    if (labelIds.length === 0) return new Map();

    const { data, error } = await this.client
      .from('label_artists')
      .select('label_id, artist_id')
      .in('label_id', labelIds);
    if (error) throw error;

    const artistIdsByLabelId = new Map<string, string[]>();
    for (const row of data ?? []) {
      const artistIds = artistIdsByLabelId.get(row.label_id) ?? [];
      artistIds.push(row.artist_id);
      artistIdsByLabelId.set(row.label_id, artistIds);
    }

    return artistIdsByLabelId;
  }

  async findAll(): Promise<Label[]> {
    const { data, error } = await this.client.from('labels').select('*');
    if (error) throw error;

    const rows = data as LabelRow[];
    const artistIdsByLabelId = await this.findArtistIdsByLabelId(rows.map((row) => row.id));

    return rows.map((row) => toLabel(row, artistIdsByLabelId.get(row.id) ?? []));
  }

  async findById(id: string): Promise<Label | null> {
    const { data, error } = await this.client
      .from('labels')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    const artistIdsByLabelId = await this.findArtistIdsByLabelId([id]);
    return toLabel(data as LabelRow, artistIdsByLabelId.get(id) ?? []);
  }
}
