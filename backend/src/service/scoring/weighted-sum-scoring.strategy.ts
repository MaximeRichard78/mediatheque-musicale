import { ScoringStrategy } from './scoring-strategy';

export class WeightedSumScoringStrategy implements ScoringStrategy {
  constructor(private readonly weights: number[]) {}

  score(itemVector: number[]): number {
    return itemVector.reduce((total, value, index) => total + value * this.weights[index], 0);
  }
}
