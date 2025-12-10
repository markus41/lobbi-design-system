# Epic-11: Code Quality & Polish

**Epic ID:** EPIC-11
**Priority:** P3 (Low)
**Effort:** 12 hours
**Dependencies:** Epic-07, Epic-09
**Blocks:** None

---

## Summary

Address code quality issues, remove deprecated patterns, and apply consistent coding standards across the codebase. This epic focuses on polish and maintainability improvements after core functionality is complete.

## Business Value

- **Maintainability:** Easier to onboard new developers
- **Performance:** Remove inefficient patterns
- **Consistency:** Unified coding style
- **Technical Debt:** Reduce future maintenance burden

---

## Gaps Addressed

| Gap ID | Description | Severity | Effort |
|--------|-------------|----------|--------|
| GAP-DEP01 | Mock member data in invoice creator | Critical | 2 hours |
| GAP-DEP02 | Direct window.location navigation | Low | 0.5 hours |
| GAP-DEP03 | Window reload on bulk actions | Medium | 1 hour |
| GAP-DEP04 | Static event types | Low | 2 hours |

---

## User Stories

### US-11.1: Remove Mock Data
**As a** developer
**I want to** remove all mock/hardcoded data
**So that** the application uses real data sources

**Acceptance Criteria:**
- [ ] Replace mock member data in invoice creator
- [ ] Replace mock event data where present
- [ ] Add proper data fetching for all components
- [ ] Remove TODO comments for mock data removal

### US-11.2: Fix Navigation Patterns
**As a** user
**I want to** seamless page transitions
**So that** the app feels responsive

**Acceptance Criteria:**
- [ ] Replace window.location with Next.js router
- [ ] Use proper Link components
- [ ] Add loading states for navigation
- [ ] Remove full page reloads

### US-11.3: Optimize Bulk Actions
**As a** user
**I want to** bulk actions without page reload
**So that** my workflow isn't interrupted

**Acceptance Criteria:**
- [ ] Use optimistic updates for bulk actions
- [ ] Show progress indicators
- [ ] Handle partial failures gracefully
- [ ] Maintain scroll position

### US-11.4: Apply Coding Standards
**As a** developer
**I want to** consistent coding patterns
**So that** the codebase is predictable

**Acceptance Criteria:**
- [ ] ESLint rules enforced
- [ ] Prettier formatting applied
- [ ] Import order standardized
- [ ] No unused exports

---

## Technical Implementation

### Fix Mock Data (GAP-DEP01)

```typescript
// Before: components/invoices/InvoiceCreator.tsx
const mockMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com' },
];

// After: Use real data
import { useMembers } from '@/lib/hooks/useMembers';

export function InvoiceCreator({ organizationId }: InvoiceCreatorProps) {
  const { data: members, isLoading } = useMembers(organizationId);

  if (isLoading) return <InvoiceCreatorSkeleton />;

  return (
    <InvoiceForm members={members} />
  );
}
```

### Fix Navigation (GAP-DEP02)

```typescript
// Before: Direct navigation
const handleViewMember = (id: string) => {
  window.location.href = `/members/${id}`;
};

// After: Next.js router
import { useRouter } from 'next/navigation';

const router = useRouter();

const handleViewMember = (id: string) => {
  router.push(`/members/${id}`);
};

// Or use Link component
<Link href={`/members/${member.id}`}>
  View Details
</Link>
```

### Fix Bulk Actions (GAP-DEP03)

```typescript
// Before: Reload after bulk action
const handleBulkDelete = async (ids: string[]) => {
  await deleteMembers(ids);
  window.location.reload();
};

// After: Optimistic updates with React Query
import { useMutation, useQueryClient } from '@tanstack/react-query';

const queryClient = useQueryClient();

const bulkDeleteMutation = useMutation({
  mutationFn: deleteMembers,
  onMutate: async (ids) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: ['members'] });

    // Snapshot previous value
    const previousMembers = queryClient.getQueryData(['members']);

    // Optimistically remove
    queryClient.setQueryData(['members'], (old: Member[]) =>
      old.filter(m => !ids.includes(m.id))
    );

    return { previousMembers };
  },
  onError: (err, ids, context) => {
    // Rollback on error
    queryClient.setQueryData(['members'], context?.previousMembers);
    toast.error('Failed to delete members');
  },
  onSuccess: () => {
    toast.success('Members deleted successfully');
  },
  onSettled: () => {
    // Refetch after error or success
    queryClient.invalidateQueries({ queryKey: ['members'] });
  },
});

const handleBulkDelete = (ids: string[]) => {
  bulkDeleteMutation.mutate(ids);
};
```

### Database-Driven Event Types (GAP-DEP04)

```typescript
// Before: Static event types
const EVENT_TYPES = ['conference', 'webinar', 'workshop', 'meetup'];

// After: Database-driven
// Migration: Create event_types table
// CREATE TABLE event_types (
//   id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
//   organization_id UUID REFERENCES organizations(id),
//   name TEXT NOT NULL,
//   description TEXT,
//   color TEXT,
//   icon TEXT,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );

// Hook
export function useEventTypes(organizationId: string) {
  return useQuery({
    queryKey: ['eventTypes', organizationId],
    queryFn: () => getEventTypes(organizationId),
  });
}

// Component
const { data: eventTypes } = useEventTypes(organizationId);
```

### ESLint Configuration

```javascript
// .eslintrc.js
module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    // Enforce consistent imports
    'import/order': ['error', {
      groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
      'newlines-between': 'always',
      alphabetize: { order: 'asc' }
    }],

    // No unused exports
    'import/no-unused-modules': ['warn', { unusedExports: true }],

    // Consistent React patterns
    'react/self-closing-comp': 'error',
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'never' }],

    // TypeScript
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',

    // No console in production
    'no-console': ['warn', { allow: ['warn', 'error'] }],
  }
};
```

---

## Checklist

### Mock Data Removal
- [ ] Invoice creator - remove mock members
- [ ] Event creator - remove mock venues
- [ ] Dashboard - remove mock statistics
- [ ] Reports - remove mock data

### Navigation Fixes
- [ ] Member table row clicks
- [ ] Event card navigation
- [ ] Invoice view links
- [ ] Settings navigation

### Bulk Action Optimization
- [ ] Member bulk delete
- [ ] Member bulk status update
- [ ] Event bulk archive
- [ ] Invoice bulk send

### Coding Standards
- [ ] Run ESLint auto-fix
- [ ] Run Prettier
- [ ] Remove unused imports
- [ ] Standardize error handling

---

## Dependencies

### Upstream
- **Epic-07:** Tests provide safety net for refactoring
- **Epic-09:** TypeScript errors must be fixed first

### Downstream
- None (final polish)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking changes | Low | Medium | Full test coverage first |
| Scope creep | Medium | Low | Strict scope definition |
| Bikeshedding | Medium | Low | Time-box decisions |

---

## Testing Plan

### Regression Tests
- [ ] All existing tests pass
- [ ] Navigation flows work
- [ ] Bulk actions complete
- [ ] No console errors

### Manual Testing
- [ ] Navigation feels smooth
- [ ] Bulk actions show progress
- [ ] No visible regressions

---

## Definition of Done

- [ ] All mock data replaced with real data
- [ ] No window.location usage
- [ ] No window.reload usage
- [ ] ESLint passes with no errors
- [ ] Prettier formatting applied
- [ ] All tests passing
- [ ] Code review completed

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 5-6 |
| **Team:** | All Developers |
| **Owner:** | Tech Lead |
| **Target Release:** | v1.6.0 |
| **Created:** | 2025-12-07 |
