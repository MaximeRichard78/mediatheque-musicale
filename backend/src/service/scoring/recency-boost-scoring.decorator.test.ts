import { describe, expect, it } from 'vitest';
import { ScoringStrategy } from './scoring-strategy';
import { RecencyBoostScoringStrategy } from './recency-boost-scoring.decorator';

class FixedScoringStrategy implements ScoringStrategy {
  constructor(private readonly fixedScore: number) {}

  score(): number {
    return this.fixedScore;
  }
}

describe('RecencyBoostScoringStrategy', () => {
  it("ajoute un bonus proportionnel à l'année de sortie normalisée, sans modifier la stratégie enveloppée", () => {
    const decorated = new RecencyBoostScoringStrategy(new FixedScoringStrategy(0.5), 0.2);

    // releaseYear normalisé = 1 (index 0 du vecteur) => bonus = 0.2 * 1 = 0.2
    expect(decorated.score([1, 0, 0, 0])).toBeCloseTo(0.7);
    // releaseYear normalisé = 0 => aucun bonus
    expect(decorated.score([0, 0, 0, 0])).toBeCloseTo(0.5);
  });

  it('peut envelopper n’importe quelle stratégie sans la modifier', () => {
    const base = new FixedScoringStrategy(1);
    const boosted = new RecencyBoostScoringStrategy(base, 0.5);

    expect(base.score()).toBe(1);
    expect(boosted.score([0.5, 0, 0, 0])).toBeCloseTo(1.25);
  });
});
