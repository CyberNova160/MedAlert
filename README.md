# MedAlert — Smart Campus Emergency & Medical Assistance

MedAlert is a campus medical-assistance coordination prototype. Students can submit SOS requests, optionally attach browser location, and responders can review and prioritize incidents. It includes an OpenStreetMap-based facilities view and a Supabase-backed incident store.

> **Safety notice:** This project is not an emergency dispatch service. It does not contact an ambulance, hospital, or emergency operator by itself. In India, call **112** for immediate emergencies. Verify all campus contacts and medical-facility information before real-world use. Do not rely on the sample map points.

## Features

- One-tap entry to an SOS request form
- Optional browser geolocation (permission-based)
- Severity-based priority scoring with additional keyword boosts
- Incident list sorted by priority
- Responder status workflow: Open → Assigned → Resolved
- OpenStreetMap / Leaflet map
- Supabase PostgreSQL persistence
- Optional outgoing notification webhook
- Demo mode without credentials for local preview

## Tech stack

Next.js 15 · React 19 · TypeScript · Tailwind CSS · Supabase · Leaflet · OpenStreetMap · Vercel

## Run locally

Requirements: Node.js 20.9+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Without Supabase credentials, the app runs in demo mode. Demo incidents are stored in server memory and are not durable; they may reset when the server restarts.

## Configure Supabase (recommended)

1. Create a project at https://supabase.com.
2. Open SQL Editor and run `supabase/schema.sql`.
3. In Project Settings → API, copy the Project URL, anon key and service-role key.
4. Add values to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
ADMIN_ACCESS_KEY=replace-with-a-long-random-secret
```

The service-role key is server-only. Never prefix it with `NEXT_PUBLIC_`, commit it, or share it. Rotate it immediately if exposed.

## Optional notifications

Set `NOTIFICATION_WEBHOOK_URL` to a server endpoint you control. MedAlert sends a JSON POST with `event: "new_incident"` and the created incident after a successful submission. Connect this to a vetted email/SMS provider only after adding consent, delivery monitoring, abuse prevention and secure handling of phone numbers.

## Deploy to Vercel

1. Push this repository to GitHub.
2. In Vercel, choose **Add New → Project** and import the GitHub repository.
3. Keep the framework preset as Next.js.
4. Add the environment variables listed above in Project Settings → Environment Variables.
5. Deploy. Redeploy after changing environment variables.

No custom build command is needed; Vercel detects Next.js automatically.

## Push to GitHub

Create an empty repository named `MedAlert` on GitHub, then run:

```bash
git init
git add .
git commit -m "Build MedAlert campus emergency assistance platform"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/MedAlert.git
git push -u origin main
```

## Important production checklist

This is a strong project prototype, not a certified emergency-response system. Before real campus deployment:

- Obtain written approval from campus administration and the health centre.
- Replace sample map coordinates with verified facility records and verified phone numbers.
- Add authenticated student and responder accounts, role-based authorization and audit logs.
- Add server-side rate limiting, bot protection, abuse reporting and request deduplication.
- Add consent, retention and deletion policies for personal data and precise location.
- Use a reliable notification provider with delivery receipts and escalation/fallback procedures.
- Test with campus responders; define who monitors requests and expected response times.
- Conduct security, privacy, accessibility and load testing.

## API

- `GET /api/incidents` — list recent incidents (priority sorted)
- `POST /api/incidents` — create an incident
- `PATCH /api/incidents/:id` — update status; requires `x-admin-key`

## Priority logic

Base score: Critical 100, High 75, Medium 45, Low 20. Certain emergency keywords (breathing difficulty, unconsciousness, cardiac, severe bleeding) receive a 15-point boost, capped at 100. This is a transparent demo heuristic, not clinical triage. A trained medical professional must determine actual urgency.
