# Epic-09: TypeScript Error Resolution

**Epic ID:** EPIC-09
**Priority:** P1 (High)
**Effort:** 52 hours
**Dependencies:** None
**Blocks:** Epic-07, Epic-11

---

## Summary

Resolve all TypeScript errors to achieve zero-error compilation. Currently there are 130+ TypeScript errors across the codebase preventing strict type checking and blocking test coverage improvements.

## Business Value

- **Quality:** Type safety prevents runtime errors
- **Velocity:** IDE autocomplete and refactoring work correctly
- **Testing:** Tests require correct types to be meaningful
- **Maintainability:** Easier onboarding and code understanding

---

## Gaps Addressed

| Gap ID | Description | Severity | Completion | Errors |
|--------|-------------|----------|------------|--------|
| GAP-I21 | P0 error fixes | Critical | 40% | 28 |
| GAP-I22 | P1 error fixes | High | 20% | 102 |

---

## Current Error Analysis

### Error Categories

| Category | Count | Priority | Example |
|----------|-------|----------|---------|
| Missing type definitions | 34 | P0 | Member type incomplete |
| Incorrect function signatures | 28 | P0 | API function returns |
| Import/export conflicts | 18 | P1 | Duplicate exports |
| Null/undefined handling | 24 | P1 | Missing null checks |
| Component prop types | 15 | P1 | Missing prop definitions |
| Generic type issues | 11 | P2 | Incorrect generics |

### Error Distribution by Directory

| Directory | Errors | Priority |
|-----------|--------|----------|
| lib/api/ | 32 | P0 |
| lib/hooks/ | 24 | P0 |
| components/ | 28 | P1 |
| app/api/ | 18 | P1 |
| lib/utils/ | 12 | P2 |
| types/ | 16 | P0 |

---

## User Stories

### US-09.1: Fix Type Definitions
**As a** developer
**I want to** have complete type definitions
**So that** TypeScript can catch errors at compile time

**Acceptance Criteria:**
- [ ] All database types generated and complete
- [ ] All API response types defined
- [ ] All component prop types defined
- [ ] No `any` types except where explicitly necessary
- [ ] All third-party library types installed

### US-09.2: Fix Function Signatures
**As a** developer
**I want to** have correct function signatures
**So that** I know what parameters and returns to expect

**Acceptance Criteria:**
- [ ] All API functions have typed parameters
- [ ] All API functions have typed return values
- [ ] All hooks have typed returns
- [ ] All utility functions properly typed

### US-09.3: Resolve Import Conflicts
**As a** developer
**I want to** have clean imports/exports
**So that** the module system works correctly

**Acceptance Criteria:**
- [ ] No duplicate exports
- [ ] No circular dependencies
- [ ] All imports resolvable
- [ ] Type-only imports use `import type`

### US-09.4: Enable Strict Mode
**As a** developer
**I want to** run TypeScript in strict mode
**So that** we catch the most issues possible

**Acceptance Criteria:**
- [ ] `strict: true` enabled in tsconfig
- [ ] `noImplicitAny: true` working
- [ ] `strictNullChecks: true` working
- [ ] No type assertion workarounds

---

## Technical Implementation

### Type Generation

```bash
# Regenerate Supabase types
npx supabase gen types typescript --project-id $PROJECT_ID > lib/supabase/database.types.ts
```

### P0 Fixes (28 errors - 12 hours)

#### 1. Database Types (lib/supabase/database.types.ts)

```typescript
// Add missing types from database schema
export type Database = {
  public: {
    Tables: {
      // Add email_sends table type
      email_sends: {
        Row: {
          id: string;
          campaign_id: string | null;
          member_id: string;
          organization_id: string;
          email_address: string;
          status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed';
          sendgrid_message_id: string | null;
          sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['email_sends']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['email_sends']['Insert']>;
      };
      // ... other tables
    };
  };
};
```

#### 2. API Function Types (lib/api/members.ts)

```typescript
// Before: Implicit any return
export async function getMembers(organizationId: string) {
  const { data } = await supabase.from('members').select('*').eq('organization_id', organizationId);
  return data;
}

// After: Explicit types
import type { Member } from '@/types/member';

export async function getMembers(organizationId: string): Promise<Member[]> {
  const { data, error } = await supabase
    .from('members')
    .select('*')
    .eq('organization_id', organizationId);

  if (error) throw new Error(error.message);
  return data ?? [];
}
```

#### 3. Hook Return Types (lib/hooks/useMembers.ts)

```typescript
// Before: Inferred types incomplete
export function useMembers(organizationId: string) {
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: () => getMembers(organizationId),
  });
}

// After: Explicit return type
import type { UseQueryResult } from '@tanstack/react-query';
import type { Member } from '@/types/member';

export function useMembers(organizationId: string): UseQueryResult<Member[], Error> {
  return useQuery({
    queryKey: ['members', organizationId],
    queryFn: () => getMembers(organizationId),
  });
}
```

### P1 Fixes (102 errors - 32 hours)

#### 1. Component Prop Types

```typescript
// Before: Props not defined
export function MemberCard({ member, onEdit, onDelete }) {
  // ...
}

// After: Props interface
interface MemberCardProps {
  member: Member;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function MemberCard({ member, onEdit, onDelete }: MemberCardProps) {
  // ...
}
```

#### 2. Null Handling

```typescript
// Before: Possible null access
const memberName = member.first_name + ' ' + member.last_name;

// After: Null safe
const memberName = `${member.first_name ?? ''} ${member.last_name ?? ''}`.trim();
```

#### 3. Import Fixes

```typescript
// Before: Re-exporting everything causes conflicts
export * from './types';
export * from './utils';

// After: Explicit exports
export { Member, MemberStatus } from './types';
export { formatMemberName, validateEmail } from './utils';
```

### P2 Fixes (Remaining - 8 hours)

#### 1. Generic Type Fixes

```typescript
// Before: Generic not constrained
function getById<T>(id: string): T {
  // ...
}

// After: Generic properly constrained
function getById<T extends { id: string }>(id: string): Promise<T | null> {
  // ...
}
```

#### 2. Utility Type Improvements

```typescript
// Add helper types
export type Nullable<T> = T | null;
export type AsyncResult<T> = Promise<{ data: T | null; error: Error | null }>;

// Use throughout codebase
export async function getMember(id: string): AsyncResult<Member> {
  try {
    const data = await fetchMember(id);
    return { data, error: null };
  } catch (error) {
    return { data: null, error: error as Error };
  }
}
```

---

## Fix Sequence

### Phase 1: Foundation (8 hours)
1. Regenerate database types
2. Fix type definition files in `/types`
3. Install missing `@types/*` packages
4. Fix circular dependencies

### Phase 2: Core APIs (12 hours)
1. Add return types to all API functions
2. Add parameter types to all API functions
3. Fix null handling in API layer
4. Add error types

### Phase 3: Hooks (8 hours)
1. Type all hook returns
2. Fix hook parameter types
3. Add proper React Query types
4. Fix state types

### Phase 4: Components (16 hours)
1. Add prop interfaces to all components
2. Fix event handler types
3. Fix ref types
4. Add children types where needed

### Phase 5: Strict Mode (8 hours)
1. Enable `strict: true` incrementally
2. Fix remaining implicit any
3. Fix remaining null checks
4. Remove type assertions

---

## tsconfig.json Updates

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  }
}
```

---

## Dependencies

### Upstream
- None (can start immediately)

### Downstream
- **Epic-07:** Tests require correct types
- **Epic-11:** Code quality depends on type safety

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking runtime | Medium | High | Run tests after each batch |
| Scope creep | Medium | Medium | Focus on errors, not refactoring |
| Incomplete types | Low | Medium | Use generated types |

---

## Testing Plan

### Verification Steps
- [ ] `tsc --noEmit` returns 0 errors
- [ ] `npm run build` succeeds
- [ ] All existing tests pass
- [ ] IDE shows no errors

### Regression Prevention
- [ ] Enable pre-commit TypeScript check
- [ ] Add CI type checking step
- [ ] Set up incremental type checking

---

## Definition of Done

- [ ] Zero TypeScript errors (`tsc --noEmit` clean)
- [ ] Build succeeds without type errors
- [ ] All tests pass
- [ ] No `// @ts-ignore` comments (except documented)
- [ ] No `any` types (except documented)
- [ ] Strict mode enabled
- [ ] CI enforces type checking

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 1-3 |
| **Team:** | All Developers |
| **Owner:** | Tech Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
