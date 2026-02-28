/**
 * @jest-environment node
 */
import { POST } from '@/app/api/events/route';
import { NextRequest } from 'next/server';

jest.mock('@anthropic-ai/sdk', () => {
  return {
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
  };
});

describe('POST /api/events', () => {
  it('returns a game event with headline and options', async () => {
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ month: 3, cash: 4000000, agiProgress: 10, headcount: 5, role: 'cto' }),
    });

    const res = await POST(req);
    const data = await res.json();

    expect(data.headline).toBe('OpenAI releases GPT-5');
    expect(data.options).toHaveLength(2);
    expect(data.options[0].effect).toBeDefined();
  });

  it('returns json response with status 200', async () => {
    const req = new NextRequest('http://localhost/api/events', {
      method: 'POST',
      body: JSON.stringify({ month: 1, cash: 5000000, agiProgress: 0, headcount: 2, role: 'cfo' }),
    });

    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
