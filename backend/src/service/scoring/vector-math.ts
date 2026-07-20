export function normalizeMatrix(vectors: number[][]): number[][] {
  if (vectors.length === 0) return [];

  const dimensions = vectors[0].length;
  const mins = new Array(dimensions).fill(Number.POSITIVE_INFINITY);
  const maxs = new Array(dimensions).fill(Number.NEGATIVE_INFINITY);

  for (const vector of vectors) {
    for (let d = 0; d < dimensions; d++) {
      mins[d] = Math.min(mins[d], vector[d]);
      maxs[d] = Math.max(maxs[d], vector[d]);
    }
  }

  return vectors.map((vector) =>
    vector.map((value, d) => {
      const range = maxs[d] - mins[d];
      return range === 0 ? 0 : (value - mins[d]) / range;
    }),
  );
}

export function barycentre(vectors: number[][]): number[] {
  const dimensions = vectors[0].length;
  const sums = new Array(dimensions).fill(0);

  for (const vector of vectors) {
    for (let d = 0; d < dimensions; d++) {
      sums[d] += vector[d];
    }
  }

  return sums.map((sum) => sum / vectors.length);
}

export function euclideanDistance(a: number[], b: number[]): number {
  return Math.sqrt(a.reduce((total, value, index) => total + (value - b[index]) ** 2, 0));
}
