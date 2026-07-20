export interface ScoringStrategy {
  score(itemVector: number[]): number;
}
