/**
 * @jest-environment jsdom
 */
import { render, screen, act } from '@testing-library/react';
import { GameProvider, useGame } from '@/context/GameContext';

const TestConsumer = () => {
  const { state, startGame } = useGame();
  return (
    <div>
      <span data-testid="phase">{state.phase}</span>
      <span data-testid="month">{state.month}</span>
      <button onClick={() => startGame('cto')}>Start</button>
    </div>
  );
};

describe('GameContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts in role-select phase', () => {
    render(<GameProvider><TestConsumer /></GameProvider>);
    expect(screen.getByTestId('phase')).toHaveTextContent('role-select');
  });

  it('transitions to playing after startGame', () => {
    render(<GameProvider><TestConsumer /></GameProvider>);
    act(() => { screen.getByText('Start').click(); });
    expect(screen.getByTestId('phase')).toHaveTextContent('playing');
  });

  it('startGame sets month to 1', () => {
    render(<GameProvider><TestConsumer /></GameProvider>);
    act(() => { screen.getByText('Start').click(); });
    expect(screen.getByTestId('month')).toHaveTextContent('1');
  });
});
