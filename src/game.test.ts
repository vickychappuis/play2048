import { describe, expect, it } from 'vitest';
import { applyMove, Grid } from './game.js';

const gridFromRows = (rows: number[][]): Grid => rows.map((row) => row.slice());

const emptyRow = [0, 0, 0, 0];

describe('applyMove', () => {
  it('merges [2,0,2,2] to [4,2,0,0] with correct score', () => {
    const grid = gridFromRows([
      [2, 0, 2, 2],
      emptyRow,
      emptyRow,
      emptyRow
    ]);

    const result = applyMove(grid, 'left');

    expect(result.grid[0]).toEqual([4, 2, 0, 0]);
    expect(result.scoreDelta).toBe(4);
    expect(result.moved).toBe(true);
  });

  it('merges [2,2,2,2] to [4,4,0,0] with correct score', () => {
    const grid = gridFromRows([
      [2, 2, 2, 2],
      emptyRow,
      emptyRow,
      emptyRow
    ]);

    const result = applyMove(grid, 'left');

    expect(result.grid[0]).toEqual([4, 4, 0, 0]);
    expect(result.scoreDelta).toBe(8);
    expect(result.moved).toBe(true);
  });

  it('merges once per tile ([4,4,4,0] -> [8,4,0,0])', () => {
    const grid = gridFromRows([
      [4, 4, 4, 0],
      emptyRow,
      emptyRow,
      emptyRow
    ]);

    const result = applyMove(grid, 'left');

    expect(result.grid[0]).toEqual([8, 4, 0, 0]);
    expect(result.scoreDelta).toBe(8);
    expect(result.moved).toBe(true);
  });

  it('returns moved=false and unchanged grid for invalid move', () => {
    const grid = gridFromRows([
      [2, 4, 8, 16],
      emptyRow,
      emptyRow,
      emptyRow
    ]);

    const result = applyMove(grid, 'left');

    expect(result.grid).toEqual(grid);
    expect(result.scoreDelta).toBe(0);
    expect(result.moved).toBe(false);
  });
});
