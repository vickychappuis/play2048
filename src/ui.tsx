import React, { useMemo, useState } from 'react';
import { Box, Text, useApp, useInput } from 'ink';
import { initGame, move, GameState, Direction } from './game.js';

const TILE_WIDTH = 6;
const TILE_HEIGHT = 3;
const GRID_SIZE = 4;
const GRID_LINE_COLOR = '#ffffff';

const backgroundColorForValue = (value: number): string => {
  switch (value) {
    case 0:
      return '#2b2b2b';
    case 2:
      return '#A8E6CF';
    case 4:
      return '#7FD3A6';
    case 8:
      return '#DCE775';
    case 16:
      return '#FFF176';
    case 32:
      return '#FFCC80';
    case 64:
      return '#FFB74D';
    case 128:
      return '#FF8A65';
    case 256:
      return '#FF7043';
    case 512:
      return '#F4511E';
    case 1024:
      return '#E53935';
    default:
      return value >= 2048 ? '#B71C1C' : '#B71C1C';
  }
};

const textColorForValue = (value: number): string => {
  if (value === 0) return '#d0d0d0';
  return value <= 32 ? '#1a1a1a' : '#ffffff';
};

const abbreviateValue = (value: number): string => {
  if (value === 0) return '';
  if (String(value).length <= TILE_WIDTH) return String(value);
  const thousands = Math.round(value / 1000);
  return `${thousands}k`;
};

const centerText = (text: string, width: number): string => {
  if (text.length > width) return text.slice(0, width);
  const left = Math.floor((width - text.length) / 2);
  const right = width - text.length - left;
  return `${' '.repeat(left)}${text}${' '.repeat(right)}`;
};

const buildBorder = (left: string, middle: string, right: string): string => {
  const segment = '─'.repeat(TILE_WIDTH);
  const content = Array.from({ length: GRID_SIZE })
    .map(() => segment)
    .join(middle);
  return `${left}${content}${right}`;
};

const topBorder = buildBorder('┌', '┬', '┐');
const middleBorder = buildBorder('├', '┼', '┤');
const bottomBorder = buildBorder('└', '┴', '┘');
const boardWidth = topBorder.length;

type TileLineProps = {
  values: number[];
  interiorLine: number;
};

const TileLine = ({ values, interiorLine }: TileLineProps) => {
  const middleRow = Math.floor(TILE_HEIGHT / 2);
  const parts: React.ReactNode[] = [
    <Text key="start" color={GRID_LINE_COLOR}>
      │
    </Text>,
  ];

  values.forEach((value, index) => {
    const bg = backgroundColorForValue(value);
    const fg = textColorForValue(value);
    const label = interiorLine === middleRow ? abbreviateValue(value) : '';
    const content = centerText(label, TILE_WIDTH);

    parts.push(
      <Text
        key={`cell-${index}`}
        backgroundColor={bg}
        color={fg}
        bold={value >= 1024}
        wrap="truncate"
      >
        {content}
      </Text>
    );

    parts.push(
      <Text key={`sep-${index}`} color={GRID_LINE_COLOR}>
        │
      </Text>
    );
  });

  return <Text>{parts}</Text>;
};

const Board = ({ grid }: { grid: number[][] }) => {
  const lines = useMemo(() => {
    const rendered: React.ReactNode[] = [
      <Text key="top" color={GRID_LINE_COLOR}>
        {topBorder}
      </Text>,
    ];

    grid.forEach((row, rowIndex) => {
      for (let h = 0; h < TILE_HEIGHT; h += 1) {
        rendered.push(
          <TileLine key={`row-${rowIndex}-h-${h}`} values={row} interiorLine={h} />
        );
      }

      if (rowIndex < grid.length - 1) {
        rendered.push(
          <Text key={`mid-${rowIndex}`} color={GRID_LINE_COLOR}>
            {middleBorder}
          </Text>
        );
      }
    });

    rendered.push(
      <Text key="bottom" color={GRID_LINE_COLOR}>
        {bottomBorder}
      </Text>
    );

    return rendered;
  }, [grid]);

  return (
    <Box flexDirection="column" width={boardWidth}>
      {lines}
    </Box>
  );
};

export const App = () => {
  const { exit } = useApp();
  const [state, setState] = useState<GameState>(() => initGame());

  const handleMove = (direction: Direction) => {
    setState((prev) => move(prev, direction));
  };

  const handleRestart = () => {
    setState(initGame());
  };

  useInput((input, key) => {
    if (key.escape || input === 'q' || input === 'Q') {
      exit();
      return;
    }

    if (key.ctrl && input === 'c') {
      exit();
      return;
    }

    if (input === 'r' || input === 'R') {
      handleRestart();
      return;
    }

    if (key.upArrow || input === 'w' || input === 'W') {
      handleMove('up');
      return;
    }

    if (key.downArrow || input === 's' || input === 'S') {
      handleMove('down');
      return;
    }

    if (key.leftArrow || input === 'a' || input === 'A') {
      handleMove('left');
      return;
    }

    if (key.rightArrow || input === 'd' || input === 'D') {
      handleMove('right');
    }
  });

  return (
    <Box flexDirection="column">
      <Box width={boardWidth} justifyContent="space-between">
        <Text bold>2048</Text>
        <Text>Score: {state.score}</Text>
      </Box>

      <Box flexDirection="row" gap={2} marginTop={1}>
        {state.won ? <Text color="green">You win! Continue playing…</Text> : null}
        {state.over ? <Text color="red">Game over — press r to restart</Text> : null}
      </Box>

      <Box marginTop={1}>
        <Board grid={state.grid} />
      </Box>

      <Box marginTop={1} width={boardWidth}>
        <Text dimColor>
          Controls: arrows/WASD move • r restart • q/esc/ctrl+c quit
        </Text>
      </Box>
    </Box>
  );
};
