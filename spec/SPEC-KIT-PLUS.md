# Spec-Kit-Plus (local summary)

This repository includes a lightweight adaptation of spec-kit-plus templates to keep specs consistent across features and teams.

Goals

- Provide short, actionable spec templates for fast feature design and review.
- Keep API contracts and data model changes documented.
- Record major architecture decisions.

Included templates

- `templates/feature-spec.md` — Feature specification template (goals, acceptance criteria, rollout).
- `templates/api-spec.md` — API contract template (endpoints, request/response examples).
- `adr/template.md` — Architecture Decision Record template.

Usage

1. Create a folder under `spec/` for a large feature if needed (e.g., `spec/feature-login/`).
2. Copy relevant templates from `spec/templates/`.
3. Link PRs and issues back to the spec. Update the spec as the design evolves.

Notes

- These templates are intentionally concise to lower friction for engineers and PMs.
- If you want a richer spec-kit-plus import or automated tooling, I can add scripts or a generator next.
