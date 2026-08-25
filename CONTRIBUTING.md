# Contributing / Code Guidelines

CodeRabbit reads this file as code guidelines and reviews pull requests against it.

## Security
- Use `execFile` with an argument array. Never use `exec`/`execSync` with interpolated strings.
- No plaintext secrets, passwords, SSNs, or card data. Hash credentials; use a secret manager.
- Session tokens must come from a CSPRNG, never a `session-${id}` style string.
- Validate all request input; reject malformed input with a 400 before it reaches a service.

## Correctness
- A passing test that encodes the wrong behavior is a defect, not evidence of correctness.
- Guard array and object access; do not let malformed input throw a raw `TypeError` into a 500.

## Architecture
- Layer as `route -> controller -> service`. Controllers stay thin; side effects live in
  services.
