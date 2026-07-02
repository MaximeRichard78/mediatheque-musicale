import { Label } from '../../module/label';
import { LabelRepository } from '../label';
import labelsJson from '../../data/labels.json';
import linksJson from '../../data/links.json';

interface RawLabel {
  id: string;
  name: string;
  type?: string;
  country?: string;
  'life-span'?: { begin?: string };
}

interface RawLink {
  artist: { id: string };
  albums: { label?: { id: string } }[];
}

function buildArtistIdsByLabelId(links: RawLink[]): Map<string, Set<string>> {
  const artistIdsByLabelId = new Map<string, Set<string>>();

  for (const link of links) {
    for (const album of link.albums) {
      if (!album.label) continue;
      const artistIds = artistIdsByLabelId.get(album.label.id) ?? new Set<string>();
      artistIds.add(link.artist.id);
      artistIdsByLabelId.set(album.label.id, artistIds);
    }
  }

  return artistIdsByLabelId;
}

function toLabel(raw: RawLabel, artistIds: string[]): Label {
  return {
    id: raw.id,
    name: raw.name,
    type: raw.type ?? null,
    country: raw.country ?? null,
    beginDate: raw['life-span']?.begin ?? null,
    artistIds,
  };
}

export class InMemoryLabelRepository implements LabelRepository {
  private readonly labels: Label[];

  constructor() {
    const artistIdsByLabelId = buildArtistIdsByLabelId(linksJson.links as RawLink[]);

    this.labels = (labelsJson.labels as RawLabel[]).map((raw) =>
      toLabel(raw, Array.from(artistIdsByLabelId.get(raw.id) ?? [])),
    );
  }

  async findAll(): Promise<Label[]> {
    return this.labels;
  }

  async findById(id: string): Promise<Label | null> {
    return this.labels.find((label) => label.id === id) ?? null;
  }
}
