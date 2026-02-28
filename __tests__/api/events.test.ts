/**
 * @jest-environment node
 */
import { POST } from '@/app/api/events/route';
import { NextRequest } from 'next/server';

jest.mock('@anthropic-ai/sdk', () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn().mockResolvedValue({
        content: [{
          type: 'text',
          text: JSON.stringify({
            headline: 'OpenAI releases GPT-5',
            flavourText: 'The industry reacts to a major capability jump.',
            options: [
              { label: 'Accelerate compute spend', effect: { cash: -200000, agiProgress: 8 }, risk: 'High burn' },
              { label: 'Stay the course', effect: { cash: 0, agiProgress: 2 }, risk: 'Lose ground' },
            ],
          }),
        }],
      }),
    },
  })),
}));

const makeRequest = (body: object) =>
  new NextRequest('http://localhost/api/events', {
    method: 'POST',
    body: JSON.stringify(body),
  });

const getCreateMock = (): jest.Mock => {
  const MockAnthropic = jest.requireMock('@anthropic-ai/sdk').default as jest.Mock;
  return MockAnthropic.mock.results[0].value.messages.create as jest.Mock;
};

describe('POST /api/events', () => {
  it('returns a game event with headline and options', async () => {
    const res = await POST(makeRequest({ month: 3, cash: 4000000, agiProgress: 10, headcount: 5, role: 'cto' }));
    const data = await res.json();

    expect(data.headline).toBe('OpenAI releases GPT-5');
    expect(data.options).toHaveLength(2);
    expect(data.options[0].effect).toBeDefined();
  });

  it('returns json response with status 200', async () => {
    const res = await POST(makeRequest({ month: 1, cash: 5000000, agiProgress: 0, headcount: 2, role: 'cfo' }));
    expect(res.status).toBe(200);
  });

  it('returns 500 when Claude returns malformed JSON', async () => {
    getCreateMock().mockResolvedValueOnce({
      content: [{ type: 'text', text: 'not valid json {{{{' }],
    });

    const res = await POST(makeRequest({ month: 1, cash: 5000000, agiProgress: 0, headcount: 2, role: 'cto' }));
    expect(res.status).toBe(500);
  });
});
