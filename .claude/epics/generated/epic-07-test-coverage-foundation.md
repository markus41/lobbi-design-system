# Epic-07: Test Coverage Foundation

**Epic ID:** EPIC-07
**Priority:** P1 (High)
**Effort:** 120 hours
**Dependencies:** Epic-09
**Blocks:** Epic-11, Production confidence

---

## Summary

Establish comprehensive test coverage across the platform to enable confident deployments and refactoring. Current coverage is 5.98% against a target of 80%. This epic focuses on building the testing infrastructure and covering critical paths first.

## Business Value

- **Quality:** Reduces production bugs and regression issues
- **Velocity:** Enables faster, safer deployments
- **Confidence:** Allows refactoring without fear
- **Documentation:** Tests serve as living documentation

---

## Gaps Addressed

| Gap ID | Description | Current | Target | Effort |
|--------|-------------|---------|--------|--------|
| GAP-I16 | API function coverage | 15% | 80% | 70 hours |
| GAP-I17 | Hook test coverage | 11% | 80% | 52 hours |
| GAP-I18 | Integration tests | 61% | 90% | 24 hours |
| GAP-I19 | Component tests | 8% | 70% | 32 hours |
| GAP-I20 | E2E coverage | 40% | 80% | 14 hours |

---

## Current State Analysis

### Test Infrastructure
- **Framework:** Vitest (configured)
- **Component Testing:** React Testing Library (configured)
- **E2E:** Playwright (configured)
- **Coverage:** c8/v8 (configured)

### Coverage Breakdown
| Category | Files | Covered | Percentage |
|----------|-------|---------|------------|
| API Functions | 20 | 3 | 15% |
| Hooks | 18 | 2 | 11% |
| Components | 108 | 9 | 8% |
| Utilities | 15 | 5 | 33% |
| Integration | 12 | 7 | 58% |

---

## User Stories

### US-07.1: API Function Tests
**As a** developer
**I want to** have unit tests for all API functions
**So that** API changes don't break existing functionality

**Acceptance Criteria:**
- [ ] Cover all CRUD operations for each entity
- [ ] Test error handling paths
- [ ] Test input validation
- [ ] Test authorization checks
- [ ] Mock Supabase client appropriately

### US-07.2: Hook Tests
**As a** developer
**I want to** have tests for all React hooks
**So that** UI state management is reliable

**Acceptance Criteria:**
- [ ] Test hook initialization
- [ ] Test state updates
- [ ] Test error states
- [ ] Test loading states
- [ ] Test refetching behavior

### US-07.3: Component Tests
**As a** developer
**I want to** have tests for UI components
**So that** UI changes don't break user interactions

**Acceptance Criteria:**
- [ ] Test rendering with various props
- [ ] Test user interactions
- [ ] Test accessibility requirements
- [ ] Test responsive behavior
- [ ] Test error boundaries

### US-07.4: Integration Tests
**As a** developer
**I want to** have integration tests for critical flows
**So that** multi-step processes work correctly

**Acceptance Criteria:**
- [ ] Test member registration flow
- [ ] Test event registration flow
- [ ] Test payment processing flow
- [ ] Test campaign sending flow
- [ ] Test automation execution flow

### US-07.5: E2E Tests
**As a** QA engineer
**I want to** have end-to-end tests for user journeys
**So that** production deployments are validated

**Acceptance Criteria:**
- [ ] Test login/logout flow
- [ ] Test member management
- [ ] Test event creation and registration
- [ ] Test invoice creation
- [ ] Test dashboard functionality

---

## Test Plan by Priority

### P0: Critical Path Tests (40 hours)
These tests cover functionality that, if broken, would cause immediate business impact.

| Area | Tests Needed | Hours |
|------|--------------|-------|
| Payment processing | 15 | 8 |
| Member CRUD | 12 | 6 |
| Event registration | 10 | 5 |
| Authentication | 8 | 4 |
| Webhook handlers | 12 | 8 |
| Core API functions | 20 | 9 |

### P1: Core Functionality (50 hours)
| Area | Tests Needed | Hours |
|------|--------------|-------|
| Campaign management | 15 | 8 |
| Segment evaluation | 12 | 6 |
| Invoice generation | 10 | 5 |
| Event management | 15 | 8 |
| Member hooks | 18 | 10 |
| Dashboard components | 20 | 13 |

### P2: Feature Completion (30 hours)
| Area | Tests Needed | Hours |
|------|--------------|-------|
| Automation engine | 20 | 10 |
| Learning module | 15 | 8 |
| Reporting | 10 | 5 |
| Settings | 8 | 4 |
| Utility functions | 6 | 3 |

---

## Technical Implementation

### Test Directory Structure

```
__tests__/
├── unit/
│   ├── api/
│   │   ├── members.test.ts
│   │   ├── events.test.ts
│   │   ├── campaigns.test.ts
│   │   └── ...
│   ├── hooks/
│   │   ├── useMembers.test.ts
│   │   ├── useEvents.test.ts
│   │   └── ...
│   └── utils/
│       ├── formatting.test.ts
│       └── ...
├── integration/
│   ├── flows/
│   │   ├── member-registration.test.ts
│   │   ├── event-registration.test.ts
│   │   └── payment-flow.test.ts
│   └── api/
│       ├── webhooks.test.ts
│       └── ...
├── components/
│   ├── common/
│   ├── members/
│   ├── events/
│   └── ...
└── e2e/
    ├── auth.spec.ts
    ├── members.spec.ts
    ├── events.spec.ts
    └── ...
```

### Test Utilities

```typescript
// __tests__/utils/test-utils.tsx
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';

// Mock Supabase client
export const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  single: vi.fn(),
  auth: {
    getUser: vi.fn(),
    getSession: vi.fn(),
  },
};

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabase,
}));

// Custom render with providers
const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export function renderWithProviders(
  ui: React.ReactElement,
  options?: RenderOptions
) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>,
    options
  );
}

// Factory functions
export function createMockMember(overrides = {}) {
  return {
    id: 'member-1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    membership_status: 'active',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockEvent(overrides = {}) {
  return {
    id: 'event-1',
    title: 'Test Event',
    start_date: new Date().toISOString(),
    end_date: new Date().toISOString(),
    status: 'published',
    ...overrides,
  };
}
```

### Example API Test

```typescript
// __tests__/unit/api/members.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getMembers, createMember, updateMember } from '@/lib/api/members';
import { mockSupabase, createMockMember } from '../../utils/test-utils';

describe('Members API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMembers', () => {
    it('should return members for organization', async () => {
      const mockMembers = [createMockMember(), createMockMember({ id: 'member-2' })];
      mockSupabase.select.mockResolvedValueOnce({ data: mockMembers, error: null });

      const result = await getMembers({ organizationId: 'org-1' });

      expect(mockSupabase.from).toHaveBeenCalledWith('members');
      expect(result).toEqual(mockMembers);
    });

    it('should handle errors', async () => {
      mockSupabase.select.mockResolvedValueOnce({
        data: null,
        error: { message: 'Database error' }
      });

      await expect(getMembers({ organizationId: 'org-1' }))
        .rejects.toThrow('Database error');
    });

    it('should apply filters correctly', async () => {
      mockSupabase.select.mockResolvedValueOnce({ data: [], error: null });

      await getMembers({
        organizationId: 'org-1',
        status: 'active',
        memberType: 'individual'
      });

      expect(mockSupabase.eq).toHaveBeenCalledWith('membership_status', 'active');
      expect(mockSupabase.eq).toHaveBeenCalledWith('member_type', 'individual');
    });
  });

  describe('createMember', () => {
    it('should create member with required fields', async () => {
      const newMember = {
        email: 'new@example.com',
        first_name: 'New',
        last_name: 'Member',
        organization_id: 'org-1'
      };

      mockSupabase.single.mockResolvedValueOnce({
        data: { id: 'member-new', ...newMember },
        error: null
      });

      const result = await createMember(newMember);

      expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
        email: 'new@example.com',
        first_name: 'New'
      }));
      expect(result.id).toBe('member-new');
    });

    it('should validate email format', async () => {
      await expect(createMember({
        email: 'invalid-email',
        first_name: 'Test',
        last_name: 'User',
        organization_id: 'org-1'
      })).rejects.toThrow('Invalid email format');
    });
  });
});
```

### Example Hook Test

```typescript
// __tests__/unit/hooks/useMembers.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMembers } from '@/lib/hooks/useMembers';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createMockMember } from '../../utils/test-utils';

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

describe('useMembers hook', () => {
  it('should fetch members on mount', async () => {
    const mockMembers = [createMockMember()];
    vi.mocked(getMembers).mockResolvedValueOnce(mockMembers);

    const { result } = renderHook(() => useMembers('org-1'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.members).toEqual(mockMembers);
  });

  it('should handle fetch errors', async () => {
    vi.mocked(getMembers).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useMembers('org-1'), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error?.message).toBe('Network error');
  });
});
```

### Example E2E Test

```typescript
// __tests__/e2e/members.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Member Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[data-testid="email"]', 'admin@example.com');
    await page.fill('[data-testid="password"]', 'password123');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL('/dashboard');
  });

  test('should display member list', async ({ page }) => {
    await page.goto('/members');

    await expect(page.getByRole('heading', { name: 'Members' })).toBeVisible();
    await expect(page.getByTestId('member-table')).toBeVisible();
  });

  test('should create new member', async ({ page }) => {
    await page.goto('/members');
    await page.click('[data-testid="add-member-button"]');

    await page.fill('[data-testid="first-name"]', 'New');
    await page.fill('[data-testid="last-name"]', 'Member');
    await page.fill('[data-testid="email"]', 'newmember@example.com');

    await page.click('[data-testid="save-member-button"]');

    await expect(page.getByText('Member created successfully')).toBeVisible();
  });

  test('should filter members by status', async ({ page }) => {
    await page.goto('/members');

    await page.click('[data-testid="status-filter"]');
    await page.click('[data-testid="status-active"]');

    await expect(page.locator('[data-testid="member-row"]')).toHaveCount(5);
  });
});
```

---

## Coverage Targets by Sprint

| Sprint | Target Coverage | Focus Areas |
|--------|-----------------|-------------|
| Sprint 1 | 20% | Payment, Auth, Core APIs |
| Sprint 2 | 35% | Member, Event management |
| Sprint 3 | 50% | Campaigns, Hooks |
| Sprint 4 | 65% | Components, Integration |
| Sprint 5 | 75% | E2E, Edge cases |
| Sprint 6 | 80%+ | Polish, Documentation |

---

## Dependencies

### Upstream
- **Epic-09:** TypeScript errors must be resolved for accurate testing

### Downstream
- **Epic-11:** Code quality improvements depend on test safety net
- **All Production Deployments:** Require test coverage confidence

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Test maintenance burden | Medium | Medium | Focus on integration over unit |
| Flaky tests | Medium | Medium | Avoid timing-dependent tests |
| Mock divergence | Medium | High | Integration tests catch this |
| Underestimated effort | High | Medium | Start with critical paths |

---

## Testing Plan (Meta)

### Test the Tests
- [ ] Verify coverage reporting accuracy
- [ ] Confirm CI pipeline runs tests
- [ ] Test failure notifications working
- [ ] Coverage thresholds enforced

### Documentation
- [ ] Testing guidelines document
- [ ] Mock creation patterns
- [ ] E2E test writing guide
- [ ] CI/CD test configuration

---

## Definition of Done

- [ ] 80% overall code coverage achieved
- [ ] All P0 paths have tests
- [ ] CI pipeline runs all tests
- [ ] Coverage threshold enforcement enabled
- [ ] Test utilities documented
- [ ] E2E tests for critical user journeys
- [ ] No flaky tests in CI

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 2-6 |
| **Team:** | All Developers, QA |
| **Owner:** | QA Lead |
| **Target Release:** | v1.6.0 |
| **Created:** | 2025-12-07 |
