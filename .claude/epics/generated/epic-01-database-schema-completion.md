# Epic-01: Database Schema Completion

**Epic ID:** EPIC-01
**Priority:** P0 (Critical Path)
**Effort:** 8 hours
**Dependencies:** None (Foundation Epic)
**Blocks:** Epic-04, Epic-05, Epic-06, Epic-08

---

## Summary

Complete the missing database tables and functions required for core platform functionality. This epic addresses critical infrastructure gaps that block 5+ downstream features.

## Business Value

- **Revenue Impact:** Unblocks payment tracking ($25K+ monthly)
- **Compliance:** CAN-SPAM compliance via notification preferences
- **Feature Enablement:** Enables email tracking, event payments, campaign analytics

---

## Gaps Addressed

| Gap ID | Description | Severity |
|--------|-------------|----------|
| GAP-001 | email_sends table missing | Critical |
| GAP-002 | event_tickets table missing | Critical |
| GAP-003 | increment_campaign_stat() function missing | High |
| GAP-032 | notification_preferences table missing | Critical |

---

## User Stories

### US-01.1: Email Send Tracking
**As a** communications manager
**I want to** track individual email sends and their delivery status
**So that** I can monitor campaign effectiveness and troubleshoot delivery issues

**Acceptance Criteria:**
- [ ] `email_sends` table created with proper schema
- [ ] Foreign key relationships to campaigns and members
- [ ] Indexes on campaign_id, member_id, and sent_at
- [ ] RLS policies for organization-scoped access
- [ ] Trigger for updating campaign statistics

### US-01.2: Event Ticket Management
**As an** event organizer
**I want to** manage event tickets with payment tracking
**So that** I can process event registrations and track revenue

**Acceptance Criteria:**
- [ ] `event_tickets` table created with proper schema
- [ ] Links to events, members, and payments
- [ ] Support for multiple ticket types per event
- [ ] Ticket status tracking (pending, paid, cancelled, refunded)
- [ ] Check-in tracking fields

### US-01.3: Campaign Statistics Function
**As a** system
**I want to** atomically increment campaign statistics
**So that** email analytics are accurate under concurrent load

**Acceptance Criteria:**
- [ ] `increment_campaign_stat()` PostgreSQL function created
- [ ] Handles opens, clicks, bounces, unsubscribes
- [ ] Transaction-safe with row-level locking
- [ ] Performance tested under load

### US-01.4: Notification Preferences
**As a** member
**I want to** manage my email notification preferences
**So that** I can control what communications I receive

**Acceptance Criteria:**
- [ ] `notification_preferences` table created
- [ ] Per-member, per-category preferences
- [ ] Global unsubscribe option
- [ ] API endpoints for preference management
- [ ] Integration with SendGrid suppression lists

---

## Technical Implementation

### Database Schema

```sql
-- email_sends table
CREATE TABLE email_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    email_address TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    sendgrid_message_id TEXT,
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    bounced_at TIMESTAMPTZ,
    bounce_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- event_tickets table
CREATE TABLE event_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    ticket_type_id UUID,
    ticket_number TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled', 'refunded', 'checked_in')),
    payment_id UUID REFERENCES payments(id),
    amount_paid DECIMAL(10,2),
    purchase_date TIMESTAMPTZ DEFAULT NOW(),
    checked_in_at TIMESTAMPTZ,
    checked_in_by UUID REFERENCES members(id),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- notification_preferences table
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    category TEXT NOT NULL CHECK (category IN ('marketing', 'transactional', 'events', 'newsletter', 'all')),
    email_enabled BOOLEAN DEFAULT true,
    sms_enabled BOOLEAN DEFAULT false,
    push_enabled BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, organization_id, category)
);

-- increment_campaign_stat function
CREATE OR REPLACE FUNCTION increment_campaign_stat(
    p_campaign_id UUID,
    p_stat_name TEXT,
    p_increment INTEGER DEFAULT 1
) RETURNS VOID AS $$
BEGIN
    UPDATE campaigns
    SET
        stats = jsonb_set(
            COALESCE(stats, '{}'),
            ARRAY[p_stat_name],
            to_jsonb(COALESCE((stats->>p_stat_name)::integer, 0) + p_increment)
        ),
        updated_at = NOW()
    WHERE id = p_campaign_id;
END;
$$ LANGUAGE plpgsql;
```

### Migration Files

1. `20250108_create_email_sends.sql`
2. `20250108_create_event_tickets.sql`
3. `20250108_create_notification_preferences.sql`
4. `20250108_create_campaign_stat_function.sql`

### RLS Policies

```sql
-- email_sends RLS
ALTER TABLE email_sends ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view email_sends for their organization"
    ON email_sends FOR SELECT
    USING (organization_id = auth.jwt()->>'organization_id');

-- event_tickets RLS
ALTER TABLE event_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view tickets for their organization"
    ON event_tickets FOR SELECT
    USING (organization_id = auth.jwt()->>'organization_id');

-- notification_preferences RLS
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Members can manage their own preferences"
    ON notification_preferences FOR ALL
    USING (member_id = auth.uid());
```

---

## Dependencies

### Upstream (None)
This is a foundation epic with no dependencies.

### Downstream (Blocked by this epic)
- **Epic-04:** Segment Evaluation Engine (needs member data queries)
- **Epic-05:** Automation Execution Engine (needs email_sends for triggers)
- **Epic-06:** Communications Integration (needs email_sends, notification_preferences)
- **Epic-08:** Learning Management System (needs event_tickets pattern)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Migration conflicts | Low | Medium | Run in development first |
| RLS policy gaps | Medium | High | Security audit before production |
| Performance issues | Low | Medium | Add appropriate indexes |

---

## Testing Plan

### Unit Tests
- [ ] Test increment_campaign_stat with concurrent calls
- [ ] Test notification_preferences unique constraint
- [ ] Validate foreign key relationships

### Integration Tests
- [ ] Test email_sends creation from SendGrid webhook
- [ ] Test event_tickets creation from Stripe webhook
- [ ] Test preference updates from API

### Data Validation
- [ ] Verify all existing campaigns work with new schema
- [ ] Test migration rollback procedure

---

## Definition of Done

- [ ] All 4 database objects created and migrated
- [ ] RLS policies applied and tested
- [ ] Indexes created for performance
- [ ] TypeScript types generated (`npx supabase gen types`)
- [ ] Integration tests passing
- [ ] Documentation updated

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 1 |
| **Team:** | Backend |
| **Owner:** | Backend Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
