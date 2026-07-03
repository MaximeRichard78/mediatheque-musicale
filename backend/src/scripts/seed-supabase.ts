import { createClient } from '@supabase/supabase-js';
import { requireSupabaseServiceRoleConfig } from '../config/env';
import { InMemoryAlbumRepository } from '../repository/in-memory/album.in-memory-repository';
import { InMemoryArtistRepository } from '../repository/in-memory/artist.in-memory-repository';
import { InMemoryLabelRepository } from '../repository/in-memory/label.in-memory-repository';

async function main(): Promise<void> {
  const { url, serviceRoleKey } = requireSupabaseServiceRoleConfig();
  const client = createClient(url, serviceRoleKey);

  const artists = await new InMemoryArtistRepository().findAll();
  const labels = await new InMemoryLabelRepository().findAll();
  const albums = await new InMemoryAlbumRepository().findAll();

  const { error: artistsError } = await client.from('artists').upsert(
    artists.map((artist) => ({
      id: artist.id,
      name: artist.name,
      sort_name: artist.sortName,
      type: artist.type,
      country: artist.country,
      genres: artist.genres,
      begin_date: artist.beginDate,
      end_date: artist.endDate,
    })),
  );
  if (artistsError) throw artistsError;

  const { error: labelsError } = await client.from('labels').upsert(
    labels.map((label) => ({
      id: label.id,
      name: label.name,
      type: label.type,
      country: label.country,
      begin_date: label.beginDate,
    })),
  );
  if (labelsError) throw labelsError;

  const labelArtistRows = labels.flatMap((label) =>
    label.artistIds.map((artistId) => ({ label_id: label.id, artist_id: artistId })),
  );
  if (labelArtistRows.length > 0) {
    const { error } = await client
      .from('label_artists')
      .upsert(labelArtistRows, { onConflict: 'label_id,artist_id' });
    if (error) throw error;
  }

  const { error: albumsError } = await client.from('albums').upsert(
    albums.map((album) => ({
      id: album.id,
      title: album.title,
      primary_type: album.primaryType,
      first_release_date: album.firstReleaseDate,
      artist_id: album.artistId,
      label_id: album.labelId,
    })),
  );
  if (albumsError) throw albumsError;

  const trackRows = albums.flatMap((album) =>
    album.tracks.map((track) => ({
      id: track.id,
      album_id: album.id,
      title: track.title,
      length_ms: track.lengthMs,
    })),
  );
  if (trackRows.length > 0) {
    const { error } = await client.from('tracks').upsert(trackRows);
    if (error) throw error;
  }

  console.log(
    `Seed terminé : ${artists.length} artistes, ${labels.length} labels, ${albums.length} albums, ${trackRows.length} pistes.`,
  );
}

main().catch((error) => {
  console.error('Échec du seed Supabase :', error);
  process.exitCode = 1;
});
