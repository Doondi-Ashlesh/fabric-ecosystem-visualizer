import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { FABRIC_SERVICES } from '@/data/fabric';

const client = new OpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.GITHUB_TOKEN,
});

const SERVICE_IDS = FABRIC_SERVICES.map((s) => s.id).join(', ');

const SYSTEM_PROMPT = `
You are an expert Microsoft Fabric solutions architect.
Given a user's data or analytics goal, return a step-by-step workflow using ONLY the official Microsoft Fabric services listed below.

VALID SERVICE IDs (use ONLY these — no others):
${SERVICE_IDS}

Rules:
- Include only services that are genuinely required for the goal
- Order steps logically from data ingestion through to delivery/consumption
- Each step must have a clear, specific action and a 1-2 sentence detail explaining what the user does in that service
- Minimum 3 steps, maximum 7 steps
- Difficulty: 'beginner' (1-3 services, simple goal), 'intermediate' (4-5 services), 'advanced' (6-7 services, complex goal)

Return ONLY valid JSON matching this exact schema:
{
  "goal": "string — restate the goal concisely",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "steps": [
    {
      "serviceId": "string — must be one of the valid IDs above",
      "action": "string — verb phrase (max 3 words, e.g. Ingest, Transform, Store, Analyze, Deploy, Visualize, Govern)",
      "detail": "string — 1-2 sentences explaining what the user does in this service for this specific goal"
    }
  ]
}
`.trim();

export async function POST(req: NextRequest) {
  try {
    const { goal } = await req.json() as { goal?: string };

    if (!goal || typeof goal !== 'string' || goal.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please describe your goal (at least 3 characters).' },
        { status: 400 }
      );
    }

    const completion = await client.chat.completions.create({
      model: 'Phi-4',
      temperature: 0.1,
      max_tokens: 1024,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user',   content: `Goal: ${goal.trim()}` },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? '';
    const parsed = JSON.parse(raw) as {
      goal: string;
      difficulty: string;
      steps: Array<{ serviceId: string; action: string; detail: string }>;
    };

    // Validate and filter — only allow known service IDs
    const validIds = new Set(FABRIC_SERVICES.map((s) => s.id));
    const validSteps = parsed.steps.filter((step) => validIds.has(step.serviceId));

    if (validSteps.length === 0) {
      return NextResponse.json(
        { error: 'Could not map your goal to Fabric services. Please try a more specific description.' },
        { status: 422 }
      );
    }

    const workflow = {
      id: `wf-${Date.now()}`,
      goal: parsed.goal ?? goal,
      difficulty: ['beginner', 'intermediate', 'advanced'].includes(parsed.difficulty)
        ? parsed.difficulty
        : 'intermediate',
      steps: validSteps,
    };

    return NextResponse.json({ workflow });

  } catch (err) {
    console.error('[generate-flow]', err);

    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
