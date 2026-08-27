# Host helpers (DarkAI)

`telemetry_store.py` is copied into the DarkAI `un_default/` package on deploy.
It backs:

- `POST /un-default/api/telemetry`
- `GET /un-default/api/stats`
- `GET /un-default/api/badge/action_run.svg`

Optional durable sync across Render restarts: set `TELEMETRY_GIST_ID` and
`TELEMETRY_GIST_TOKEN` on the DarkAI service.
