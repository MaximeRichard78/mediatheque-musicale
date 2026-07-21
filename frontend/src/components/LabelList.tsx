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
      <div className="flex gap-2">
        <input
          className="border px-2 py-1"
          placeholder="Filtrer par pays (ex: GB)"
          value={country}
          onChange={(e) => setCountry(e.target.value)}
        />
        <label className="flex items-center gap-1">
          <input type="checkbox" checked={partial} onChange={(e) => setPartial(e.target.checked)} />
          recherche partielle
        </label>
      </div>

      <ul className="space-y-1">
        {labels.map((label) => (
          <li key={label.id}>
            <strong>{label.name}</strong> ({label.country ?? '?'})
          </li>
        ))}
      </ul>
    </div>
  );
}
