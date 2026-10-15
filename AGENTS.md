# Sall Shop architecture

This is a French-first invitation experience for Sall Shop’s anniversary on 28 October 2026 at 14:30 UTC in Ouakam, Dakar. The public editorial shell previews the event; private program descriptions and personalized PDF invitations require a shared invitation code verified on the server.

## Key directories

- `src/routes/index.tsx`: responsive event page, live countdown, program preview, private program, invitation dialog, calendar download, QR verification feedback, FAQ and partners.
- `src/routes/__root.tsx`: French document shell, social metadata and favicon.
- `src/styles.css`: off-black/gold palette, DM Sans body and Barlow Condensed headings, responsive layouts and reduced-motion handling.
- `netlify/functions/invitation.mts`: shared-code authentication, session lookup and logout, personal PDF generation and anonymous pass verification.
- `db/schema.ts` and `db/index.ts`: Drizzle schema and Netlify Database client factory.
- `netlify/database/migrations`: generated migrations applied by the deployment platform.
- `public/img`: local static editorial imagery, served through Netlify Image CDN.
- `scripts/generate-image.mjs`: optional one-time campaign image generation through Netlify AI Gateway.
- `src/components/ui`: existing Radix UI primitives; use these for accessible interactions.

## Conventions and decisions

Use TypeScript, functional React components, semantic HTML and accessible labels. Keep page copy in French. Never embed the invitation code or session tokens in source, URLs or logs. The common code is read through `Netlify.env.get('SALL_INVITATION_CODE')`; missing configuration fails closed. This shared-code experience intentionally has no email/password accounts, signup or Netlify Identity flow.

Persist application records using Netlify Database. The only browser credential is an HttpOnly cookie; the database stores its SHA-256 hash. Keep program descriptions in the protected server response. The public program labels are intentionally previews. The owner explicitly requested a public list of names and nicknames submitted during PDF retrieval. Publish only those two fields from invitation_downloads; never publish pre-existing guest records retroactively, session data or invitation references. Do not generate fake guest totals. Invitations have random UUID references; a public verification request returns validity only. QR verification does not mark attendance and is not proof of identity.

Do not invent intermediate schedule times, an event end time, phone numbers, GPS coordinates or parking availability. The map is a place search. The owner has supplied a shared code in conversation. It must be configured only as a Netlify environment secret before guests can log in; never copy its value into repository files or logs. Never introduce a hardcoded fallback.

Schema changes require Drizzle migrations under `netlify/database/migrations`. Never apply migrations directly. Preserve previous applied migrations. Use `.js` extensions for imports in server and database modules.

Respect runtime-only browser APIs: access them from effects or event handlers, not SSR render. Maintain French metadata and reduced-motion support. Static images should use Netlify Image CDN. The main campaign image is illustrative, not a claim about actual event attendees.

For this project’s automated editing workflow, do not run local builds, dev servers, tests or typecheck commands; the platform validates after edits. Review changes by reading files. Keep README and the delivery summary up to date.
