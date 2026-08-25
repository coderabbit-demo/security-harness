# AGENTS.md

Guardrails for coding agents (and humans) working in this repository. CodeRabbit treats this
file as a security-critical review surface: changes that weaken these rules are flagged in
review.

## Non-negotiable guardrails
1. **No shell interpolation.** Never pass user-controlled or interpolated input to a shell. Do
   not use `child_process.exec` or `execSync` with template literals. Use
   `execFile("cmd", [args])` with an argument array so inputs cannot be interpreted by a shell.
2. **No plaintext secrets.** Never store secrets, passwords, SSNs, card numbers, or CVVs in
   code, logs, or the database in plaintext. Use a secret manager and hash credentials.
3. **No predictable tokens.** Never issue predictable or forgeable session identifiers. Use a
   CSPRNG.
4. **Validate input.** Validate and bound all request input before it reaches a service or a
   side effect.
5. **No data exfiltration.** Do not send customer data to external hosts.

## Architecture
Requests flow `route -> controller -> service`. Keep side effects in services and validation at
the edge.
