# Relay
A full-stack collaborative storytelling app. Start an original scene, continue any scene into a new branch, and explore alternate endings.

## Stack
React, TypeScript, Vinext, Cloudflare Workers, D1 (SQLite), R2 uploads. Sites-managed ChatGPT identity. The first deployment is owner-private.

## Features
- Discover/search/filter stories; clearly identified sample prompts
- Branching scenes and navigation through parent/child relationships
- Written, video, image, and audio scenes (20 MB upload limit)
- Per-account likes and saved scenes
- Comments and creator studio
- Persistent database and object storage
- Story deep links and native sharing

## Development
`npm run dev` starts the development server. `npm run db:generate` generates schema migrations. Build through the Sites build helper documented in the hosting workflow. Apply local D1 migrations before previewing API-backed features. Hosted migrations are applied at deployment.

## Current scope
Private early access, not a public social-network launch. There are no fabricated users, reaction counts, or views. Demo scenes are original fictional prompts. A name is a creator display label, not a verified identity. Upload rights remain the contributor's responsibility. Before public launch: add reporting and moderation workflows, quotas/rate limiting, media scanning/transcoding, stronger pagination, operational monitoring, deletion/export workflows, and a clear contributor licence. Uploaded video is played as provided; there is no automatic editing or clip concatenation.
