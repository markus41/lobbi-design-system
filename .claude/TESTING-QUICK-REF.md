# Testing Initiative - Quick Reference Guide
**Last Updated:** 2025-11-29

---

## Current Status

| Metric | Current | Target | Progress |
|--------|---------|--------|----------|
| **Coverage** | 5.98% | 80% | ❌ 0/80 |
| **Unit Tests** | 205 | 1,200+ | ❌ 205/1,200 |
| **E2E Tests** | 2 | 20+ | ❌ 2/20 |
| **Phase** | 1 | 11 | ✅ 1/11 |

---

## Phase Status

| Phase | Status | Duration | Tests | Coverage Target |
|-------|--------|----------|-------|----------------|
| 1. Strategic Analysis | ✅ Done | 2 days | 0 | N/A |
| 2. Infrastructure | ⏳ Next | 3 days | 0 | N/A |
| 3. Critical APIs (P1) | ⏸️ Pending | 5 days | 470 | 30%+ |
| 4. Core Logic (P2) | ⏸️ Pending | 5 days | 320 | 60%+ |
| 5. Integrations (P3) | ⏸️ Pending | 4 days | 250 | 70%+ |
| 6. Hooks (P4) | ⏸️ Pending | 5 days | 335 | 70%+ |
| 7. Components (P5) | ⏸️ Pending | 7 days | 404 | 75%+ |
| 8. E2E Testing | ⏸️ Pending | 5 days | 0 | 80%+ |
| 9. Tech Debt | ⏸️ Pending | 3 days | 0 | N/A |
| 10. CI/CD | ⏸️ Pending | 3 days | 0 | N/A |
| 11. Documentation | ⏸️ Pending | 2 days | 0 | N/A |

**Estimated Completion:** Week 6 (30 working days)

---

## Top 10 Priority Modules

| Rank | Module | Risk | Coverage | Tests | Status |
|------|--------|------|----------|-------|--------|
| 1 | lib/api/stripe.ts | 10/10 | 0% | 180 | ⏸️ Phase 3 |
| 2 | lib/api/invoices.ts | 9.5/10 | 0% | 90 | ⏸️ Phase 3 |
| 3 | lib/api/email.ts | 9/10 | 0% | 120 | ⏸️ Phase 3 |
| 4 | components/payments/** | 8.5/10 | Partial | 60 | ⏸️ Phase 3 |
| 5 | lib/api/documents.ts | 8/10 | 0% | 80 | ⏸️ Phase 4 |
| 6 | lib/api/automations.ts | 7.5/10 | 0% | 100 | ⏸️ Phase 4 |
| 7 | lib/email/sendgrid.tsx | 7/10 | 0% | 80 | ⏸️ Phase 3 |
| 8 | lib/video/zoom.ts | 6.5/10 | 0% | 60 | ⏸️ Phase 5 |
| 9 | lib/calendar/ical.ts | 6/10 | 0% | 50 | ⏸️ Phase 5 |
| 10 | lib/api/campaigns.ts | 5.5/10 | 0% | 70 | ⏸️ Phase 4 |

---

## Agent Assignments

### Active Agents (Phase 2)
- **devops-automator** - ESLint configuration, pre-commit hooks
- **architect-supreme** - Test architecture and patterns
- **resource-allocator** - Test execution optimization

### Upcoming Agents (Phase 3)
- **code-generator-typescript** - Primary test implementation (2 tracks)
- **security-specialist** - Payment security testing

### Full Roster (16 Agents)
1. master-strategist (coordination)
2. devops-automator (infrastructure, CI/CD)
3. architect-supreme (test architecture)
4. resource-allocator (optimization)
5. code-generator-typescript (primary testing)
6. security-specialist (security tests)
7. test-strategist (enhanced coverage)
8. frontend-engineer (component tests)
9. chaos-engineer (integration resilience)
10. accessibility-expert (a11y compliance)
11. qa-engineer (E2E orchestration)
12. e2e-tester (cross-browser)
13. performance-optimizer (benchmarks)
14. senior-reviewer (code review)
15. cicd-engineer (CI/CD pipeline)
16. docs-writer (documentation)

---

## Quick Commands

### Run Tests
```bash
# All unit tests
npx vitest run

# With coverage
npx vitest run --coverage

# Watch mode
npx vitest

# Specific file
npx vitest run path/to/test.test.ts

# E2E tests
npm run test:e2e

# E2E specific browser
npm run test:e2e:chromium
```

### Coverage Check
```bash
# Full coverage report
npx vitest run --coverage

# View HTML report
open coverage/index.html  # macOS
start coverage/index.html # Windows
```

### Lint
```bash
# Lint all files
npm run lint

# Lint specific directory
npx eslint lib/api/
```

---

## Critical Technical Debt

| Issue | Count | Phase | Priority |
|-------|-------|-------|----------|
| **Accessibility Warnings** | 24 | 9 | P1 |
| **React Testing Violations** | 8 | 9 | P1 |
| **ESLint Configuration** | N/A | 2 | P1 |

**Accessibility Issue:**
```
Warning: Missing `Description` or `aria-describedby={undefined}` for {DialogContent}.
```

**Fix:** Add `<DialogDescription>` to all Dialog components

**React Testing Issue:**
```
An update to StripeCheckout inside a test was not wrapped in act(...).
```

**Fix:** Wrap state updates in `act()` or use `waitFor()`

---

## Quality Gates

### Coverage Thresholds
- Lines: ≥80%
- Functions: ≥80%
- Branches: ≥75%
- Statements: ≥80%

### Performance Thresholds
- Unit test execution: <2 minutes
- E2E test execution: <5 minutes per browser
- Test reliability: >99% pass rate

### Code Quality
- ESLint errors: 0
- ESLint warnings: <10
- Accessibility violations: 0
- React testing violations: 0

---

## File Locations

### Project Files
- **Vitest Config:** `vitest.config.ts`
- **Playwright Config:** `playwright.config.ts`
- **Test Setup:** `test/setup.ts`
- **Coverage Output:** `coverage/`
- **E2E Output:** `playwright-output/`
- **E2E Report:** `playwright-report/`

### Strategic Documents
- **Strategic Plan:** `.claude/TESTING-STRATEGIC-PLAN.md`
- **Priority Matrix:** `.claude/TESTING-PRIORITY-MATRIX.md`
- **Agent Coordination:** `.claude/TESTING-AGENT-COORDINATION.md`
- **Executive Summary:** `.claude/TESTING-EXECUTIVE-SUMMARY.md`
- **Quick Reference:** `.claude/TESTING-QUICK-REF.md` (this file)

### Obsidian Vault
- **Base Path:** `C:\Users\MarkusAhling\obsidian\Repositories\markus41\Alpha-1.4\`
- **Repository Docs:** `Repository-README.md`
- **ADRs:** `Decisions/ADR-NNN-*.md`
- **Guides:** `Guides/*.md`
- **Runbooks:** `Runbooks/*.md`

---

## Next Actions Checklist

### Today
- [ ] Review strategic plan (TESTING-STRATEGIC-PLAN.md)
- [ ] Review priority matrix (TESTING-PRIORITY-MATRIX.md)
- [ ] Review agent coordination (TESTING-AGENT-COORDINATION.md)
- [ ] Approve executive summary (TESTING-EXECUTIVE-SUMMARY.md)
- [ ] Initialize Phase 2 agents
- [ ] Create ADR-001: Testing Strategy Selection

### This Week (Week 1)
- [ ] Complete Phase 2 (Infrastructure)
  - [ ] Fix ESLint configuration
  - [ ] Set up pre-commit hooks
  - [ ] Create test utilities and factories
  - [ ] Document test patterns
- [ ] Prepare for Phase 3 (Critical API Testing)
- [ ] Daily progress tracking
- [ ] First milestone review (Friday)

### Next Week (Week 2)
- [ ] Execute Phase 3 (Critical API Testing)
  - [ ] Track A: Payments (470 tests)
  - [ ] Track B: Communications (200 tests)
- [ ] Target: 30%+ coverage
- [ ] Daily standups
- [ ] Phase 3 handoff

---

## Communication Channels

### Orchestration System
**Location:** `.claude/orchestration/db/`
**Purpose:** Agent activity tracking

### Agent Activity Log
**Location:** `C:\Users\MarkusAhling\obsidian\System\Agents\Activity-Log.md`
**Purpose:** Permanent agent action record

### Testing Dashboard
**Location:** `.claude/TESTING-DASHBOARD.md` (to be created)
**Purpose:** Real-time metrics

---

## Common Issues & Solutions

### Issue: Tests Failing Locally
**Solution:**
1. Clear node_modules: `rm -rf node_modules && npm install`
2. Clear coverage cache: `rm -rf coverage`
3. Run tests in watch mode: `npx vitest`

### Issue: Coverage Below Threshold
**Solution:**
1. Check coverage report: `coverage/index.html`
2. Identify uncovered lines
3. Add missing tests
4. Re-run coverage check

### Issue: E2E Tests Failing
**Solution:**
1. Check browser installation: `npx playwright install`
2. Run in headed mode: `npm run test:e2e:headed`
3. Check screenshots: `playwright-output/`
4. View trace: `npx playwright show-trace`

### Issue: Slow Test Execution
**Solution:**
1. Run in parallel: `vitest run --parallel`
2. Use test filters: `vitest run path/to/module`
3. Optimize test setup (reduce mocks)
4. Review test timeout settings

---

## Keyboard Shortcuts (Vitest Watch Mode)

- `a` - Run all tests
- `f` - Run only failed tests
- `t` - Filter by test name
- `p` - Filter by filename
- `q` - Quit watch mode
- `c` - Clear console
- `h` - Show help

---

## Performance Targets

| Metric | Target | Notes |
|--------|--------|-------|
| Unit Test Execution | <2 min | All 1,200+ tests |
| E2E Test Execution | <5 min | Per browser (3 total) |
| Coverage Generation | <30 sec | Full codebase |
| Lint Execution | <10 sec | Full codebase |
| Pre-commit Hook | <15 sec | Staged files only |

---

## Success Criteria (Final)

- ✅ Code coverage ≥80% (lines), ≥75% (branches)
- ✅ 1,200+ unit tests passing
- ✅ 20+ E2E tests passing across 3 browsers
- ✅ Test execution time <2 minutes
- ✅ Zero ESLint errors
- ✅ Zero accessibility violations
- ✅ Zero React testing violations
- ✅ CI/CD pipeline operational
- ✅ Documentation complete in Obsidian vault
- ✅ Pre-commit hooks enforcing quality gates

---

**Need Help?**
- Strategic questions → Review TESTING-STRATEGIC-PLAN.md
- Priority questions → Review TESTING-PRIORITY-MATRIX.md
- Coordination questions → Review TESTING-AGENT-COORDINATION.md
- High-level overview → Review TESTING-EXECUTIVE-SUMMARY.md
- Quick lookup → This document (TESTING-QUICK-REF.md)

**Document Version:** 1.0
**Last Updated:** 2025-11-29
