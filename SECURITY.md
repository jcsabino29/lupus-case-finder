# Security Policy

Lupus Case Finder is a portfolio project that handles **synthetic** patient
records. It is built as if the data were real protected health information
(PHI), so security reports are taken seriously.

## No real patient data, ever

- This project, its demo deployment and its repository must **never** contain
  real patient data or real personally identifiable information (PII).
- All patients are generated with [Synthea](https://github.com/synthetichealth/synthea).
  Generated output is git-ignored and loaded straight into the database.
- Do not open issues, pull requests or discussions containing real medical
  records, screenshots of real records, or real names, dates of birth, MRNs,
  addresses or phone numbers.
- The hosted demo runs on infrastructure **without** a HIPAA Business
  Associate Agreement. It is not approved for PHI and must not be used with it.

If you believe real PHI or PII has been committed or exposed anywhere in this
project, report it privately (below) and do not copy or share it.

## Supported versions

Only the latest commit on `main` and the current demo deployment are supported.

## Reporting a vulnerability

Please **do not** open a public issue for security problems.

1. Use GitHub's private vulnerability reporting:
   **Security → Report a vulnerability** on this repository.
2. Include what you found, steps to reproduce, and the impact you expect.
   Use synthetic data only in any proof of concept.

You can expect an acknowledgement within 5 business days and a status update
within 14 days. Valid reports are fixed as quickly as possible and credited in
the release notes unless you prefer otherwise.

## Scope

In scope: the application code in this repository, its database migrations
and access controls, the CI configuration, and the demo deployment.

Out of scope: denial-of-service or load testing against the demo, social
engineering, physical attacks, and findings in third-party services
(Vercel, Supabase, OpenAI) that should go to those vendors.

## Safe harbor

Good-faith research that follows this policy, avoids privacy violations and
service disruption, and uses only synthetic data will not be pursued legally.

## Security controls in this repository

- Strict, nonce-based Content Security Policy and hardened HTTP headers
  (`src/proxy.ts`, `src/lib/security/`).
- Separate `protected` and `research` Postgres schemas with least-privilege,
  no-login roles (`supabase/migrations/`), verified by pgTAP tests.
- Secrets only in Vercel and GitHub encrypted settings; `.env*` files are
  git-ignored, and gitleaks scans every push.
- CodeQL, `npm audit`, `pip-audit` and Dependabot on every change.
