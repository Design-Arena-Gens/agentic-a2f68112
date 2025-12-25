# Agentic Studio

Design, simulate, and export bespoke ChatGPT-style agents from a single web workspace. Craft the voice, mission, capabilities, guardrails, and connected tools, then copy a production-ready system prompt and manifest for deployment across OpenAI Assistants, the Vercel AI SDK, or custom orchestrators.

## Quickstart

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to reach the Agentic Studio canvas.

## Features

- Guided workflow covering identity, tone, capabilities, tools, and safety guardrails
- Curated presets for agent behaviours, escalation rules, and integrations
- Real-time prompt + manifest generator with copy-to-clipboard shortcuts
- Responsive, glassmorphism-inspired UI designed for Vercel deployment

## Scripts

- `npm run dev` – Launch the Next.js dev server
- `npm run build` – Create an optimised production bundle
- `npm start` – Serve the production build
- `npm run lint` – Run ESLint with Next.js defaults
- `npm run format` – Check formatting with Prettier
- `npm run format:fix` – Auto-format using Prettier

## Stack

- Next.js 14 (App Router)
- React 18 with client components
- TypeScript + ESLint + Prettier

## Deployment

This project is pre-configured for Vercel. To ship a production deploy:

```bash
npm run build
vercel deploy --prod --yes --token $VERCEL_TOKEN --name agentic-a2f68112
```

Then verify the deployment:

```bash
curl https://agentic-a2f68112.vercel.app
```
