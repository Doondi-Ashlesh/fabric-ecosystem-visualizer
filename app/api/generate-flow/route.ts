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

SERVICE FUNCTION GUIDE — pick based on what each service actually does, not its name:
- onelake: unified storage foundation only — not a processing or query tool
- data-factory: batch data movement and pipeline orchestration between systems
- dataflows-gen2: low-code Power Query transformations, self-service data prep
- eventstream: capture and route live event/IoT/CDC streams in real time
- lakehouse: store and query structured/unstructured data with Spark and SQL
- warehouse: enterprise T-SQL analytics warehouse for structured relational data
- eventhouse: time-series and telemetry store, queried with KQL, sub-second latency
- notebook: interactive Spark code (Python/Scala/R) for engineering, ML training, EDA
- spark-job: scheduled/batch Spark workloads, not interactive
- data-pipeline: orchestrate and sequence multiple Fabric activities end-to-end
- ml-experiment: track and compare ML training runs with MLflow
- ml-model: register, version, and serve trained ML models for scoring
- real-time-dashboard: live auto-refreshing KQL dashboards from Eventhouse
- copilot: AI coding assistant for generating code/queries — NOT for alerts or automation
- data-activator: trigger automated alerts, emails, Teams messages, or pipeline runs when data conditions are met — use this for ANY alerting or notification requirement
- power-bi: interactive BI reports and dashboards for business users
- paginated-report: pixel-perfect formatted reports for print/export (invoices, statements)
- purview: data governance, lineage tracking, sensitivity labels, compliance

STRICT RULES:
- NEVER use copilot for alerting, notifications, or automation — use data-activator instead
- NEVER use copilot for orchestration — use data-pipeline or data-factory instead
- NEVER use ml-experiment for serving predictions — use ml-model instead
- NEVER use notebook for scheduled batch jobs — use spark-job instead
- NEVER use onelake as a processing step — it is storage infrastructure, only include it if the goal explicitly requires unified storage setup
- Only include services genuinely required; do not pad with extras
- Order steps logically: ingestion → storage → processing → analytics → delivery
- Minimum 3 steps, maximum 7 steps
- Difficulty: 'beginner' (1-3 steps), 'intermediate' (4-5 steps), 'advanced' (6-7 steps)

Return ONLY valid JSON matching this exact schema:
{
  "goal": "string — restate the goal concisely",
  "difficulty": "beginner" | "intermediate" | "advanced",
  "steps": [
    {
      "serviceId": "string — must be one of the valid IDs above",
      "action": "string — verb phrase (max 3 words, e.g. Ingest, Transform, Store, Score, Alert, Visualize, Govern)",
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
