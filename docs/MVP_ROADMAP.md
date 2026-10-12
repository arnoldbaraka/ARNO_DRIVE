# ARNO DRIVE production roadmap

## Current prototype
React browser-local preview: driver profile, garage, custom vehicle model, trip discovery, clubs, roadside map links, service categories, community text posts, vehicle classifieds, OpenStreetMap embed and Waze handoff. No multi-user data persistence or live dispatch.

## P0 — safe beta foundation
- Repair build and establish CI tests, preview deployment, monitoring, health checks and rollback.
- Remove committed .env from active tracking and rotate any leaked secrets; purge Git history only via coordinated procedure.
- PostgreSQL + PostGIS backend, database migrations, backups and restore drill.
- Account signup, verified email/phone, sessions, password reset, rate limiting and role-based authorization.
- Image/video object storage, malware scanning, size limits, moderation and copyright reporting.
- Listings CRUD, business claims, stock management, seller identity checks, admin moderation and fraud reporting.
- Business directory import from OSM under ODbL terms, dedupe, freshness timestamps and opt-out.
- HTTPS, WAF, CSP, CORS, audit logs, privacy/terms and Kenya data-protection review.

## P1 — commercial capabilities
- Daraja STK Push and callbacks with signature/source validation, idempotency, reconciliation and refunds.
- Stripe Checkout where account capabilities are approved; verify webhook signatures and settle supported currencies.
- Shop profiles: showroom, mechanic, tyres, paint, bodywork, fuel, towing, parts wholesalers and retailers.
- Vehicle VIN/chassis and ownership checks only through authorized providers and consent.
- Kenya-only commercial service eligibility enforced server-side; global browse and permitted support/donations.
- Search by make/model/year/engine code, stock and geographic proximity.

## P2 — communities and mobility
- Trip organizer, RSVPs, convoys, opted-in live location sharing, incident escalation and safety features.
- Comments, media feeds, car clubs, reputation and non-speed-based leaderboards.
- Android mobile app, then Android Auto compatible driver-distraction-safe navigation surfaces under platform review.
- Real-time availability and dispatch only after verified providers and operations are established.

## Operational acceptance gates
Do not announce public production until builds, automated tests, auth, payments, backups, incident handling, privacy, moderation and operational permissions are verified. Public roads must not be used for competitive racing.
