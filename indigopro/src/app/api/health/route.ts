import { NextResponse } from 'next/server';

export async function GET() {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  return NextResponse.json({
    ok: hasApiKey,
    hasApiKey,
    message: hasApiKey
      ? 'Ready'
      : 'ANTHROPIC_API_KEY not set. Add it to .env.local and restart the server.',
  }, { status: hasApiKey ? 200 : 503 });
}
