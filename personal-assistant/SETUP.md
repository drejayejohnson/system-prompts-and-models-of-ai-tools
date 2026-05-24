# Personal Assistant — Setup Guide

A personal AI business assistant with voice (OpenAI Realtime API), text chat (Claude), Gmail, Google Calendar, and GoHighLevel CRM.

## Quick Start

### 1. Install dependencies

```bash
cd personal-assistant
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Edit `.env.local` and fill in:

| Variable | Where to get it |
|---|---|
| `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com) |
| `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` | [Google Cloud Console](https://console.cloud.google.com) — create OAuth credentials, add `http://localhost:3000/api/auth/callback/google` as redirect URI |
| `NEXTAUTH_SECRET` | Run `openssl rand -base64 32` |
| `GHL_API_KEY` | GoHighLevel → Settings → Integrations → API Keys |
| `GHL_LOCATION_ID` | GoHighLevel → Settings → Business Info → Location ID |

### 3. Initialize the database

```bash
npm run db:push
```

### 4. Run the web app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 5. Run as macOS native app (Electron)

In one terminal:
```bash
npm run dev
```

In another terminal:
```bash
npm run electron
```

Or run both together:
```bash
npm run electron:dev
```

---

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable these APIs:
   - Gmail API
   - Google Calendar API
4. Go to **Credentials → Create Credentials → OAuth 2.0 Client IDs**
5. Application type: **Web application**
6. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
7. Copy the Client ID and Client Secret to `.env.local`

---

## Mobile Access

The web app is a PWA. To access it on mobile:
1. Deploy to Vercel: `npx vercel`
2. Open the Vercel URL on your phone
3. On iOS: tap Share → Add to Home Screen
4. On Android: tap the browser menu → Install app

---

## Keyboard Shortcuts (macOS Electron app)

| Shortcut | Action |
|---|---|
| `Cmd+Shift+A` | Show/hide assistant window |
| `Enter` | Send chat message |
| `Shift+Enter` | New line in chat |

---

## Voice Commands

Just tap the microphone and speak naturally. Examples:
- *"Check my emails"*
- *"What do I have on my calendar today?"*
- *"Look up John Smith in my CRM"*
- *"Draft an email to [name] about [topic]"*
- *"Create a meeting tomorrow at 2pm"*
- *"What's in my sales pipeline?"*
