# security-harness

Minimal Express + TypeScript app used as the **single-repo fixture for the CodeRabbit "First Demo" runbook**. Not for production. Every demo use case is a pull request in this repo (plus two companion repos for the cross-repo cases). All demo PRs carry the **`Demo - Do Not Merge`** label and a second label naming the use case they represent.

## Demo use cases by PR

| PR | Use-case label | Use case | What it demonstrates |
|----|----------------|----------|----------------------|
| [#1](https://github.com/coderabbit-demo/security-harness/pull/1) | GitHub Actions script injection | UC1 / UC6 | A workflow interpolates `${{ github.event.pull_request.title }}` into a `run:` shell step. |
| [#14](https://github.com/coderabbit-demo/security-harness/pull/14) | Security wall + walkthrough | UC2 / UC3 / UC5 | Always-on security on a normal feature PR: plaintext password/SSN/CVV, forgeable `session-${id}` token, HTTP exfil; summary + sequence diagram; Security Gate ❌. |
| [#15](https://github.com/coderabbit-demo/security-harness/pull/15) | Committable fix + green gate | UC2 / UC5 | Functional discount bug with a 📝 committable suggestion; Security Gate stays ✅ green ("functional ≠ security"). |
| [#16](https://github.com/coderabbit-demo/security-harness/pull/16) | Benign PR (gate green) | UC5 | Safe `/api/time` endpoint; Security Gate ✅ green. |
| [#17](https://github.com/coderabbit-demo/security-harness/pull/17) | Agent guardrail weakening caught | UC4 / UC5 | `AGENTS.md` edit that permits `exec` interpolation and agent self-authorization; flagged 🔒, Security Gate ❌. |
| [#18](https://github.com/coderabbit-demo/security-harness/pull/18) | IaC: public S3 blocked | UC6 | `public-read` S3 + anonymous `s3:GetObject` + no encryption; `🧰 Tools` / Linters-SAST source; Security Gate ❌. |
| [#19](https://github.com/coderabbit-demo/security-harness/pull/19) | Lint / ESLint sample | UC6 | Coupon endpoint with lint-class findings. |
| [#20](https://github.com/coderabbit-demo/security-harness/pull/20) | Change Stack: series base | UC3 | Bookings create/list — base of the dependent stack. |
| [#21](https://github.com/coderabbit-demo/security-harness/pull/21) | Jira issue assessment (CRDEMO-1) | UC5 | Reads Jira CRDEMO-1: Linked Issues ⚠️ (2 gaps) + Out of Scope ⚠️ (notes endpoint). |
| [#25](https://github.com/coderabbit-demo/security-harness/pull/25) | Change Stack: availability | UC3 | Bookings availability (stack part 2). |
| [#26](https://github.com/coderabbit-demo/security-harness/pull/26) | Change Stack: pricing | UC3 | Bookings pricing (stack part 3). |
| [#27](https://github.com/coderabbit-demo/security-harness/pull/27) | Change Stack: report | UC3 | Bookings report (stack part 4). |
| [#30](https://github.com/coderabbit-demo/security-harness/pull/30) | Multi-repo breaking change | UC10 | Renames the pricing response field; `Linked repositories` finding names the consumer's broken call site. |
| [#31](https://github.com/coderabbit-demo/security-harness/pull/31) | Cross-repo coding guidelines | UC11 | Float discount multiplier; `Coding guidelines` finding cites `money.md` in `coderabbit-standards`. |

## Not a PR here

- **UC1 — local IDE/CLI:** branch [`feat/host-diagnostics`](https://github.com/coderabbit-demo/security-harness/tree/feat/host-diagnostics) — command injection (RCE) + an off-by-one, for running the CodeRabbit IDE plugin / CLI live. No PR by design.
- **UC9 — config vs UI (4 → 32):** [`coderabbit-demo/up-rust` #1](https://github.com/coderabbit-demo/up-rust/pull/1), labeled `Config vs UI contrast` (the config-change protection is verified here — see the closed #32).

## Cross-repo companions

- **[`coderabbit-demo/security-harness-consumer`](https://github.com/coderabbit-demo/security-harness-consumer)** — downstream consumer of the pricing API (UC10).
- **[`coderabbit-demo/coderabbit-standards`](https://github.com/coderabbit-demo/coderabbit-standards)** — shared coding-guideline Markdown referenced from this repo's `.coderabbit.yaml` (UC11).

## Infrastructure PRs (merged)

- [#28](https://github.com/coderabbit-demo/security-harness/pull/28) — cross-repo linking config (`linked_repositories` + cross-repo `code_guidelines`).
- [#29](https://github.com/coderabbit-demo/security-harness/pull/29) — the stable `POST /api/pricing/quote` contract that the consumer depends on.

## Configuration

`.coderabbit.yaml` is the policy: tone (`Observation:`), path instructions, an ast-grep rule (`.coderabbit/ast-grep-rules/no-exec-template.yml`), the security `Security Gate` pre-merge check, finishing touches, and cross-repo links. `AGENTS.md` / `CONTRIBUTING.md` are the code-guideline surface. Reviews run on `main`-based PRs.
