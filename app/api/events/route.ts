import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';

const client = new Anthropic();

const SYSTEM_PROMPT = `You are an AI game master for a business simulation game about running an AI company.
Generate realistic in-game events based on plausible real-world AI industry developments.
Scale event financial impact to the game month: early months (1-6) = small stakes ($50k-$200k), late months (18+) = high stakes ($500k-$2M).
Always respond with valid JSON matching exactly this schema:
{
  "headline": "string (news headline, max 80 chars)",
  "flavourText": "string (1-2 sentences of narrative context)",
  "options": [
    {
      "label": "string (action label, max 40 chars)",
      "effect": { "cash": number, "burnRate": number, "revenue": number, "agiProgress": number, "researchPoints": number },
      "risk": "string (one short phrase describing the downside)"
    }
  ]
}
Provide 2-3 options. All effect fields are optional (omit zeros). Return only the JSON object, no markdown.`;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { month, cash, agiProgress, headcount, role } = body;

  const userPrompt = `Game state: Month ${month}, Cash $${(cash / 1_000_000).toFixed(1)}M, AGI Progress ${agiProgress}%, Headcount ${headcount}, Player role: ${role}. Generate the next industry event.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const event = JSON.parse(text);
    return NextResponse.json(event);
  } catch {
    return NextResponse.json({ error: 'Failed to generate event' }, { status: 500 });
  }
}
