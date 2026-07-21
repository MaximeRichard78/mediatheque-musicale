import { useState } from 'react';
import { AlbumList } from './components/AlbumList';
import { ArtistList } from './components/ArtistList';
import { LabelList } from './components/LabelList';

type Tab = 'artists' | 'albums' | 'labels';

function App() {
  const [tab, setTab] = useState<Tab>('artists');

  return (
    <main className="max-w-2xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold">Médiathèque musicale</h1>

      <nav className="flex gap-2">
        <button className="border px-2 py-1" onClick={() => setTab('artists')}>
          Artistes
        </button>
        <button className="border px-2 py-1" onClick={() => setTab('albums')}>
          Albums
        </button>
        <button className="border px-2 py-1" onClick={() => setTab('labels')}>
          Labels
        </button>
      </nav>

      {tab === 'artists' && <ArtistList />}
      {tab === 'albums' && <AlbumList />}
      {tab === 'labels' && <LabelList />}
    </main>
  );
}

export default App;
