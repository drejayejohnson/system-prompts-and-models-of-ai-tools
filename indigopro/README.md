# IndigoPro — AI Content Studio

Generate brand-authentic content with AI that knows your voice. Upload writing samples, build a persistent brand voice profile, and create blog posts, social captions, video scripts, emails, and ad copy that sound exactly like you.

Built with Next.js 16, React Flow, Tailwind CSS v4, and the Anthropic Claude API (with prompt caching).

## Features

- **Brand Voice Profile** — upload PDFs/text or paste samples; Claude extracts your tone, vocabulary, personality traits, keywords, and representative excerpts
- **Visual Canvas** — drag-and-drop board with idea notes, prompt nodes, and generated content cards
- **12 Content Templates** — LinkedIn, Instagram, Twitter/X threads, blog posts, listicles, newsletters, subject lines, YouTube/TikTok scripts, ad copy, product descriptions, press releases
- **Streaming Generation** — real-time output with markdown preview, copy, and add-to-canvas
- **Brand Chat** — conversational AI that always responds in your brand voice

## Local Development

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev                          # http://localhost:3001
```

## Deploying to Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub repository
2. Set **Root Directory** to `indigopro`
3. Add an environment variable: `ANTHROPIC_API_KEY` = your key from [console.anthropic.com](https://console.anthropic.com)
4. Click **Deploy**

If your code is on a non-default branch, set **Settings → Git → Production Branch** to that branch after the first import.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Claude API key for brand analysis and content generation |
| `NEXT_PUBLIC_APP_NAME` | No | Display name override |
