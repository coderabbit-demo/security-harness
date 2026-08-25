# security-harness: single-repo demo plan

Goal: make `coderabbit-demo/security-harness` the one repo behind every use case in the
First Demo runbook, so the whole demo runs from a single clone in one language
(TypeScript + Express). Today the repo covers UC1 only.

Status legend: [done] shipped · [build] code/PR to add · [config] `.coderabbit.yaml` or repo config · [integration] external setup (see Integrations section) · [confirm] verify a plan/org feature is on.

---

## Current state (Aug 2026)

- Stack: TypeScript + Express, single `src/index.ts`.
- Branches: `main`, `add-ci` (PR #1 "Add CI workflow"), `feat/host-diagnostics`.
- **UC1 [done]:** `feat/host-diagnostics` carries two findings for the IDE/CLI demo:
  an OS command injection (RCE) on `/api/diagnostics/ping`, and an off-by-one
  functional-correctness bug on `/api/diagnostics/summary`.
- No `.coderabbit.yaml` in the repo yet. No issues.

---

## Foundation to add first (unlocks UC4 to UC8)

One-time additions, mostly on `main`:

1. **`.coderabbit.yaml` [config]** committed to the repo: `tone_instructions`,
   `path_instructions`, `path_filters`, `reviews.tools`, `pre_merge_checks`,
   `knowledge_base.learnings`, `finishing_touches`, `code_guidelines`,
   `reviews.assess_linked_issues: true`.
2. **`.coderabbit/ast-grep-rules/no-exec-template.yml` [config]**: a TS structural rule
   (flag `child_process.exec`/`execSync` called with a template literal, severity `error`).
   TS analog of up-rust's panic-in-`extern "C"`; also structurally catches the UC1 RCE.
3. **`AGENTS.md` + `CONTRIBUTING.md` (or `docs/`) [build]**: needed for the
   agent-instruction security surface (UC4), the "Update AGENTS.md" recipe (UC5/UC7),
   and `code_guidelines` pointed at your own Markdown (UC8).
4. **Layered structure [build]** `src/routes -> src/controllers -> src/services` so PRs
   produce real control flow for sequence diagrams.
5. **ESLint config [build]** so the `Tools` scanner story has a clean in-repo example.

---

## Per use case

### UC1 - Catch it before the PR (IDE & CLI) [done]
Anchor branch `feat/host-diagnostics`. No new work.

### UC2 - Understand & defend your PR
- **Sequence diagram + summary + effort [build]:** `feat/customer-accounts` PR spanning
  route -> controller -> service -> data. A layered multi-file change is what makes
  CodeRabbit render the changes table + `sequenceDiagram` + effort estimate.
- **Committable suggestion [build]:** include a mechanical Critical bug (unguarded property
  access that throws a raw `TypeError` and falls through to a generic 500). CodeRabbit
  offers a one-click committable suggestion.
- **Chat -> generate unit tests [build][confirm]:** ship pure, untested functions; then
  `@coderabbitai generate unit tests` opens a bot PR. Needs `finishing_touches.unit_tests`
  and the feature enabled for the org.
- **Learnings [build][confirm]:** run `@coderabbitai review all comments ... create learnings`
  on one PR, then a second PR that re-triggers the rule so the `Learnings` section appears.
  Needs `knowledge_base.learnings`.
- **Always-on security on a normal PR [build]:** `feat/customer-accounts` innocently
  introduces plaintext passwords, stored SSN/CVV, a predictable `session-${id}` token, and
  HTTP exfil of the customer object. Reproduces the shopping-cart #20 wall of Critical
  security findings in one TS feature PR.

### UC3 - Review at scale (triage + Change Stack)
- **Triage tags [build]:** the `feat/customer-accounts` PR already yields a mix of
  categories/severities/effort. No extra work.
- **Change Stack [build][confirm]:** add a dependent PR series (4 to 5 stacked PRs), e.g.
  `booking-api -> availability -> pricing -> reporting -> csv-export`, each branched off the
  previous. Change Stack needs a real stack to navigate. Confirm Change Stack is enabled.

### UC4 - Customization (tone + path + AST)
- **Tone [config]:** `tone_instructions`, then any PR whose findings open in that voice.
- **Path instructions + filters [config]:** e.g. a `**/*.test.ts` rule and `path_filters`
  to silence `dist/**` and generated files.
- **AST rule [config]:** `no-exec-template.yml` shown firing on the `feat/host-diagnostics`
  exec line. Confirm the `ast-grep` tool is enabled.
- **Agent-instruction security surface + a LIVE catch [config][build]:** a path instruction
  flagging edits to `AGENTS.md`/`CLAUDE.md`/`.cursorrules`, then a `feat/agents-guardrail`
  PR that weakens a guardrail in `AGENTS.md`. Fills the gap the runbook calls out (no live
  catch exists in the org today).

### UC5 - Enforce & close the loop
- **Security-scoped pre-merge gate [config][confirm]:** a `min-level` custom check scoped to
  security. Contrasting PRs so the gate visibly does the right thing:
  `feat/host-diagnostics` (RCE) -> blocked; a benign `feat/clock` refactor -> green; a
  `feat/config-bug` with a non-security Critical -> Critical inline, gate stays green.
  Custom pre-merge checks may be a plan/dashboard feature: confirm.
- **Post-merge recipe [config][confirm]:** an "Update AGENTS.md" custom recipe; checking the
  box opens a bot PR folding review knowledge into `AGENTS.md`.
- **Issue assessment [build][integration]:** create a **Jira** issue in the **CRDEMO**
  project with EARS-style acceptance criteria, then a `feat/linked-issue` PR that references
  the ticket (e.g. `Resolves CRDEMO-NN` or the ticket URL). CodeRabbit reads the ticket via
  the native Jira integration and renders "Assessment against linked issues" + a "Comply
  With Ticket" gate. This is the behavioral moment: it evaluates the code against a ticket it
  fetched from Jira, not just the PR text.

### UC6 - Security at a glance (breadth + scanners + IaC)
- **Scanners under `Tools` [config][build][confirm]:** an ESLint violation (cleanest
  quotable example), plus gitleaks/semgrep enabled; optionally a dummy committed secret for
  the secret-scanner story.
- **IaC in scope [build][confirm]:** add `infra/main.tf` with an insecure-by-design resource
  (public-read S3 bucket, no public-access block) so Checkov/Trivy flag it.

### UC7 - Finishing touches (docstrings, tests, recipes)
- Overlaps UC2 (unit tests) and UC5 (recipe). Add `finishing_touches.docstrings` + a file
  with undocumented exported functions so the docstrings menu item produces a PR. Keep the
  "Update AGENTS.md" recipe. Gives real artifacts instead of "describe the menu."

### UC8 - Author standards live (the pilot/close)
- Nothing new beyond the UC4+UC5 foundation. Keep one candidate rule un-authored to write
  live (the `no-exec-template` ast-grep rule or a path instruction), plus one pre-merge
  check in `warning` mode to promote to `error`. Point `code_guidelines` at `CONTRIBUTING.md`.

---

## Branch & PR map

| Branch / artifact | Use case(s) | Purpose |
|---|---|---|
| `feat/host-diagnostics` [done] | UC1, UC4-AST, UC5-gate-block | RCE + off-by-one |
| `main` foundation | UC4, UC5, UC6, UC7, UC8 | config, ast rule, AGENTS.md, CONTRIBUTING.md, eslint, layering |
| `feat/customer-accounts` | UC2, UC3-triage, UC5-PII gate | layered feature + planted security + committable bug |
| `feat/booking-*` (stacked x4-5) | UC3 Change Stack | dependent series |
| `feat/agents-guardrail` | UC4 live catch | weakens a guardrail in AGENTS.md |
| `feat/clock` (benign) | UC5 gate green | refactor that should not block |
| `feat/config-bug` | UC5 gate scoping | non-security Critical, gate stays green |
| `feat/linked-issue` + Jira CRDEMO ticket | UC5 issue assessment | references `CRDEMO-NN` |
| `infra/*.tf` + eslint/secret triggers | UC6 | IaC + scanners |

## Build order
1. Foundation (config, ast rule, AGENTS.md, CONTRIBUTING.md, layering, eslint).
2. `feat/customer-accounts` (UC2 + UC3-triage + UC5-PII).
3. Stacked series (UC3 Change Stack).
4. Gate-contrast PRs: benign + non-security-bug (UC5).
5. `feat/agents-guardrail` (UC4 live catch) + linked-issue PR/issue (UC5).
6. `infra/main.tf` + ESLint/secret triggers (UC6).

---

## Integrations & MCPs required (your setup)

Grouped by what you need to turn on. Items marked "repo-only" I can do in code; the rest are
dashboard/org/OAuth actions.

### A. Repo & app enablement (must-have, powers everything) [confirmed]
- **CodeRabbit reviewing `coderabbit-demo/security-harness`** is enabled. Everything else
  depends on it.
- **`.coderabbit.yaml` in the repo** (repo-only, I author it). It reads from the PR head
  branch, so it must land on each feature branch (or on `main` and be inherited).

### B. Plan / feature flags [confirmed on for coderabbit-demo]
All six are available:
1. **Pre-merge checks + custom checks** (UC5 security gate, UC8 warning-mode check).
2. **Finishing touches** (UC2/UC7 unit-test generation, docstrings) and **custom recipes**
   (UC5/UC7 "Update AGENTS.md" opening a bot PR).
3. **Change Stack** (UC3 stacked-diff app view).
4. **Learnings / knowledge base** (UC2 memory).
5. **ast-grep tool** (UC4 structural rule).
6. **Integrated scanners** (UC6): ESLint, Gitleaks, Semgrep, and **IaC scanners**
   (Checkov/Trivy) for Terraform. This org anonymizes names (Gitleaks -> "Betterleaks",
   Semgrep -> "OpenGrep").

### C. Issue tracker (UC5 "did we build the ticket") [decided: Jira native]
- **Jira, native integration, project `CRDEMO`.** Jira is already connected at the org level
  (no MCP, no per-repo token). Setup for the demo:
  1. Create one or more Jira issues in the **CRDEMO** project with descriptive **EARS-style**
     acceptance criteria (the requirement count is the tell, so make the criteria explicit).
  2. The `feat/linked-issue` PR references the ticket (e.g. `Resolves CRDEMO-NN` or the
     ticket URL).
  CodeRabbit fetches the CRDEMO ticket and renders "Assessment against linked issues" +
  "Comply With Ticket". GitHub-Issues variant is not used.

### D. MCP connections (decided: none) [decided]
- No MCP. Issue context comes from the **native Jira integration** in section C only.

### E. Notifications - Slack (in scope) [decided]
- Workspace: **coderabbitdemo.slack.com**. Adds a notification/interaction surface: review
  summaries and PR status posted to a channel, asking CodeRabbit in Slack (mention it to
  query a PR or trigger a review), and scheduled reports. Setup:
  1. Connect **Slack** in the CodeRabbit dashboard (OAuth to `coderabbitdemo.slack.com`).
  2. Choose/create a target channel (suggested: **#security-harness-demo**).
  3. Enable review-summary + PR-status delivery, and optionally a scheduled report.
  Tell me the final channel name so I can reference it in the runbook. Not tied to a specific
  UC1 to UC8 beat; it is an add-on notification surface.

### F. CLI / IDE (UC1, already working)
- The **CodeRabbit IDE plugin** (VS Code / Cursor) and **CLI** already drive UC1. No extra
  setup for this single-repo demo.

---

## Confirmed decisions (Aug 2026)

- **A. Repo enabled:** yes.
- **B. Six plan features:** all on.
- **C. Issue assessment:** Jira native, project **CRDEMO** (create issues with descriptive
  EARS acceptance criteria). GitHub Issues not used.
- **D. MCP:** none; native Jira only.
- **E. Slack:** in scope, workspace `coderabbitdemo.slack.com` (channel to confirm).
- **Stack:** stay TypeScript + Express (single language).

Net: all integration prerequisites are green. Remaining setup on your side is only the
content (create the CRDEMO Jira issues) and the Slack channel + connection; everything else is
repo-only work.
