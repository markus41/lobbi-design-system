# Epic-06: Communications Integration

**Epic ID:** EPIC-06
**Priority:** P1 (High)
**Effort:** 48 hours
**Dependencies:** Epic-01, Epic-04
**Blocks:** Campaign functionality

---

## Summary

Complete the communications integration including campaign sending, email personalization, unsubscribe management, and analytics tracking. Currently at 55% completion with critical gaps in sending functionality and compliance features.

## Business Value

- **Engagement:** Enables targeted member communications
- **Compliance:** CAN-SPAM and GDPR compliance
- **Analytics:** Track campaign effectiveness
- **Automation:** Foundation for automated communications

---

## Gaps Addressed

| Gap ID | Description | Severity | Completion |
|--------|-------------|----------|------------|
| GAP-019 | Email personalization tokens missing | High | 0% |
| GAP-020 | Unsubscribe management missing | Critical | 0% |
| GAP-I05 | Email template builder | High | 40% |
| GAP-I06 | Campaign scheduling | High | 50% |
| GAP-I07 | Campaign analytics | High | 60% |

---

## User Stories

### US-06.1: Email Personalization
**As a** communications manager
**I want to** personalize emails with member data
**So that** messages feel personal and relevant

**Acceptance Criteria:**
- [ ] Support {{first_name}}, {{last_name}}, {{email}} tokens
- [ ] Support custom member fields as tokens
- [ ] Support organization variables (org_name, etc.)
- [ ] Preview personalization with sample member
- [ ] Fallback values for missing data

### US-06.2: Campaign Sending
**As a** communications manager
**I want to** send email campaigns to segments
**So that** I can reach targeted groups of members

**Acceptance Criteria:**
- [ ] Select segment for targeting
- [ ] Queue emails for batch sending
- [ ] Handle SendGrid rate limits
- [ ] Track send status for each recipient
- [ ] Retry failed sends

### US-06.3: Unsubscribe Management
**As a** member
**I want to** manage my email preferences
**So that** I only receive emails I want

**Acceptance Criteria:**
- [ ] One-click unsubscribe from emails
- [ ] Preference center for granular control
- [ ] Honor unsubscribes in all campaign sends
- [ ] Sync with SendGrid suppression list
- [ ] Track unsubscribe reasons

### US-06.4: Campaign Scheduling
**As a** communications manager
**I want to** schedule campaigns for future delivery
**So that** I can prepare campaigns in advance

**Acceptance Criteria:**
- [ ] Select date/time for campaign send
- [ ] Timezone selection
- [ ] Cancel scheduled campaigns
- [ ] Preview scheduled queue
- [ ] Optimal send time suggestions

### US-06.5: Campaign Analytics
**As a** communications manager
**I want to** view campaign performance metrics
**So that** I can improve future campaigns

**Acceptance Criteria:**
- [ ] Track opens, clicks, bounces, unsubscribes
- [ ] Display click heatmap on links
- [ ] Show geographic distribution
- [ ] Compare campaigns over time
- [ ] Export analytics data

---

## Technical Implementation

### Personalization Engine

```typescript
// lib/services/email-personalization.ts
export interface PersonalizationToken {
  token: string;
  source: 'member' | 'organization' | 'custom';
  field: string;
  fallback?: string;
}

const BUILT_IN_TOKENS: PersonalizationToken[] = [
  { token: '{{first_name}}', source: 'member', field: 'first_name', fallback: 'Member' },
  { token: '{{last_name}}', source: 'member', field: 'last_name', fallback: '' },
  { token: '{{email}}', source: 'member', field: 'email' },
  { token: '{{member_number}}', source: 'member', field: 'member_number' },
  { token: '{{join_date}}', source: 'member', field: 'join_date' },
  { token: '{{membership_type}}', source: 'member', field: 'membership_type' },
  { token: '{{org_name}}', source: 'organization', field: 'name' },
  { token: '{{org_email}}', source: 'organization', field: 'contact_email' },
];

export function personalizeContent(
  content: string,
  member: Record<string, any>,
  organization: Record<string, any>,
  customData?: Record<string, any>
): string {
  let result = content;

  for (const token of BUILT_IN_TOKENS) {
    const regex = new RegExp(escapeRegex(token.token), 'g');
    let value: string;

    if (token.source === 'member') {
      value = member[token.field] ?? token.fallback ?? '';
    } else if (token.source === 'organization') {
      value = organization[token.field] ?? token.fallback ?? '';
    } else {
      value = customData?.[token.field] ?? token.fallback ?? '';
    }

    // Format dates
    if (token.field.includes('date') && value) {
      value = formatDate(new Date(value));
    }

    result = result.replace(regex, value);
  }

  // Handle custom tokens {{custom.field}}
  const customTokenRegex = /\{\{custom\.(\w+)\}\}/g;
  result = result.replace(customTokenRegex, (match, field) => {
    return customData?.[field] ?? '';
  });

  return result;
}

export function extractTokens(content: string): string[] {
  const tokenRegex = /\{\{[\w.]+\}\}/g;
  const matches = content.match(tokenRegex);
  return [...new Set(matches || [])];
}

export function validateTokens(content: string): {
  valid: boolean;
  unknown: string[]
} {
  const tokens = extractTokens(content);
  const knownTokens = BUILT_IN_TOKENS.map(t => t.token);

  const unknown = tokens.filter(t => {
    if (knownTokens.includes(t)) return false;
    if (t.startsWith('{{custom.')) return false;
    return true;
  });

  return { valid: unknown.length === 0, unknown };
}
```

### Campaign Sending Service

```typescript
// lib/services/campaign-sender.ts
import { createClient } from '@/lib/supabase/server';
import { SegmentEvaluationEngine } from './segment-engine';
import { personalizeContent } from './email-personalization';
import { sendEmail } from '@/lib/integrations/sendgrid';

const BATCH_SIZE = 100;
const RATE_LIMIT_DELAY = 1000; // 1 second between batches

export class CampaignSender {
  private supabase = createClient();

  async sendCampaign(campaignId: string): Promise<void> {
    const { data: campaign } = await this.supabase
      .from('campaigns')
      .select('*, segment:segments(*), organization:organizations(*)')
      .eq('id', campaignId)
      .single();

    if (!campaign) throw new Error('Campaign not found');

    // Get segment members
    const engine = new SegmentEvaluationEngine();
    const memberIds = await engine.evaluateSegment(campaign.segment_id);

    // Filter out unsubscribed members
    const { data: preferences } = await this.supabase
      .from('notification_preferences')
      .select('member_id')
      .eq('organization_id', campaign.organization_id)
      .in('category', ['all', 'marketing'])
      .eq('email_enabled', false);

    const unsubscribedIds = new Set(preferences?.map(p => p.member_id) || []);
    const eligibleMemberIds = memberIds.filter(id => !unsubscribedIds.has(id));

    // Update campaign status
    await this.supabase
      .from('campaigns')
      .update({
        status: 'sending',
        recipient_count: eligibleMemberIds.length,
        sent_at: new Date()
      })
      .eq('id', campaignId);

    // Get member details
    const { data: members } = await this.supabase
      .from('members')
      .select('*')
      .in('id', eligibleMemberIds);

    if (!members?.length) {
      await this.completeCampaign(campaignId, 0, 0);
      return;
    }

    // Send in batches
    let successCount = 0;
    let failureCount = 0;

    for (let i = 0; i < members.length; i += BATCH_SIZE) {
      const batch = members.slice(i, i + BATCH_SIZE);

      const results = await Promise.allSettled(
        batch.map(member => this.sendToMember(campaign, member))
      );

      for (const result of results) {
        if (result.status === 'fulfilled') {
          successCount++;
        } else {
          failureCount++;
        }
      }

      // Update progress
      await this.updateProgress(campaignId, successCount, failureCount);

      // Rate limit delay
      if (i + BATCH_SIZE < members.length) {
        await delay(RATE_LIMIT_DELAY);
      }
    }

    await this.completeCampaign(campaignId, successCount, failureCount);
  }

  private async sendToMember(
    campaign: any,
    member: Record<string, any>
  ): Promise<void> {
    // Personalize content
    const personalizedSubject = personalizeContent(
      campaign.subject,
      member,
      campaign.organization
    );

    const personalizedBody = personalizeContent(
      campaign.body,
      member,
      campaign.organization
    );

    // Generate unsubscribe link
    const unsubscribeToken = await this.generateUnsubscribeToken(
      member.id,
      campaign.organization_id
    );
    const unsubscribeUrl = `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/${unsubscribeToken}`;

    // Send email
    const result = await sendEmail({
      to: member.email,
      subject: personalizedSubject,
      html: personalizedBody,
      headers: {
        'List-Unsubscribe': `<${unsubscribeUrl}>`,
        'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click'
      },
      customArgs: {
        campaign_id: campaign.id,
        member_id: member.id
      }
    });

    // Record send
    await this.supabase.from('email_sends').insert({
      campaign_id: campaign.id,
      member_id: member.id,
      organization_id: campaign.organization_id,
      email_address: member.email,
      sendgrid_message_id: result.messageId,
      status: 'sent',
      sent_at: new Date()
    });
  }

  private async generateUnsubscribeToken(
    memberId: string,
    organizationId: string
  ): Promise<string> {
    const token = crypto.randomUUID();

    await this.supabase.from('unsubscribe_tokens').insert({
      token,
      member_id: memberId,
      organization_id: organizationId,
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return token;
  }

  private async completeCampaign(
    campaignId: string,
    sent: number,
    failed: number
  ): Promise<void> {
    await this.supabase
      .from('campaigns')
      .update({
        status: failed === 0 ? 'sent' : 'completed_with_errors',
        stats: {
          sent,
          failed,
          opens: 0,
          clicks: 0,
          bounces: 0,
          unsubscribes: 0
        },
        completed_at: new Date()
      })
      .eq('id', campaignId);
  }
}
```

### Unsubscribe Handler

```typescript
// app/api/unsubscribe/[token]/route.ts
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  const supabase = createClient();

  // Validate token
  const { data: tokenData } = await supabase
    .from('unsubscribe_tokens')
    .select('member_id, organization_id, expires_at')
    .eq('token', params.token)
    .single();

  if (!tokenData || new Date(tokenData.expires_at) < new Date()) {
    return new Response('Invalid or expired unsubscribe link', { status: 400 });
  }

  // Process unsubscribe
  await supabase.from('notification_preferences').upsert({
    member_id: tokenData.member_id,
    organization_id: tokenData.organization_id,
    category: 'marketing',
    email_enabled: false,
    unsubscribed_at: new Date()
  });

  // Record unsubscribe event
  await supabase.from('member_events').insert({
    member_id: tokenData.member_id,
    event_type: 'unsubscribed',
    metadata: { category: 'marketing' }
  });

  // Redirect to confirmation page
  return Response.redirect(
    `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/confirmed`
  );
}

// POST for one-click unsubscribe
export async function POST(
  request: Request,
  { params }: { params: { token: string } }
) {
  // Same logic as GET but returns JSON
  // ... implementation

  return Response.json({ success: true });
}
```

### Campaign Analytics

```typescript
// lib/services/campaign-analytics.ts
export class CampaignAnalytics {
  private supabase = createClient();

  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    const { data: campaign } = await this.supabase
      .from('campaigns')
      .select('stats, recipient_count')
      .eq('id', campaignId)
      .single();

    const stats = campaign?.stats || {};
    const recipientCount = campaign?.recipient_count || 0;

    return {
      sent: stats.sent || 0,
      delivered: stats.delivered || stats.sent || 0,
      opens: stats.opens || 0,
      uniqueOpens: stats.unique_opens || 0,
      clicks: stats.clicks || 0,
      uniqueClicks: stats.unique_clicks || 0,
      bounces: stats.bounces || 0,
      unsubscribes: stats.unsubscribes || 0,
      openRate: recipientCount > 0 ? (stats.unique_opens || 0) / recipientCount : 0,
      clickRate: recipientCount > 0 ? (stats.unique_clicks || 0) / recipientCount : 0,
      bounceRate: recipientCount > 0 ? (stats.bounces || 0) / recipientCount : 0,
      unsubscribeRate: recipientCount > 0 ? (stats.unsubscribes || 0) / recipientCount : 0
    };
  }

  async getClickBreakdown(campaignId: string): Promise<LinkClickStats[]> {
    const { data: clicks } = await this.supabase
      .from('email_clicks')
      .select('url, count')
      .eq('campaign_id', campaignId)
      .order('count', { ascending: false });

    return clicks || [];
  }

  async getDeviceBreakdown(campaignId: string): Promise<DeviceStats> {
    const { data: sends } = await this.supabase
      .from('email_sends')
      .select('device_type')
      .eq('campaign_id', campaignId)
      .not('opened_at', 'is', null);

    const breakdown = { desktop: 0, mobile: 0, tablet: 0, unknown: 0 };
    for (const send of sends || []) {
      breakdown[send.device_type || 'unknown']++;
    }

    return breakdown;
  }
}
```

---

## Dependencies

### Upstream
- **Epic-01:** email_sends, notification_preferences tables
- **Epic-04:** Segment evaluation for targeting

### Downstream
- Enables campaign functionality
- Foundation for automated communications (Epic-05)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| SendGrid rate limits | Medium | Medium | Batch sending with delays |
| Email deliverability | Medium | High | Proper SPF/DKIM setup |
| Unsubscribe compliance | Low | High | One-click unsubscribe, preference center |
| Personalization errors | Low | Medium | Fallback values, preview |

---

## Testing Plan

### Unit Tests
- [ ] Personalization token replacement
- [ ] Token validation
- [ ] Unsubscribe token generation

### Integration Tests
- [ ] Campaign send to segment
- [ ] Unsubscribe flow end-to-end
- [ ] Analytics tracking from webhooks

### Compliance Tests
- [ ] One-click unsubscribe works
- [ ] Unsubscribed members excluded from sends
- [ ] List-Unsubscribe headers present

---

## Definition of Done

- [ ] Email personalization with all tokens
- [ ] Campaign sending to segments
- [ ] Unsubscribe management complete
- [ ] Campaign scheduling functional
- [ ] Analytics dashboard with key metrics
- [ ] CAN-SPAM compliance verified
- [ ] Tests passing
- [ ] Documentation complete

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 2-3 |
| **Team:** | Backend, Frontend |
| **Owner:** | Communications Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
