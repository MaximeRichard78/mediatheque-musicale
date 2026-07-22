import { useState } from 'react';
import { AlbumList } from './components/AlbumList';
import { ArtistList } from './components/ArtistList';
import { LabelList } from './components/LabelList';
import { RecommendationList } from './components/RecommendationList';

type Tab = 'artists' | 'albums' | 'labels' | 'recommendations';

const TABS: { id: Tab; label: string }[] = [
  { id: 'artists', label: 'Artistes' },
  { id: 'albums', label: 'Albums' },
  { id: 'labels', label: 'Labels' },
  { id: 'recommendations', label: 'Recommandations' },
];

function App() {
  const [tab, setTab] = useState<Tab>('artists');

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 text-slate-900">
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <header className="space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-indigo-700">
            🎵 Médiathèque musicale
          </h1>
          <p className="text-sm text-slate-500">
            Catalogue MusicBrainz — tri, filtres et recommandations par barycentre.
          </p>
        </header>

        <nav className="flex flex-wrap gap-2">
          {TABS.map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                tab === item.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
          {tab === 'artists' && <ArtistList />}
          {tab === 'albums' && <AlbumList />}
          {tab === 'labels' && <LabelList />}
          {tab === 'recommendations' && <RecommendationList />}
        </section>
      </main>
    </div>
  );
}

export default App;
