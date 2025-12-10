# Epic-02: Security & Webhook Hardening

**Epic ID:** EPIC-02
**Priority:** P0 (Critical Path)
**Effort:** 16 hours
**Dependencies:** Epic-01 (partial)
**Blocks:** Production deployment, PCI compliance

---

## Summary

Harden all webhook endpoints with proper signature verification, rate limiting, and security best practices. Address critical security vulnerabilities that expose the platform to fraud and DDoS attacks.

## Business Value

- **Security:** Eliminates fraud exposure from unverified webhooks
- **Compliance:** PCI-DSS compliance for payment webhooks
- **Availability:** DDoS protection via rate limiting
- **Legal:** CAN-SPAM compliance via notification preferences

---

## Gaps Addressed

| Gap ID | Description | Severity |
|--------|-------------|----------|
| GAP-009 | SendGrid webhook signature verification missing | Critical |
| GAP-031 | Rate limiting on webhooks missing | Critical |
| GAP-I23 | Stripe webhook handlers incomplete | High |
| GAP-I24 | SendGrid webhook handlers incomplete | High |

---

## User Stories

### US-02.1: SendGrid Webhook Verification
**As a** security engineer
**I want to** verify SendGrid webhook signatures
**So that** attackers cannot forge email event notifications

**Acceptance Criteria:**
- [ ] Implement SendGrid signature verification per their docs
- [ ] Reject requests with invalid/missing signatures in production
- [ ] Log verification failures for security monitoring
- [ ] Add SENDGRID_WEBHOOK_VERIFICATION_KEY to env vars
- [ ] Graceful degradation in development mode with warnings

### US-02.2: Stripe Webhook Security
**As a** security engineer
**I want to** ensure Stripe webhook verification is always enabled
**So that** payment events cannot be forged

**Acceptance Criteria:**
- [ ] Make STRIPE_WEBHOOK_SECRET required in production
- [ ] Fail webhook endpoint startup if secret missing
- [ ] Add webhook signature verification logging
- [ ] Implement replay attack prevention (check event timestamps)

### US-02.3: Rate Limiting
**As a** platform operator
**I want to** rate limit all webhook endpoints
**So that** the platform is protected from DDoS attacks

**Acceptance Criteria:**
- [ ] Implement rate limiting middleware using Upstash Redis
- [ ] Configure per-endpoint limits (Stripe: 100/min, SendGrid: 500/min)
- [ ] Return 429 status with Retry-After header when exceeded
- [ ] Log rate limit violations for monitoring
- [ ] Whitelist known webhook source IPs where possible

### US-02.4: Webhook Audit Logging
**As a** compliance officer
**I want to** maintain audit logs of all webhook events
**So that** we can investigate security incidents

**Acceptance Criteria:**
- [ ] Log all webhook requests (sanitized, no sensitive data)
- [ ] Include: timestamp, source IP, event type, verification status
- [ ] Store logs in separate audit table
- [ ] Implement log retention policy (90 days)

---

## Technical Implementation

### SendGrid Signature Verification

```typescript
// lib/webhooks/sendgrid-verification.ts
import crypto from 'crypto';

interface SendGridSignatureParams {
  publicKey: string;
  payload: string;
  signature: string;
  timestamp: string;
}

export function verifySendGridSignature({
  publicKey,
  payload,
  signature,
  timestamp
}: SendGridSignatureParams): boolean {
  const timestampPayload = timestamp + payload;

  const decodedSignature = Buffer.from(signature, 'base64');

  const verify = crypto.createVerify('sha256');
  verify.update(timestampPayload);

  return verify.verify(publicKey, decodedSignature);
}

export function validateSendGridWebhook(request: Request): {
  valid: boolean;
  error?: string;
} {
  const signature = request.headers.get('X-Twilio-Email-Event-Webhook-Signature');
  const timestamp = request.headers.get('X-Twilio-Email-Event-Webhook-Timestamp');

  if (!signature || !timestamp) {
    return { valid: false, error: 'Missing signature headers' };
  }

  const publicKey = process.env.SENDGRID_WEBHOOK_VERIFICATION_KEY;
  if (!publicKey) {
    if (process.env.NODE_ENV === 'production') {
      return { valid: false, error: 'Missing verification key in production' };
    }
    console.warn('[SendGrid] Webhook verification disabled in development');
    return { valid: true };
  }

  // Check timestamp is within 5 minutes
  const eventTime = parseInt(timestamp);
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - eventTime) > 300) {
    return { valid: false, error: 'Timestamp too old (replay attack prevention)' };
  }

  // ... verify signature
  return { valid: true };
}
```

### Rate Limiting Middleware

```typescript
// lib/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const rateLimiters = {
  stripe: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'),
    prefix: 'ratelimit:stripe',
  }),
  sendgrid: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(500, '1 m'),
    prefix: 'ratelimit:sendgrid',
  }),
  default: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(60, '1 m'),
    prefix: 'ratelimit:default',
  }),
};

export async function checkRateLimit(
  endpoint: keyof typeof rateLimiters,
  identifier: string
): Promise<{ success: boolean; remaining: number; reset: number }> {
  const limiter = rateLimiters[endpoint] || rateLimiters.default;
  const { success, remaining, reset } = await limiter.limit(identifier);

  return { success, remaining, reset };
}
```

### Stripe Webhook Hardening

```typescript
// app/api/webhooks/stripe/route.ts (updated)
import Stripe from 'stripe';

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  // CRITICAL: Require secret in production
  if (!webhookSecret) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[CRITICAL] STRIPE_WEBHOOK_SECRET not configured');
      return new Response('Webhook secret not configured', { status: 500 });
    }
    console.warn('[Stripe] Running without webhook verification - DEVELOPMENT ONLY');
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature && webhookSecret) {
    return new Response('Missing signature', { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;
  try {
    if (webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } else {
      event = JSON.parse(body);
    }
  } catch (err) {
    console.error('[Stripe] Webhook verification failed:', err);
    return new Response('Webhook verification failed', { status: 400 });
  }

  // Check for replay attacks
  const eventAge = Date.now() / 1000 - event.created;
  if (eventAge > 300) {
    console.warn('[Stripe] Received old event (possible replay):', event.id);
    return new Response('Event too old', { status: 400 });
  }

  // ... process event
}
```

### Audit Logging

```sql
-- supabase/migrations/20250108_create_webhook_audit_log.sql
CREATE TABLE webhook_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    endpoint TEXT NOT NULL,
    event_type TEXT,
    source_ip INET,
    verification_status TEXT CHECK (verification_status IN ('verified', 'failed', 'skipped')),
    rate_limit_remaining INTEGER,
    processing_time_ms INTEGER,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for querying recent events
CREATE INDEX idx_webhook_audit_created ON webhook_audit_log(created_at DESC);
CREATE INDEX idx_webhook_audit_endpoint ON webhook_audit_log(endpoint, created_at DESC);

-- Auto-delete logs older than 90 days
CREATE OR REPLACE FUNCTION cleanup_webhook_audit_log()
RETURNS void AS $$
BEGIN
    DELETE FROM webhook_audit_log WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql;
```

---

## Environment Variables Required

```env
# SendGrid Webhook Verification
SENDGRID_WEBHOOK_VERIFICATION_KEY=MFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAE...

# Stripe (already exists, make required)
STRIPE_WEBHOOK_SECRET=whsec_...

# Upstash for rate limiting
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...
```

---

## Dependencies

### Upstream
- **Epic-01:** notification_preferences table (for unsubscribe handling)

### Downstream
- **All production deployments** require this epic complete
- **Epic-06:** Communications Integration (secure webhook handling)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Breaking existing webhooks | Medium | High | Feature flag rollout |
| Rate limit too aggressive | Low | Medium | Start conservative, tune |
| Missing verification key | Low | Critical | Startup check, fail fast |

---

## Testing Plan

### Security Tests
- [ ] Verify webhook rejection with invalid signature
- [ ] Verify webhook rejection with missing signature (production)
- [ ] Test replay attack prevention (old timestamps)
- [ ] Test rate limiting triggers at threshold

### Integration Tests
- [ ] Stripe webhook with valid signature passes
- [ ] SendGrid webhook with valid signature passes
- [ ] Rate limit returns 429 with Retry-After header
- [ ] Audit logs created for all webhook calls

### Load Tests
- [ ] Verify rate limiting under concurrent load
- [ ] Performance impact of signature verification < 10ms

---

## Definition of Done

- [ ] SendGrid webhook signature verification implemented
- [ ] Stripe webhook secret required in production
- [ ] Rate limiting on all webhook endpoints
- [ ] Audit logging for all webhook events
- [ ] Environment variables documented
- [ ] Security tests passing
- [ ] Production deployment checklist updated

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 1 |
| **Team:** | Backend, DevOps |
| **Owner:** | Security Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
