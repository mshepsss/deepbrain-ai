/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { GameProvider } from '@/context/GameContext';
import RoleSelectPage from '@/app/page';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

describe('Role Selection', () => {
  it('renders all 5 role names', () => {
    render(<GameProvider><RoleSelectPage /></GameProvider>);
    expect(screen.getByText('Head of Sales')).toBeInTheDocument();
    expect(screen.getByText('CTO')).toBeInTheDocument();
    expect(screen.getByText('CFO')).toBeInTheDocument();
    expect(screen.getByText('Head of Research')).toBeInTheDocument();
    expect(screen.getByText('Growth Hacker')).toBeInTheDocument();
  });

  it('shows disabled start button before role is selected', () => {
    render(<GameProvider><RoleSelectPage /></GameProvider>);
    const btn = screen.getByRole('button', { name: /select a role/i });
    expect(btn).toBeDisabled();
  });

  it('enables start button after a role is selected', () => {
    render(<GameProvider><RoleSelectPage /></GameProvider>);
    fireEvent.click(screen.getByText('CTO'));
    const btn = screen.getByRole('button', { name: /start company/i });
    expect(btn).not.toBeDisabled();
  });
});
