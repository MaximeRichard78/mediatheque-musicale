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

  useEffect(() => {
    const params = new URLSearchParams();
    if (country) params.set('country', country);

    getJson<Label[]>(`/labels?${params.toString()}`).then(setLabels);
  }, [country]);

  return (
    <div className="space-y-4">
      <input
        className="border px-2 py-1"
        placeholder="Filtrer par pays (ex: GB)"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
      />

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
