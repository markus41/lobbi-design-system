# Epic-04: Segment Evaluation Engine

**Epic ID:** EPIC-04
**Priority:** P1 (High)
**Effort:** 40 hours
**Dependencies:** Epic-01
**Blocks:** Epic-05, Epic-06

---

## Summary

Build a complete segment evaluation engine that can evaluate complex member criteria and return matching members. Currently the `getSegmentMembers()` function is a stub returning empty arrays. This blocks all campaign targeting and automation triggers.

## Business Value

- **Targeting:** Enables targeted communications to specific member groups
- **Automation:** Required for automation triggers based on segment membership
- **Analytics:** Enables segment-based reporting and insights
- **Engagement:** Personalized communications improve member engagement

---

## Gaps Addressed

| Gap ID | Description | Severity | Completion |
|--------|-------------|----------|------------|
| GAP-004 | Segment evaluation logic incomplete | Critical | 10% |
| GAP-I10 | Conditional logic evaluation | High | 30% |

---

## User Stories

### US-04.1: Basic Segment Evaluation
**As a** communications manager
**I want to** define segments based on member attributes
**So that** I can target specific groups with campaigns

**Acceptance Criteria:**
- [ ] Evaluate segments based on member fields (status, type, join_date, etc.)
- [ ] Support AND/OR logical operators
- [ ] Support comparison operators (equals, not_equals, contains, greater_than, less_than)
- [ ] Return list of matching member IDs
- [ ] Cache evaluation results with TTL

### US-04.2: Engagement-Based Segments
**As a** membership manager
**I want to** segment members by engagement metrics
**So that** I can identify and re-engage inactive members

**Acceptance Criteria:**
- [ ] Segment by engagement_score ranges
- [ ] Segment by last_login_date
- [ ] Segment by event attendance count
- [ ] Segment by email open/click rates

### US-04.3: Financial Segments
**As a** finance manager
**I want to** segment members by payment status
**So that** I can send targeted dunning communications

**Acceptance Criteria:**
- [ ] Segment by payment_status (current, past_due, lapsed)
- [ ] Segment by subscription tier
- [ ] Segment by lifetime value
- [ ] Segment by payment method status

### US-04.4: Dynamic Segment Updates
**As a** system
**I want to** automatically update segment membership
**So that** segments always reflect current member status

**Acceptance Criteria:**
- [ ] Recalculate segments on relevant member changes
- [ ] Support scheduled segment recalculation
- [ ] Emit events when segment membership changes
- [ ] Track segment membership history

### US-04.5: Segment Preview
**As a** communications manager
**I want to** preview segment members before sending
**So that** I can verify targeting is correct

**Acceptance Criteria:**
- [ ] Show count of matching members
- [ ] Show sample of 10-20 matching members
- [ ] Display segment criteria in human-readable format
- [ ] Allow drill-down to individual member profiles

---

## Technical Implementation

### Segment Criteria Schema

```typescript
// types/segments.ts
export type ComparisonOperator =
  | 'equals'
  | 'not_equals'
  | 'contains'
  | 'not_contains'
  | 'starts_with'
  | 'ends_with'
  | 'greater_than'
  | 'less_than'
  | 'greater_than_or_equals'
  | 'less_than_or_equals'
  | 'is_empty'
  | 'is_not_empty'
  | 'in_list'
  | 'not_in_list';

export type LogicalOperator = 'AND' | 'OR';

export interface SegmentCriterion {
  field: string;
  operator: ComparisonOperator;
  value: any;
}

export interface SegmentCriteriaGroup {
  logic: LogicalOperator;
  criteria: (SegmentCriterion | SegmentCriteriaGroup)[];
}

export interface SegmentDefinition {
  id: string;
  name: string;
  description?: string;
  criteria: SegmentCriteriaGroup;
  organization_id: string;
  created_at: string;
  updated_at: string;
}
```

### Segment Evaluation Engine

```typescript
// lib/services/segment-engine.ts
import { createClient } from '@/lib/supabase/server';
import type { SegmentCriteriaGroup, SegmentCriterion, ComparisonOperator } from '@/types/segments';

export class SegmentEvaluationEngine {
  private supabase = createClient();

  async evaluateSegment(segmentId: string): Promise<string[]> {
    // Get segment definition
    const { data: segment } = await this.supabase
      .from('segments')
      .select('*')
      .eq('id', segmentId)
      .single();

    if (!segment) throw new Error('Segment not found');

    const criteria = segment.criteria as SegmentCriteriaGroup;
    const query = this.buildQuery(criteria, segment.organization_id);

    const { data: members } = await query;

    return members?.map(m => m.id) || [];
  }

  private buildQuery(criteria: SegmentCriteriaGroup, organizationId: string) {
    let query = this.supabase
      .from('members')
      .select('id')
      .eq('organization_id', organizationId);

    // Apply criteria recursively
    query = this.applyCriteriaGroup(query, criteria);

    return query;
  }

  private applyCriteriaGroup(query: any, group: SegmentCriteriaGroup) {
    if (group.logic === 'AND') {
      for (const criterion of group.criteria) {
        if ('logic' in criterion) {
          query = this.applyCriteriaGroup(query, criterion);
        } else {
          query = this.applyCriterion(query, criterion);
        }
      }
    } else if (group.logic === 'OR') {
      // OR logic requires different handling with .or()
      const orConditions = group.criteria.map(c => {
        if ('logic' in c) {
          return this.buildOrConditionFromGroup(c);
        }
        return this.buildOrCondition(c);
      });
      query = query.or(orConditions.join(','));
    }

    return query;
  }

  private applyCriterion(query: any, criterion: SegmentCriterion) {
    const { field, operator, value } = criterion;

    switch (operator) {
      case 'equals':
        return query.eq(field, value);
      case 'not_equals':
        return query.neq(field, value);
      case 'contains':
        return query.ilike(field, `%${value}%`);
      case 'not_contains':
        return query.not(field, 'ilike', `%${value}%`);
      case 'starts_with':
        return query.ilike(field, `${value}%`);
      case 'ends_with':
        return query.ilike(field, `%${value}`);
      case 'greater_than':
        return query.gt(field, value);
      case 'less_than':
        return query.lt(field, value);
      case 'greater_than_or_equals':
        return query.gte(field, value);
      case 'less_than_or_equals':
        return query.lte(field, value);
      case 'is_empty':
        return query.is(field, null);
      case 'is_not_empty':
        return query.not(field, 'is', null);
      case 'in_list':
        return query.in(field, value as any[]);
      case 'not_in_list':
        return query.not(field, 'in', `(${(value as any[]).join(',')})`);
      default:
        throw new Error(`Unknown operator: ${operator}`);
    }
  }

  private buildOrCondition(criterion: SegmentCriterion): string {
    const { field, operator, value } = criterion;

    switch (operator) {
      case 'equals':
        return `${field}.eq.${value}`;
      case 'not_equals':
        return `${field}.neq.${value}`;
      case 'contains':
        return `${field}.ilike.%${value}%`;
      case 'greater_than':
        return `${field}.gt.${value}`;
      case 'less_than':
        return `${field}.lt.${value}`;
      // ... other operators
      default:
        return '';
    }
  }

  private buildOrConditionFromGroup(group: SegmentCriteriaGroup): string {
    // Build nested OR/AND conditions
    const conditions = group.criteria.map(c => {
      if ('logic' in c) return this.buildOrConditionFromGroup(c);
      return this.buildOrCondition(c);
    });

    if (group.logic === 'AND') {
      return `and(${conditions.join(',')})`;
    }
    return `or(${conditions.join(',')})`;
  }

  async previewSegment(segmentId: string, limit = 20): Promise<{
    count: number;
    sample: Array<{ id: string; email: string; name: string }>;
  }> {
    const memberIds = await this.evaluateSegment(segmentId);

    const { data: sample } = await this.supabase
      .from('members')
      .select('id, email, first_name, last_name')
      .in('id', memberIds.slice(0, limit));

    return {
      count: memberIds.length,
      sample: sample?.map(m => ({
        id: m.id,
        email: m.email,
        name: `${m.first_name} ${m.last_name}`
      })) || []
    };
  }
}
```

### Caching Layer

```typescript
// lib/services/segment-cache.ts
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const CACHE_TTL = 300; // 5 minutes

export async function getCachedSegmentMembers(segmentId: string): Promise<string[] | null> {
  const cached = await redis.get<string[]>(`segment:${segmentId}:members`);
  return cached;
}

export async function setCachedSegmentMembers(
  segmentId: string,
  memberIds: string[]
): Promise<void> {
  await redis.setex(`segment:${segmentId}:members`, CACHE_TTL, memberIds);
}

export async function invalidateSegmentCache(segmentId: string): Promise<void> {
  await redis.del(`segment:${segmentId}:members`);
}

export async function invalidateAllSegmentCaches(organizationId: string): Promise<void> {
  const pattern = `segment:*:members`;
  // Note: This requires scanning keys - use with caution at scale
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
}
```

### API Endpoints

```typescript
// app/api/segments/[id]/evaluate/route.ts
import { SegmentEvaluationEngine } from '@/lib/services/segment-engine';
import { getCachedSegmentMembers, setCachedSegmentMembers } from '@/lib/services/segment-cache';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const useCache = searchParams.get('cache') !== 'false';

  // Check cache first
  if (useCache) {
    const cached = await getCachedSegmentMembers(params.id);
    if (cached) {
      return Response.json({ memberIds: cached, cached: true });
    }
  }

  // Evaluate segment
  const engine = new SegmentEvaluationEngine();
  const memberIds = await engine.evaluateSegment(params.id);

  // Cache results
  await setCachedSegmentMembers(params.id, memberIds);

  return Response.json({ memberIds, cached: false });
}
```

---

## Field Mapping

| Segment Field | Database Column | Type |
|---------------|-----------------|------|
| status | members.membership_status | enum |
| member_type | members.member_type | enum |
| join_date | members.join_date | date |
| engagement_score | members.engagement_score | number |
| last_login | members.last_login_at | timestamp |
| payment_status | members.payment_status | enum |
| subscription_tier | members.subscription_tier | string |
| chapter | members.chapter_id | uuid |
| tags | member_tags (join) | array |
| event_attendance | event_registrations (count) | number |
| email_opens | email_sends (count) | number |

---

## Dependencies

### Upstream
- **Epic-01:** Database tables for member data, email_sends

### Downstream
- **Epic-05:** Automation triggers based on segment membership
- **Epic-06:** Campaign targeting

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Complex queries timeout | Medium | High | Add query complexity limits |
| Cache invalidation issues | Medium | Medium | Conservative TTL, manual invalidation |
| OR logic complexity | Low | Medium | Limit nesting depth |

---

## Testing Plan

### Unit Tests
- [ ] Test all comparison operators
- [ ] Test AND/OR logic combinations
- [ ] Test nested criteria groups
- [ ] Test edge cases (empty values, null fields)

### Integration Tests
- [ ] Evaluate segment against real member data
- [ ] Verify cache hit/miss behavior
- [ ] Test cache invalidation on member updates

### Performance Tests
- [ ] Evaluate segment with 10K+ members
- [ ] Benchmark complex criteria evaluation
- [ ] Verify cache improves performance

---

## Definition of Done

- [ ] SegmentEvaluationEngine fully implemented
- [ ] All comparison operators working
- [ ] AND/OR logic with nesting supported
- [ ] Caching layer with Redis
- [ ] API endpoints for evaluation and preview
- [ ] Unit and integration tests passing
- [ ] Performance acceptable (< 2s for 10K members)

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 2 |
| **Team:** | Backend |
| **Owner:** | Backend Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
