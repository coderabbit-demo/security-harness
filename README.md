# security-harness

Minimal Express + TypeScript app used as the **primary repository fixture for the CodeRabbit "First Demo" runbook**. Not for production. The runbook is structured as **Acts**: a cold open (Act 0, IDE/CLI), a home-base pull request that carries the bulk of the demo (**Act 1 = PR #14**), four departures for what one PR can't show (Acts 2a–2d), and optional specialized surfaces (Acts 3A–3E). Most acts are pull requests in this repo; the runbook also covers a local-only branch (Act 0), an external pull request (Act 3C), and two companion repos for the cross-repo acts (Act 3D / 3E). Every demo PR here carries the **`Demo - Do Not Merge`** label plus a second label naming the moment it represents.

## Demo acts by PR

| PR | Label | Act | What it demonstrates |
|----|-------|-----|----------------------|
| [#14](https://github.com/coderabbit-demo/security-harness/pull/14) | Security wall + walkthrough | **Act 1 (home base)** | Walked top-to-bottom: summary + sequence diagram, triaged tags, `"Observation:"` tone + path-rule citation, a wall of `🔒 Critical` findings (plaintext password/SSN/CVV, forgeable `session-${id}` token, HTTP exfil, IDOR), chat/Learnings, finishing touches, and a blocked Security Gate. |
| [#36](https://github.com/coderabbit-demo/security-harness/pull/36) | Learnings recall | Act 1 · Station 7 | Re-introduces #14's IDOR pattern (`GET /api/customers/:id` with no auth) to trigger the 🧠 Learnings recall of the #14 learning. *(Recall pending learnings indexing — see notes.)* |
| [#15](https://github.com/coderabbit-demo/security-harness/pull/15) | Committable fix + green gate | Act 2a | Functional discount bug with a 📝 committable suggestion; Security Gate stays ✅ green ("functional ≠ security"). |
| [#16](https://github.com/coderabbit-demo/security-harness/pull/16) | Benign PR (gate green) | Act 2a | Safe `/api/time` endpoint; Security Gate ✅ green. |
| [#20](https://github.com/coderabbit-demo/security-harness/pull/20) | Change Stack: series base | Act 2b | Bookings create/list — base of the dependent stack. |
| [#25](https://github.com/coderabbit-demo/security-harness/pull/25) | Change Stack: availability | Act 2b | Bookings availability (stack part 2). |
| [#26](https://github.com/coderabbit-demo/security-harness/pull/26) | Change Stack: pricing | Act 2b | Bookings pricing (stack part 3). |
| [#27](https://github.com/coderabbit-demo/security-harness/pull/27) | Change Stack: report | Act 2b | Bookings report (stack part 4). |
| [#17](https://github.com/coderabbit-demo/security-harness/pull/17) | Agent guardrail weakening caught | Act 2c | `AGENTS.md` edit that permits `exec` interpolation and agent self-authorization; flagged 🔒, Security Gate ❌. |
| [#21](https://github.com/coderabbit-demo/security-harness/pull/21) | Jira issue assessment (CRDEMO-1) | Act 2d | Reads Jira CRDEMO-1: Linked Issues ⚠️ (2 gaps) + Out of Scope ⚠️ (notes endpoint). |
| [#18](https://github.com/coderabbit-demo/security-harness/pull/18) | IaC: public S3 blocked | Act 3A | `public-read` S3 + anonymous `s3:GetObject` + no encryption; `🧰 Tools` / Linters-SAST source; Security Gate ❌. |
| [#19](https://github.com/coderabbit-demo/security-harness/pull/19) | Lint / ESLint sample | Act 3A | Coupon endpoint with lint-class findings. |
| [#1](https://github.com/coderabbit-demo/security-harness/pull/1) | GitHub Actions script injection | Act 0 / 3A | A workflow interpolates `${{ github.event.pull_request.title }}` into a `run:` shell step. |
| [#30](https://github.com/coderabbit-demo/security-harness/pull/30) | Multi-repo breaking change | Act 3D | Renames the pricing response field; `Linked repositories` finding names the consumer's broken call site. |
| [#31](https://github.com/coderabbit-demo/security-harness/pull/31) | Cross-repo coding guidelines | Act 3E | Float discount multiplier; `Coding guidelines` finding cites `money.md` in `coderabbit-standards`. |

## Not a PR here

- **Act 0 — local IDE/CLI:** branch [`feat/host-diagnostics`](https://github.com/coderabbit-demo/security-harness/tree/feat/host-diagnostics) — command injection (RCE) + an off-by-one, for running the CodeRabbit IDE plugin / CLI live. No PR by design.
- **Act 3C — config vs UI (4 → 32):** [`coderabbit-demo/up-rust` #1](https://github.com/coderabbit-demo/up-rust/pull/1), labeled `Config vs UI contrast` (the config-change protection is verified here — see the closed #32).

## Cross-repo companions (Act 3D / 3E)

- **[`coderabbit-demo/security-harness-consumer`](https://github.com/coderabbit-demo/security-harness-consumer)** — downstream consumer of the pricing API (Act 3D).
- **[`coderabbit-demo/coderabbit-standards`](https://github.com/coderabbit-demo/coderabbit-standards)** — shared coding-guideline Markdown referenced from this repo's `.coderabbit.yaml` (Act 3E).

## Infrastructure PRs (merged)

- [#28](https://github.com/coderabbit-demo/security-harness/pull/28) — cross-repo linking config (`linked_repositories` + cross-repo `code_guidelines`).
- [#29](https://github.com/coderabbit-demo/security-harness/pull/29) — the stable `POST /api/pricing/quote` contract that the consumer depends on.

## Configuration

`.coderabbit.yaml` is the policy: tone (`Observation:`), path instructions, an ast-grep rule (`.coderabbit/ast-grep-rules/no-exec-template.yml`), the security `Security Gate` pre-merge check, finishing touches, and cross-repo links. `AGENTS.md` / `CONTRIBUTING.md` are the code-guideline surface. Reviews run on `main`-based PRs.

## Notes

- **Learnings recall (#36):** the #14 learnings are created but not yet surfacing a 🧠 Learnings section on new reviews — likely learnings-indexing latency (they were created recently). #36 isolates the one #14 learning with no competing coding-guideline (authorization / IDOR); re-review it once the learnings settle. The repo's `AGENTS.md` / `CONTRIBUTING.md` guidelines cover the other #14 learnings (secrets, tokens, validation, DTO), so those attribute to `Coding guidelines` rather than a learning.
