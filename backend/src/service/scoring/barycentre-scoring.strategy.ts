import { ScoringStrategy } from './scoring-strategy';
import { euclideanDistance } from './vector-math';

export class BarycentreScoringStrategy implements ScoringStrategy {
  constructor(private readonly profile: number[]) {}

  score(itemVector: number[]): number {
    return 1 / (1 + euclideanDistance(this.profile, itemVector));
  }
}
