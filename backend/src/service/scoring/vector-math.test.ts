import { describe, expect, it } from 'vitest';
import { barycentre, euclideanDistance, normalizeMatrix } from './vector-math';

describe('normalizeMatrix', () => {
  it('ramène chaque attribut entre 0 et 1', () => {
    const normalized = normalizeMatrix([
      [0, 100],
      [5, 200],
      [10, 300],
    ]);

    expect(normalized).toEqual([
      [0, 0],
      [0.5, 0.5],
      [1, 1],
    ]);
  });

  it('renvoie 0 quand min et max sont identiques (colonne constante)', () => {
    const normalized = normalizeMatrix([
      [7, 1],
      [7, 2],
    ]);

    expect(normalized[0][0]).toBe(0);
    expect(normalized[1][0]).toBe(0);
  });
});

describe('barycentre', () => {
  it('calcule la moyenne attribut par attribut', () => {
    expect(
      barycentre([
        [0, 1],
        [1, 0],
      ]),
    ).toEqual([0.5, 0.5]);
  });
});

describe('euclideanDistance', () => {
  it('vaut 0 pour deux vecteurs identiques', () => {
    expect(euclideanDistance([1, 2, 3], [1, 2, 3])).toBe(0);
  });

  it('applique la formule √(Σ(pᵢ-bᵢ)²)', () => {
    expect(euclideanDistance([0, 0], [3, 4])).toBe(5);
  });
});
