import { ScoringStrategy } from './scoring-strategy';

const RELEASE_YEAR_INDEX = 0;

export class RecencyBoostScoringStrategy implements ScoringStrategy {
  constructor(
    private readonly wrapped: ScoringStrategy,
    private readonly boost: number = 0.1,
  ) {}

  score(itemVector: number[]): number {
    const normalizedReleaseYear = itemVector[RELEASE_YEAR_INDEX];
    return this.wrapped.score(itemVector) + normalizedReleaseYear * this.boost;
  }
}
