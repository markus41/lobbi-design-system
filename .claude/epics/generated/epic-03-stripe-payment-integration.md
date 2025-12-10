# Epic-03: Stripe Payment Integration

**Epic ID:** EPIC-03
**Priority:** P0 (Critical Path)
**Effort:** 40 hours
**Dependencies:** Epic-01, Epic-02
**Blocks:** Revenue collection, membership renewals

---

## Summary

Complete the Stripe payment integration including subscription management, recurring billing, invoice generation, and refund processing. Currently at 70% completion with critical gaps in subscription lifecycle management.

## Business Value

- **Revenue:** Enables $25K+ monthly in automated renewals
- **Operations:** Eliminates manual payment processing
- **Retention:** Automatic subscription renewals reduce churn
- **Compliance:** PCI-compliant payment handling

---

## Gaps Addressed

| Gap ID | Description | Severity | Completion |
|--------|-------------|----------|------------|
| GAP-008 | Subscription management missing | Critical | 0% |
| GAP-I03 | Stripe payment integration | High | 70% |
| GAP-I04 | Refund processing | High | 50% |
| GAP-016 | Dunning workflows missing | Critical | 0% |

---

## User Stories

### US-03.1: Subscription Creation
**As a** member
**I want to** subscribe to a membership plan
**So that** I have ongoing access to association benefits

**Acceptance Criteria:**
- [ ] Create Stripe subscription from membership tier selection
- [ ] Support monthly and annual billing cycles
- [ ] Handle trial periods if configured
- [ ] Store subscription ID in members table
- [ ] Send confirmation email on successful subscription

### US-03.2: Subscription Management
**As a** member
**I want to** manage my subscription (upgrade, downgrade, cancel)
**So that** I can adjust my membership as needed

**Acceptance Criteria:**
- [ ] Upgrade subscription with prorated billing
- [ ] Downgrade subscription at period end
- [ ] Cancel subscription with confirmation
- [ ] Pause subscription (if supported by plan)
- [ ] View subscription history

### US-03.3: Recurring Billing
**As a** system
**I want to** process recurring subscription payments
**So that** membership revenue is collected automatically

**Acceptance Criteria:**
- [ ] Handle `invoice.paid` webhook for successful renewals
- [ ] Handle `invoice.payment_failed` webhook for failures
- [ ] Update member status based on payment status
- [ ] Track payment history in payments table

### US-03.4: Dunning Management
**As a** membership manager
**I want to** handle failed payment retries automatically
**So that** we recover revenue from declined cards

**Acceptance Criteria:**
- [ ] Configure Stripe Smart Retries
- [ ] Send email notifications on payment failure
- [ ] Grace period before membership suspension
- [ ] Final notice before cancellation
- [ ] Easy payment method update flow

### US-03.5: Refund Processing
**As a** administrator
**I want to** process refunds for payments
**So that** I can handle member disputes and cancellations

**Acceptance Criteria:**
- [ ] Full refund capability
- [ ] Partial refund capability
- [ ] Refund reason tracking
- [ ] Automatic member status update on full refund
- [ ] Refund confirmation email

### US-03.6: Invoice Generation
**As a** member
**I want to** access PDF invoices for my payments
**So that** I have records for expense reporting

**Acceptance Criteria:**
- [ ] Generate PDF invoices with organization branding
- [ ] Include tax information if applicable
- [ ] Store invoice URLs in payments table
- [ ] Send invoice via email on payment

---

## Technical Implementation

### Subscription Service

```typescript
// lib/services/stripe-subscription.ts
import Stripe from 'stripe';
import { createClient } from '@/lib/supabase/server';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export interface CreateSubscriptionParams {
  memberId: string;
  priceId: string;
  paymentMethodId?: string;
  trialDays?: number;
}

export async function createSubscription({
  memberId,
  priceId,
  paymentMethodId,
  trialDays
}: CreateSubscriptionParams) {
  const supabase = createClient();

  // Get member and their Stripe customer ID
  const { data: member } = await supabase
    .from('members')
    .select('id, email, stripe_customer_id')
    .eq('id', memberId)
    .single();

  if (!member) throw new Error('Member not found');

  // Create or get Stripe customer
  let customerId = member.stripe_customer_id;
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: member.email,
      metadata: { member_id: memberId }
    });
    customerId = customer.id;

    await supabase
      .from('members')
      .update({ stripe_customer_id: customerId })
      .eq('id', memberId);
  }

  // Attach payment method if provided
  if (paymentMethodId) {
    await stripe.paymentMethods.attach(paymentMethodId, {
      customer: customerId
    });
    await stripe.customers.update(customerId, {
      invoice_settings: { default_payment_method: paymentMethodId }
    });
  }

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customerId,
    items: [{ price: priceId }],
    trial_period_days: trialDays,
    payment_behavior: 'default_incomplete',
    payment_settings: { save_default_payment_method: 'on_subscription' },
    expand: ['latest_invoice.payment_intent'],
    metadata: { member_id: memberId }
  });

  // Store subscription in database
  await supabase
    .from('members')
    .update({
      stripe_subscription_id: subscription.id,
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000)
    })
    .eq('id', memberId);

  return subscription;
}

export async function cancelSubscription(
  subscriptionId: string,
  cancelImmediately = false
) {
  if (cancelImmediately) {
    return stripe.subscriptions.cancel(subscriptionId);
  }

  return stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: true
  });
}

export async function updateSubscription(
  subscriptionId: string,
  newPriceId: string,
  prorationBehavior: 'create_prorations' | 'none' | 'always_invoice' = 'create_prorations'
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  return stripe.subscriptions.update(subscriptionId, {
    items: [{
      id: subscription.items.data[0].id,
      price: newPriceId
    }],
    proration_behavior: prorationBehavior
  });
}
```

### Webhook Handlers

```typescript
// app/api/webhooks/stripe/handlers/subscription.ts
import { Stripe } from 'stripe';
import { createClient } from '@/lib/supabase/server';

export async function handleSubscriptionUpdated(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = createClient();

  await supabase
    .from('members')
    .update({
      subscription_status: subscription.status,
      subscription_current_period_end: new Date(subscription.current_period_end * 1000),
      membership_status: mapSubscriptionToMemberStatus(subscription.status)
    })
    .eq('stripe_subscription_id', subscription.id);
}

export async function handleSubscriptionDeleted(event: Stripe.Event) {
  const subscription = event.data.object as Stripe.Subscription;
  const supabase = createClient();

  await supabase
    .from('members')
    .update({
      subscription_status: 'canceled',
      membership_status: 'inactive',
      stripe_subscription_id: null
    })
    .eq('stripe_subscription_id', subscription.id);
}

export async function handleInvoicePaid(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const supabase = createClient();

  // Record payment
  await supabase.from('payments').insert({
    stripe_invoice_id: invoice.id,
    stripe_payment_intent_id: invoice.payment_intent as string,
    amount: invoice.amount_paid / 100,
    currency: invoice.currency,
    status: 'succeeded',
    member_id: invoice.metadata?.member_id,
    invoice_pdf_url: invoice.invoice_pdf
  });

  // Update member renewal date
  if (invoice.subscription) {
    await supabase
      .from('members')
      .update({ last_payment_date: new Date() })
      .eq('stripe_subscription_id', invoice.subscription);
  }
}

export async function handleInvoicePaymentFailed(event: Stripe.Event) {
  const invoice = event.data.object as Stripe.Invoice;
  const supabase = createClient();

  // Get member
  const { data: member } = await supabase
    .from('members')
    .select('id, email, first_name')
    .eq('stripe_subscription_id', invoice.subscription)
    .single();

  if (member) {
    // Send payment failed email
    await sendPaymentFailedEmail(member.email, {
      firstName: member.first_name,
      amount: invoice.amount_due / 100,
      nextRetryDate: invoice.next_payment_attempt
        ? new Date(invoice.next_payment_attempt * 1000)
        : null,
      updatePaymentUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/billing`
    });

    // Update member payment status
    await supabase
      .from('members')
      .update({ payment_status: 'past_due' })
      .eq('id', member.id);
  }
}

function mapSubscriptionToMemberStatus(status: string): string {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
      return 'grace_period';
    case 'canceled':
    case 'unpaid':
      return 'inactive';
    default:
      return 'pending';
  }
}
```

### Dunning Email Templates

```typescript
// lib/emails/dunning.ts
export const dunningTemplates = {
  paymentFailed: {
    subject: 'Action Required: Payment Failed for Your Membership',
    template: 'payment-failed'
  },
  paymentRetrying: {
    subject: 'We\'ll Retry Your Payment Soon',
    template: 'payment-retrying'
  },
  finalNotice: {
    subject: 'Final Notice: Update Payment to Keep Your Membership',
    template: 'final-notice'
  },
  membershipSuspended: {
    subject: 'Your Membership Has Been Suspended',
    template: 'membership-suspended'
  }
};
```

### Refund Processing

```typescript
// lib/services/stripe-refund.ts
export async function processRefund(
  paymentIntentId: string,
  amount?: number,
  reason?: string
) {
  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    amount: amount ? amount * 100 : undefined, // Convert to cents
    reason: reason as Stripe.RefundCreateParams.Reason,
    metadata: { processed_by: 'admin', reason }
  });

  // Update payment record
  const supabase = createClient();
  await supabase
    .from('payments')
    .update({
      refund_status: refund.status,
      refund_amount: refund.amount / 100,
      refunded_at: new Date()
    })
    .eq('stripe_payment_intent_id', paymentIntentId);

  return refund;
}
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/subscriptions` | Create new subscription |
| GET | `/api/subscriptions/:id` | Get subscription details |
| PATCH | `/api/subscriptions/:id` | Update subscription (upgrade/downgrade) |
| DELETE | `/api/subscriptions/:id` | Cancel subscription |
| POST | `/api/subscriptions/:id/resume` | Resume canceled subscription |
| POST | `/api/payments/:id/refund` | Process refund |
| GET | `/api/invoices` | List member invoices |
| GET | `/api/invoices/:id/pdf` | Download invoice PDF |

---

## Dependencies

### Upstream
- **Epic-01:** event_tickets table for event payments
- **Epic-02:** Secure webhook handling

### Downstream
- Enables all revenue collection
- Required for membership renewals
- Required for event registration payments

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Stripe API changes | Low | High | Version pin SDK, test extensively |
| Webhook delivery failures | Low | High | Implement retry logic, monitoring |
| Proration calculation errors | Medium | Medium | Extensive testing, use Stripe's calculations |
| Dunning too aggressive | Low | Medium | Start with Stripe defaults, tune |

---

## Testing Plan

### Unit Tests
- [ ] Subscription creation with all options
- [ ] Subscription update (upgrade/downgrade)
- [ ] Subscription cancellation flows
- [ ] Refund calculations (full/partial)

### Integration Tests
- [ ] Webhook handling for all subscription events
- [ ] Payment failure → dunning email flow
- [ ] Refund → member status update flow

### Stripe Test Mode
- [ ] Test with Stripe CLI webhook forwarding
- [ ] Use test clocks for subscription lifecycle
- [ ] Test all card decline scenarios

---

## Definition of Done

- [ ] Subscription CRUD operations implemented
- [ ] All webhook handlers complete
- [ ] Dunning email templates created
- [ ] Refund processing working
- [ ] Invoice PDF generation configured
- [ ] API endpoints documented
- [ ] Integration tests passing
- [ ] Stripe test mode validation complete

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 1-2 |
| **Team:** | Backend |
| **Owner:** | Backend Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
