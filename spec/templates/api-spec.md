# API Specification

<!-- Use this template for endpoint-level contract definitions -->

Title / Short description:

Endpoint:
- `GET|POST|PUT|DELETE` `/path/to/resource`

Description:
- What this endpoint does and which flows use it.

Auth:
- Required: Yes/No. Role-based details if needed.

Request:
- Headers (e.g., `Authorization: Bearer <token>`)
- Query params
- Body (example JSON)

Response:
- Success response example (200):
```
{
  "data": { }
}
```

Errors:
- 400: Bad request — when ...
- 401: Unauthorized — when ...
- 404: Not found — when ...

Data model impact:
- Which tables/fields are read/updated.

Migration / Backwards compatibility:
- Notes about DB migrations and client compatibility.

Rate limits / Performance:
- Any special constraints.

Examples:
- cURL example

Related specs / tests:
- Link to feature spec or tests.
