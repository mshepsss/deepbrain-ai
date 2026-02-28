/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard } from '@/components/EventCard';

const mockEvent = {
  headline: 'OpenAI releases GPT-5',
  flavourText: 'The industry scrambles to respond.',
  options: [
    { label: 'Double compute', effect: { cash: -500000, agiProgress: 8 }, risk: 'High burn' },
    { label: 'Stay the course', effect: { agiProgress: 2 }, risk: 'Lose ground' },
  ],
};

describe('EventCard', () => {
  it('renders headline', () => {
    render(<EventCard event={mockEvent} onChoose={jest.fn()} />);
    expect(screen.getByText('OpenAI releases GPT-5')).toBeInTheDocument();
  });

  it('renders flavour text', () => {
    render(<EventCard event={mockEvent} onChoose={jest.fn()} />);
    expect(screen.getByText('The industry scrambles to respond.')).toBeInTheDocument();
  });

  it('renders all options', () => {
    render(<EventCard event={mockEvent} onChoose={jest.fn()} />);
    expect(screen.getByText('Double compute')).toBeInTheDocument();
    expect(screen.getByText('Stay the course')).toBeInTheDocument();
  });

  it('calls onChoose with correct effect when option clicked', () => {
    const onChoose = jest.fn();
    render(<EventCard event={mockEvent} onChoose={onChoose} />);
    fireEvent.click(screen.getByText('Double compute'));
    expect(onChoose).toHaveBeenCalledWith({ cash: -500000, agiProgress: 8 });
  });

  it('disables buttons when disabled prop is true', () => {
    render(<EventCard event={mockEvent} onChoose={jest.fn()} disabled={true} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach(btn => expect(btn).toBeDisabled());
  });
});
