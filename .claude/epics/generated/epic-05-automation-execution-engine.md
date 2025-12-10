# Epic-05: Automation Execution Engine

**Epic ID:** EPIC-05
**Priority:** P1 (High)
**Effort:** 80 hours
**Dependencies:** Epic-01, Epic-04
**Blocks:** Epic-12 (Advanced Features)

---

## Summary

Build a complete automation execution engine that can evaluate triggers, execute actions, and manage workflow state. Currently at 40% completion with critical gaps in trigger evaluation and action execution handlers.

## Business Value

- **Efficiency:** Automates repetitive member management tasks
- **Engagement:** Timely, automated member communications
- **Retention:** Automated re-engagement workflows reduce churn
- **Scale:** Enables organization to manage more members without staff increase

---

## Gaps Addressed

| Gap ID | Description | Severity | Completion |
|--------|-------------|----------|------------|
| GAP-005 | Trigger execution engine missing | Critical | 0% |
| GAP-006 | Action execution handlers missing | Critical | 0% |
| GAP-I09 | Workflow builder UI | High | 60% |
| GAP-I10 | Conditional logic evaluation | High | 30% |

---

## User Stories

### US-05.1: Trigger Event Handling
**As a** system
**I want to** detect and process trigger events
**So that** automations execute at the right time

**Acceptance Criteria:**
- [ ] Subscribe to database change events
- [ ] Detect member status changes
- [ ] Detect payment events
- [ ] Detect engagement milestones
- [ ] Queue triggered automations for processing

### US-05.2: Condition Evaluation
**As an** automation designer
**I want to** set conditions on automation steps
**So that** actions only execute when criteria are met

**Acceptance Criteria:**
- [ ] Evaluate conditions against member data
- [ ] Support AND/OR logic
- [ ] Support comparison operators
- [ ] Support dynamic date comparisons (e.g., "7 days before renewal")
- [ ] Log condition evaluation results

### US-05.3: Action Execution
**As a** system
**I want to** execute automation actions
**So that** automated workflows complete successfully

**Acceptance Criteria:**
- [ ] Execute email send actions
- [ ] Execute tag add/remove actions
- [ ] Execute member field update actions
- [ ] Execute wait/delay actions
- [ ] Execute webhook call actions
- [ ] Handle action failures with retries

### US-05.4: Workflow State Management
**As an** administrator
**I want to** track automation execution status
**So that** I can monitor and troubleshoot workflows

**Acceptance Criteria:**
- [ ] Track workflow instance state
- [ ] Record action execution results
- [ ] Support pausing/resuming workflows
- [ ] Handle workflow cancellation
- [ ] Maintain execution history

### US-05.5: Scheduled Automations
**As an** automation designer
**I want to** schedule automations to run at specific times
**So that** I can send messages at optimal times

**Acceptance Criteria:**
- [ ] Support cron-like schedules
- [ ] Support date-based triggers (e.g., "30 days after join")
- [ ] Handle timezone considerations
- [ ] Queue scheduled automations efficiently

---

## Technical Implementation

### Trigger Types

```typescript
// types/automations.ts
export type TriggerType =
  | 'member_created'
  | 'member_updated'
  | 'member_status_changed'
  | 'member_joined_segment'
  | 'member_left_segment'
  | 'event_registered'
  | 'event_attended'
  | 'payment_succeeded'
  | 'payment_failed'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'scheduled'
  | 'manual';

export interface TriggerConfig {
  type: TriggerType;
  conditions?: ConditionGroup;
  schedule?: CronSchedule;
}

export type ActionType =
  | 'send_email'
  | 'send_sms'
  | 'add_tag'
  | 'remove_tag'
  | 'update_field'
  | 'add_to_segment'
  | 'remove_from_segment'
  | 'wait'
  | 'webhook'
  | 'create_task'
  | 'notify_admin';

export interface ActionConfig {
  type: ActionType;
  params: Record<string, any>;
  onError?: 'continue' | 'stop' | 'retry';
  retryCount?: number;
}

export interface AutomationWorkflow {
  id: string;
  name: string;
  trigger: TriggerConfig;
  steps: WorkflowStep[];
  status: 'draft' | 'active' | 'paused' | 'archived';
}

export interface WorkflowStep {
  id: string;
  type: 'action' | 'condition' | 'delay';
  action?: ActionConfig;
  condition?: ConditionGroup;
  delay?: DelayConfig;
  nextSteps: string[]; // IDs of next steps
}
```

### Trigger Event Processor

```typescript
// lib/services/automation-trigger.ts
import { createClient } from '@/lib/supabase/server';
import { Redis } from '@upstash/redis';
import type { TriggerType, AutomationWorkflow } from '@/types/automations';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

export class AutomationTriggerProcessor {
  private supabase = createClient();

  async processTriggerEvent(
    triggerType: TriggerType,
    payload: Record<string, any>
  ): Promise<void> {
    // Find matching automations
    const { data: automations } = await this.supabase
      .from('automations')
      .select('*')
      .eq('status', 'active')
      .eq('trigger_type', triggerType);

    if (!automations?.length) return;

    for (const automation of automations) {
      // Check trigger conditions
      const workflow = automation.workflow as AutomationWorkflow;

      if (workflow.trigger.conditions) {
        const conditionsMet = await this.evaluateConditions(
          workflow.trigger.conditions,
          payload
        );
        if (!conditionsMet) continue;
      }

      // Queue automation execution
      await this.queueAutomationExecution(automation.id, payload);
    }
  }

  private async evaluateConditions(
    conditions: ConditionGroup,
    context: Record<string, any>
  ): Promise<boolean> {
    // Use segment evaluation logic
    const { SegmentEvaluationEngine } = await import('./segment-engine');
    const engine = new SegmentEvaluationEngine();

    // Build criteria from conditions
    const memberIds = await engine.evaluateInlineConditions(
      conditions,
      context.organization_id
    );

    return memberIds.includes(context.member_id);
  }

  private async queueAutomationExecution(
    automationId: string,
    context: Record<string, any>
  ): Promise<void> {
    const executionId = crypto.randomUUID();

    // Create execution record
    await this.supabase.from('automation_executions').insert({
      id: executionId,
      automation_id: automationId,
      status: 'pending',
      context,
      started_at: new Date()
    });

    // Queue for processing via QStash
    const { Client } = await import('@upstash/qstash');
    const qstash = new Client({
      token: process.env.QSTASH_TOKEN!
    });

    await qstash.publishJSON({
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/automations/execute`,
      body: { executionId },
      retries: 3
    });
  }
}
```

### Action Executor

```typescript
// lib/services/automation-executor.ts
import { createClient } from '@/lib/supabase/server';
import type { ActionConfig, WorkflowStep } from '@/types/automations';

export class AutomationExecutor {
  private supabase = createClient();
  private handlers: Map<string, ActionHandler> = new Map();

  constructor() {
    this.registerHandlers();
  }

  private registerHandlers() {
    this.handlers.set('send_email', new SendEmailHandler());
    this.handlers.set('add_tag', new AddTagHandler());
    this.handlers.set('remove_tag', new RemoveTagHandler());
    this.handlers.set('update_field', new UpdateFieldHandler());
    this.handlers.set('wait', new WaitHandler());
    this.handlers.set('webhook', new WebhookHandler());
    this.handlers.set('notify_admin', new NotifyAdminHandler());
  }

  async executeWorkflow(executionId: string): Promise<void> {
    const { data: execution } = await this.supabase
      .from('automation_executions')
      .select('*, automation:automations(*)')
      .eq('id', executionId)
      .single();

    if (!execution) throw new Error('Execution not found');

    const workflow = execution.automation.workflow as AutomationWorkflow;
    const context = execution.context;

    // Update status to running
    await this.updateExecutionStatus(executionId, 'running');

    try {
      // Find starting step (first step)
      const startStep = workflow.steps[0];
      await this.executeStep(executionId, startStep, workflow.steps, context);

      // Mark as completed
      await this.updateExecutionStatus(executionId, 'completed');
    } catch (error) {
      await this.updateExecutionStatus(executionId, 'failed', error.message);
      throw error;
    }
  }

  private async executeStep(
    executionId: string,
    step: WorkflowStep,
    allSteps: WorkflowStep[],
    context: Record<string, any>
  ): Promise<void> {
    // Log step start
    await this.logStepExecution(executionId, step.id, 'started');

    try {
      if (step.type === 'action' && step.action) {
        await this.executeAction(step.action, context);
      } else if (step.type === 'condition' && step.condition) {
        const result = await this.evaluateCondition(step.condition, context);
        // Condition determines which next step to take
        // True path vs False path
      } else if (step.type === 'delay' && step.delay) {
        await this.scheduleDelayedContinuation(executionId, step, context);
        return; // Exit - will resume after delay
      }

      // Log step completion
      await this.logStepExecution(executionId, step.id, 'completed');

      // Execute next steps
      for (const nextStepId of step.nextSteps) {
        const nextStep = allSteps.find(s => s.id === nextStepId);
        if (nextStep) {
          await this.executeStep(executionId, nextStep, allSteps, context);
        }
      }
    } catch (error) {
      await this.logStepExecution(executionId, step.id, 'failed', error.message);

      if (step.action?.onError === 'continue') {
        // Continue to next step despite error
        for (const nextStepId of step.nextSteps) {
          const nextStep = allSteps.find(s => s.id === nextStepId);
          if (nextStep) {
            await this.executeStep(executionId, nextStep, allSteps, context);
          }
        }
      } else {
        throw error;
      }
    }
  }

  private async executeAction(
    action: ActionConfig,
    context: Record<string, any>
  ): Promise<void> {
    const handler = this.handlers.get(action.type);
    if (!handler) {
      throw new Error(`Unknown action type: ${action.type}`);
    }

    await handler.execute(action.params, context);
  }
}

// Action Handlers
interface ActionHandler {
  execute(params: Record<string, any>, context: Record<string, any>): Promise<void>;
}

class SendEmailHandler implements ActionHandler {
  async execute(params: Record<string, any>, context: Record<string, any>) {
    const { templateId, subject, customizations } = params;
    const { member_id, organization_id } = context;

    // Get member
    const supabase = createClient();
    const { data: member } = await supabase
      .from('members')
      .select('email, first_name, last_name')
      .eq('id', member_id)
      .single();

    if (!member) throw new Error('Member not found');

    // Get template
    const { data: template } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    // Send via SendGrid
    const { sendEmail } = await import('@/lib/integrations/sendgrid');
    await sendEmail({
      to: member.email,
      subject: subject || template.subject,
      templateId: template.sendgrid_template_id,
      dynamicTemplateData: {
        first_name: member.first_name,
        ...customizations
      }
    });

    // Record send
    await supabase.from('email_sends').insert({
      member_id,
      organization_id,
      email_address: member.email,
      template_id: templateId,
      status: 'sent',
      sent_at: new Date()
    });
  }
}

class AddTagHandler implements ActionHandler {
  async execute(params: Record<string, any>, context: Record<string, any>) {
    const { tagId } = params;
    const { member_id } = context;

    const supabase = createClient();
    await supabase.from('member_tags').upsert({
      member_id,
      tag_id: tagId
    });
  }
}

class WaitHandler implements ActionHandler {
  async execute(params: Record<string, any>, context: Record<string, any>) {
    // This is handled specially - it schedules a delayed continuation
    throw new Error('Wait should be handled by scheduler');
  }
}

class WebhookHandler implements ActionHandler {
  async execute(params: Record<string, any>, context: Record<string, any>) {
    const { url, method, headers, body } = params;

    const response = await fetch(url, {
      method: method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({
        ...body,
        context
      })
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }
}
```

### Database Schema for Executions

```sql
-- automation_executions table
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'waiting', 'completed', 'failed', 'cancelled')),
    context JSONB NOT NULL,
    current_step_id TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- automation_step_logs table
CREATE TABLE automation_step_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id UUID REFERENCES automation_executions(id) ON DELETE CASCADE,
    step_id TEXT NOT NULL,
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    output JSONB
);

-- Indexes
CREATE INDEX idx_automation_executions_automation ON automation_executions(automation_id);
CREATE INDEX idx_automation_executions_status ON automation_executions(status);
CREATE INDEX idx_step_logs_execution ON automation_step_logs(execution_id);
```

---

## Dependencies

### Upstream
- **Epic-01:** email_sends table for tracking
- **Epic-04:** Segment evaluation for conditions

### Downstream
- **Epic-12:** Advanced automation features

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Infinite loops | Medium | High | Max execution depth, loop detection |
| Action failures cascade | Medium | Medium | Retry logic, error handling |
| Performance at scale | Medium | High | Queue batching, rate limiting |
| State corruption | Low | High | Transaction safety, idempotency |

---

## Testing Plan

### Unit Tests
- [ ] Test each action handler in isolation
- [ ] Test condition evaluation logic
- [ ] Test workflow step sequencing

### Integration Tests
- [ ] Test trigger → execution flow
- [ ] Test delay/resume functionality
- [ ] Test error handling and retries

### Load Tests
- [ ] Process 1000 triggers concurrently
- [ ] Verify queue doesn't back up
- [ ] Test memory usage with complex workflows

---

## Definition of Done

- [ ] All trigger types implemented
- [ ] All action handlers working
- [ ] Condition evaluation complete
- [ ] Workflow state management working
- [ ] Delay/scheduling functional
- [ ] Execution logging complete
- [ ] Error handling with retries
- [ ] Tests passing
- [ ] Documentation complete

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 2-4 |
| **Team:** | Backend |
| **Owner:** | Backend Lead |
| **Target Release:** | v1.6.0 |
| **Created:** | 2025-12-07 |
