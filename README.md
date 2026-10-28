# Joel Dsouza — portfolio

Personal site built with Next.js 15, React 19, Tailwind CSS and MDX. It includes an AI "interview" assistant, a moderated visitor art gallery and a contact form.

## Getting started

```bash
npm install
cp .env.example .env.local   # optional — every feature works without keys in a reduced form
npm run dev
```

`npm test` runs the unit tests. `npm run build` checks the production build (stop `npm run dev` first; they share the `.next` folder).

## Updating content

Everything on the site is read from the `content/` folder — no component changes needed. The interview assistant reads the same files, so it stays in sync automatically.

| What | Where |
| --- | --- |
| Name, role, hero (status, tagline, stats), section copy, interview starters | `content/site.ts` |
| Work history and education | `content/experience.ts` |
| Skills cards; `top: 1…7` features a tool in the hero | `content/skills.ts` |
| Certifications | `content/certifications.ts` |
| Case studies | `content/projects/*.mdx` |
| Writing | `content/writing/*.mdx` |

### Adding a case study

Copy `content/projects/agentic-voice.mdx` and rename it — the file name becomes the URL (`/projects/<file-name>`). Frontmatter drives the hero, facts, stats and the `architecture` diagram (lanes left to right, plus a `rail` of concerns that apply to every stage). The body uses `<Problem>`, `<Approach>` (with `<Stage>` and `<Decision>`), `<Reflection>` and `<Takeaways>` (with `<Takeaway>`). Set `featured: true` to show it on the home page and `order` to sort it. Quote any YAML value that contains a comma.

### Publishing a post

Add an `.mdx` file to `content/writing`. See `content/writing/how-to-publish.mdx` for every available component. Posts with `draft: true` only appear in `npm run dev`. The Writing link appears automatically once a published post exists.

### Résumé download

Put the PDF in `public/` and set `resumeUrl` in `content/site.ts`; a Résumé link appears in the footer.

## Environment setup (Vercel)

Add these in Vercel → Project → Settings → Environment Variables. `.env.example` lists them all.

1. **Site URL** — `NEXT_PUBLIC_SITE_URL`, e.g. `https://your-domain.com`.
2. **Supabase** (gallery, rate limits, interview cache) — create a free project, open SQL → New query, run `supabase/schema.sql`, then set `SUPABASE_URL` and `SUPABASE_SECRET_KEY` (Project Settings → API Keys → Secret keys). The secret key stays server-side; the publishable key isn't used.
3. **Resend** (contact form and new-art notifications) — create an API key and set `RESEND_API_KEY`, `CONTACT_TO_EMAIL` (where messages go) and `CONTACT_FROM_EMAIL` (`Portfolio <onboarding@resend.dev>` works until you verify a domain).
4. **OpenRouter** (interview) — create a **dedicated key with a credit limit** (e.g. $5) and set `OPENROUTER_API_KEY`. `OPENROUTER_MODEL` defaults to `xiaomi/mimo-v2.6-flash`.
5. **Cloudflare Turnstile** (bot check on every form) — add a widget for your domain and set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
6. **Secrets** — generate each with `openssl rand -hex 32`: `SESSION_SECRET`, `IP_HASH_SALT`, `ADMIN_SECRET`.

Redeploy after adding variables.

## Moderating art

New drawings are private until approved. You get an email for each one; review them at `/admin/gallery` (sign in with `ADMIN_SECRET`). Approve publishes the drawing, Reject deletes its image, Delete removes an approved one.

## How the interview is protected

The OpenRouter key never reaches the browser. Each visitor passes a Turnstile check once per 30 minutes, is limited to 20 questions an hour and 60 a day (1,500 a day across everyone), and answers are capped at ~350 tokens and restricted to questions about Joel. First questions are cached until the content changes, so repeated questions cost nothing. The key's own credit limit is the final backstop.
