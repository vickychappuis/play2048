export type Grid = number[][];
export type Direction = 'up' | 'down' | 'left' | 'right';
export type RNG = () => number;
export type GameState = {
  grid: Grid;
  score: number;
  won: boolean;
  over: boolean;
};

const SIZE = 4;

const makeEmptyGrid = (): Grid =>
  Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

const cloneGrid = (grid: Grid): Grid => grid.map((row) => row.slice());

const gridsEqual = (a: Grid, b: Grid): boolean => {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (a[r][c] !== b[r][c]) return false;
    }
  }
  return true;
};

const processLine = (line: number[]): { line: number[]; scoreDelta: number } => {
  const nonZero = line.filter((v) => v !== 0);
  const merged: number[] = [];
  let scoreDelta = 0;

  for (let i = 0; i < nonZero.length; i += 1) {
    if (i + 1 < nonZero.length && nonZero[i] === nonZero[i + 1]) {
      const value = nonZero[i] * 2;
      merged.push(value);
      scoreDelta += value;
      i += 1;
    } else {
      merged.push(nonZero[i]);
    }
  }

  while (merged.length < SIZE) merged.push(0);
  return { line: merged, scoreDelta };
};

export const initGame = (rng: RNG = Math.random): GameState => {
  let grid = makeEmptyGrid();
  grid = spawnTile(grid, rng);
  grid = spawnTile(grid, rng);

  return {
    grid,
    score: 0,
    won: hasWon(grid),
    over: !canMove(grid)
  };
};

export const applyMove = (
  grid: Grid,
  direction: Direction
): { grid: Grid; scoreDelta: number; moved: boolean } => {
  let scoreDelta = 0;
  const next = makeEmptyGrid();

  if (direction === 'left' || direction === 'right') {
    for (let r = 0; r < SIZE; r += 1) {
      const row = grid[r].slice();
      const working = direction === 'right' ? row.reverse() : row;
      const processed = processLine(working);
      scoreDelta += processed.scoreDelta;
      const finalRow = direction === 'right'
        ? processed.line.slice().reverse()
        : processed.line;
      next[r] = finalRow;
    }
  } else {
    for (let c = 0; c < SIZE; c += 1) {
      const column: number[] = [];
      for (let r = 0; r < SIZE; r += 1) {
        column.push(grid[r][c]);
      }
      const working = direction === 'down' ? column.reverse() : column;
      const processed = processLine(working);
      scoreDelta += processed.scoreDelta;
      const finalCol = direction === 'down'
        ? processed.line.slice().reverse()
        : processed.line;
      for (let r = 0; r < SIZE; r += 1) {
        next[r][c] = finalCol[r];
      }
    }
  }

  return {
    grid: next,
    scoreDelta,
    moved: !gridsEqual(grid, next)
  };
};

export const spawnTile = (grid: Grid, rng: RNG = Math.random): Grid => {
  const empties: Array<[number, number]> = [];
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (grid[r][c] === 0) empties.push([r, c]);
    }
  }

  if (empties.length === 0) return cloneGrid(grid);

  const choice = Math.min(
    Math.floor(rng() * empties.length),
    empties.length - 1
  );
  const [row, col] = empties[choice];
  const value = rng() < 0.9 ? 2 : 4;

  const next = cloneGrid(grid);
  next[row][col] = value;
  return next;
};

export const canMove = (grid: Grid): boolean => {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (grid[r][c] === 0) return true;
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
};

export const hasWon = (grid: Grid): boolean => {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (grid[r][c] >= 2048) return true;
    }
  }
  return false;
};

export const move = (
  state: GameState,
  direction: Direction,
  rng: RNG = Math.random
): GameState => {
  const result = applyMove(state.grid, direction);
  if (!result.moved) return state;

  const withSpawn = spawnTile(result.grid, rng);
  return {
    grid: withSpawn,
    score: state.score + result.scoreDelta,
    won: state.won || hasWon(withSpawn),
    over: !canMove(withSpawn)
  };
};
