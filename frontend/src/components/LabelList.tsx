import { useEffect, useState } from 'react';
import { getJson } from '../api/client';

interface Label {
  id: string;
  name: string;
  country: string | null;
}

export function LabelList() {
  const [labels, setLabels] = useState<Label[]>([]);
  const [country, setCountry] = useState('');
  const [partial, setPartial] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams();
    if (country) params.set(partial ? 'search' : 'country', country);

    getJson<Label[]>(`/labels?${params.toString()}`).then(setLabels);
  }, [country, partial]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input
          className="flex-1 min-w-40 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="Filtrer par pays (ex: GB)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <label className="flex items-center gap-1.5 text-sm text-slate-600">
          <input
            type="checkbox"
            checked={partial}
            onChange={(e) => setPartial(e.target.checked)}
            className="rounded accent-indigo-600"
          />
          recherche partielle
        </label>
      </div>

      <ul className="divide-y divide-slate-100">
        {labels.map((label) => (
          <li key={label.id} className="flex items-center justify-between py-2.5">
            <p className="font-semibold">{label.name}</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              {label.country ?? '?'}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
