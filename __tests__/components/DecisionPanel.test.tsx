/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { DecisionPanel } from '@/components/DecisionPanel';
import type { ResearchMilestone } from '@/lib/types';

const mockMilestones: ResearchMilestone[] = [
  {
    id: 'gpt2-class',
    name: 'GPT-2 Class Model',
    description: 'First model',
    cost: 10,
    agiBonus: 5,
    unlocked: true,
    completed: false,
  },
];

const defaultProps = {
  researchPoints: 15,
  milestones: mockMilestones,
  onHire: jest.fn(),
  onResearch: jest.fn(),
  onEndTurn: jest.fn(),
  decisionsMade: 0,
};

describe('DecisionPanel', () => {
  it('renders hire buttons for all 3 departments', () => {
    render(<DecisionPanel {...defaultProps} />);
    expect(screen.getByText(/engineering/i)).toBeInTheDocument();
    expect(screen.getByText(/sales/i)).toBeInTheDocument();
    expect(screen.getByText(/operations/i)).toBeInTheDocument();
  });

  it('calls onHire with correct department when hire button clicked', () => {
    const onHire = jest.fn();
    render(<DecisionPanel {...defaultProps} onHire={onHire} />);
    fireEvent.click(screen.getByText(/engineering/i));
    expect(onHire).toHaveBeenCalledWith('engineering');
  });

  it('shows available research milestone', () => {
    render(<DecisionPanel {...defaultProps} />);
    expect(screen.getByText('GPT-2 Class Model')).toBeInTheDocument();
  });

  it('calls onResearch with milestone id when research clicked', () => {
    const onResearch = jest.fn();
    render(<DecisionPanel {...defaultProps} onResearch={onResearch} />);
    fireEvent.click(screen.getByText('GPT-2 Class Model'));
    expect(onResearch).toHaveBeenCalledWith('gpt2-class');
  });

  it('disables hire buttons at max decisions (3)', () => {
    render(<DecisionPanel {...defaultProps} decisionsMade={3} />);
    const engButton = screen.getByText(/engineering/i);
    expect(engButton).toBeDisabled();
  });

  it('calls onEndTurn when End Month clicked', () => {
    const onEndTurn = jest.fn();
    render(<DecisionPanel {...defaultProps} onEndTurn={onEndTurn} />);
    fireEvent.click(screen.getByText(/end month/i));
    expect(onEndTurn).toHaveBeenCalled();
  });

  it('disables research button when not enough research points', () => {
    render(<DecisionPanel {...defaultProps} researchPoints={5} />);
    // milestone costs 10 pts, only have 5
    const researchBtn = screen.getByText('GPT-2 Class Model').closest('button');
    expect(researchBtn).toBeDisabled();
  });
});
