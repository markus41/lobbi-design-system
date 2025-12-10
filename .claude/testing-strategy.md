# Component Testing Strategy - Alpha 1.4

**Generated:** 2025-11-29
**Agent:** react-specialist
**Phase:** PLAN - Component Testing Strategy

## Executive Summary

**Current State:**
- 87 React components across 6 categories
- 0 existing tests
- React 19.2.0 + Next.js 16.0.3 App Router
- Heavy Server Component usage
- No testing infrastructure configured

**Target State:**
- Comprehensive test coverage for all components
- User-centric testing approach (React Testing Library)
- Automated accessibility testing
- Mock infrastructure for all dependencies
- CI/CD integration ready

**Estimated Effort:**
- Priority 1 (Critical): 45 tests - 2 weeks
- Priority 2 (Complex): 85 tests - 3 weeks
- Priority 3 (UI Primitives): 78 tests - 2 weeks
- **Total:** 208 tests - 7 weeks

---

## 1. Prioritized Testing Roadmap

### Priority 1: Critical Components (45 tests)
**Timeline:** Weeks 1-2
**Focus:** Business-critical flows with data mutations

| Component | Location | Test Count | Rationale |
|-----------|----------|------------|-----------|
| **LoginForm** | `app/(auth)/login/page.tsx` | 8 | Auth entry point, OAuth, error handling |
| **Stripe Checkout** | Server Actions | 6 | Payment processing, financial transactions |
| **Member Import** | Data mutations | 5 | Bulk data operations |
| **Invoice Creation** | `app/(dashboard)/finance/invoices/create` | 6 | Financial record creation |
| **Event Registration** | Server Actions | 5 | Transaction + inventory management |
| **Password Reset** | `app/(auth)/reset-password` | 4 | Security-critical flow |
| **Email Verification** | `app/(auth)/verify-email` | 3 | Account activation |
| **Profile Updates** | `app/portal/profile` | 4 | Data integrity |
| **Membership Purchase** | Server Actions | 4 | Payment + subscription |

**Dependencies to Mock:**
- Supabase client (auth, database)
- Stripe SDK
- Next.js router
- Server Actions

**Success Criteria:**
- All critical paths tested
- Error states covered
- Loading states validated
- Accessibility checks pass

---

### Priority 2: Complex Components (85 tests)
**Timeline:** Weeks 3-5
**Focus:** Rich interactions, multi-step workflows

#### Feature Components (35 tests)

| Component | Location | Test Count | Complexity Drivers |
|-----------|----------|------------|--------------------|
| **Event Wizard** | `app/(dashboard)/events/create` | 8 | Multi-step form, validation, state management |
| **Campaign Builder** | `app/(dashboard)/communications/campaigns/create` | 7 | Rich editor, templates, scheduling |
| **Report Builder** | `app/(dashboard)/reports/builder` | 6 | Query builder, data visualization |
| **Automation Builder** | `app/(dashboard)/automations/builder` | 7 | Visual workflow editor |
| **Segment Builder** | `app/(dashboard)/communications/segments/builder` | 7 | Query builder, preview |

#### Dashboard Components (25 tests)

| Component | Location | Test Count | Features |
|-----------|----------|------------|----------|
| **KPI Cards** | Dashboard widgets | 5 | Data display, trends, sparklines |
| **Stat Cards** | Analytics displays | 4 | Formatting, icons, comparisons |
| **Bento Grid** | Layout system | 4 | Responsive grid, drag-drop |
| **Charts (Recharts)** | Multiple dashboards | 6 | Data visualization, interactions |
| **Calendar Views** | Events, scheduling | 6 | Date navigation, event display |

#### Portal Components (25 tests)

| Component | Location | Test Count | Mobile Focus |
|-----------|----------|------------|--------------|
| **SwipeableCard** | Portal UI | 6 | Touch gestures, animations |
| **PullRefresh** | Portal lists | 4 | Touch gestures, async refresh |
| **Mobile Navigation** | Portal layout | 5 | Bottom nav, gestures |
| **Event Cards** | Portal events | 5 | Display, interactions, CTAs |
| **Resource Cards** | Portal resources | 5 | Display, downloads, sharing |

**Testing Challenges:**
- Multi-step form state persistence
- Complex user interactions
- Touch gesture simulation
- Animation testing
- Data visualization rendering

---

### Priority 3: UI Primitives (78 tests)
**Timeline:** Weeks 6-7
**Focus:** Reusable shadcn/ui components

#### Core Primitives (39 tests)

| Component | Test Count | Focus Areas |
|-----------|------------|-------------|
| **Button** | 6 | Variants, sizes, states, asChild prop |
| **Input** | 4 | Types, validation, states |
| **Select** | 5 | Options, search, multiple, states |
| **Dialog** | 5 | Open/close, portal, focus trap |
| **Dropdown Menu** | 5 | Items, keyboard nav, positioning |
| **Checkbox** | 3 | States, indeterminate, form integration |
| **Radio Group** | 3 | Selection, keyboard nav |
| **Switch** | 2 | Toggle, states |
| **Tabs** | 4 | Navigation, keyboard, persistence |
| **Accordion** | 2 | Expand/collapse, keyboard |

#### Form Components (20 tests)

| Component | Test Count | Focus Areas |
|-----------|------------|-------------|
| **Form (react-hook-form)** | 8 | Validation, submission, errors |
| **Calendar** | 4 | Date selection, ranges, disabled dates |
| **Combobox** | 4 | Search, selection, async options |
| **Date Picker** | 4 | Date selection, format, validation |

#### Feedback Components (19 tests)

| Component | Test Count | Focus Areas |
|-----------|------------|-------------|
| **Toast** | 4 | Display, variants, duration, actions |
| **Alert** | 3 | Variants, icons, closeable |
| **Progress** | 2 | Value, indeterminate |
| **Skeleton** | 2 | Loading states |
| **Tooltip** | 3 | Hover, keyboard, positioning |
| **Popover** | 3 | Open/close, positioning, focus |
| **HoverCard** | 2 | Hover delay, content |

**Strategy:**
- Test composition patterns (asChild, Slot)
- Keyboard navigation
- Accessibility attributes
- Focus management
- Portal rendering

---

## 2. Testing Infrastructure Setup

### Required Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@testing-library/react-hooks": "^8.0.1",
    "vitest": "^2.0.0",
    "@vitest/ui": "^2.0.0",
    "jsdom": "^24.0.0",
    "msw": "^2.0.0",
    "@vitejs/plugin-react": "^4.2.1",
    "vitest-canvas-mock": "^0.3.3",
    "@axe-core/react": "^4.8.0"
  }
}
```

### Vitest Configuration

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.*',
        '**/types.ts',
        '**/*.d.ts'
      ]
    },
    include: ['**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules', '.next', 'dist']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
      '@/components': path.resolve(__dirname, './components'),
      '@/lib': path.resolve(__dirname, './lib'),
      '@/app': path.resolve(__dirname, './app')
    }
  }
})
```

### Test Setup File

**File:** `tests/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'
import 'vitest-canvas-mock'

// Cleanup after each test
afterEach(() => {
  cleanup()
})

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn()
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/test-path',
  notFound: vi.fn()
}))

// Mock server-only
vi.mock('server-only', () => ({}))

// Global test utilities
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))

global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))
```

---

## 3. Mock Strategy

### 3.1 Supabase Client Mock

**File:** `tests/mocks/supabase.ts`

```typescript
import { vi } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'

export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    getSession: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    }))
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: null, error: null }),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis()
  }))
} as unknown as SupabaseClient

vi.mock('@/lib/supabase/client', () => ({
  createClient: () => mockSupabaseClient,
  createBrowserClient: () => mockSupabaseClient
}))
```

### 3.2 Next.js Router Mock

**File:** `tests/mocks/next-router.ts`

```typescript
import { vi } from 'vitest'

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn()
}

export const mockSearchParams = new URLSearchParams()

export const mockPathname = '/test-path'
```

### 3.3 Stripe Elements Mock

**File:** `tests/mocks/stripe.ts`

```typescript
import { vi } from 'vitest'

export const mockStripe = {
  elements: vi.fn(() => ({
    create: vi.fn(() => ({
      mount: vi.fn(),
      unmount: vi.fn(),
      destroy: vi.fn(),
      on: vi.fn(),
      update: vi.fn()
    })),
    getElement: vi.fn()
  })),
  confirmCardPayment: vi.fn(),
  confirmPayment: vi.fn()
}

vi.mock('@stripe/stripe-js', () => ({
  loadStripe: vi.fn(() => Promise.resolve(mockStripe))
}))

vi.mock('@stripe/react-stripe-js', () => ({
  Elements: ({ children }: { children: React.ReactNode }) => children,
  useStripe: () => mockStripe,
  useElements: () => ({
    getElement: vi.fn()
  })
}))
```

### 3.4 Server Actions Mock

**File:** `tests/mocks/server-actions.ts`

```typescript
import { vi } from 'vitest'

// Mock all server actions
vi.mock('@/app/actions/stripe', () => ({
  createInvoiceCheckoutSession: vi.fn(),
  createMembershipCheckoutSession: vi.fn(),
  createEventRegistrationCheckoutSession: vi.fn(),
  getPaymentStatus: vi.fn()
}))

vi.mock('@/app/actions/video', () => ({
  createZoomMeeting: vi.fn(),
  getZoomMeetingDetails: vi.fn()
}))
```

### 3.5 React Query Mock

**File:** `tests/mocks/react-query.ts`

```typescript
import { vi } from 'vitest'
import { QueryClient } from '@tanstack/react-query'

export const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        cacheTime: 0
      }
    },
    logger: {
      log: vi.fn(),
      warn: vi.fn(),
      error: vi.fn()
    }
  })
```

---

## 4. Testing Patterns by Component Type

### 4.1 Client Component Pattern

**Template:** `tests/templates/client-component.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button } from '@/components/ui/button'

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('handles click events', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button onClick={handleClick}>Click me</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders all variants correctly', () => {
    const { rerender } = render(<Button variant="default">Default</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-primary')

    rerender(<Button variant="destructive">Destructive</Button>)
    expect(screen.getByRole('button')).toHaveClass('bg-destructive')
  })

  it('respects disabled state', async () => {
    const handleClick = vi.fn()
    const user = userEvent.setup()

    render(<Button disabled onClick={handleClick}>Disabled</Button>)
    await user.click(screen.getByRole('button'))

    expect(handleClick).not.toHaveBeenCalled()
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('renders as child component when asChild is true', () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>
    )
    expect(screen.getByRole('link')).toBeInTheDocument()
  })
})
```

### 4.2 Form Component Pattern

**Template:** `tests/templates/form-component.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters')
})

function LoginFormTest() {
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' }
  })

  return (
    <form onSubmit={form.handleSubmit(() => {})}>
      <input {...form.register('email')} placeholder="Email" />
      <input {...form.register('password')} type="password" placeholder="Password" />
      <button type="submit">Submit</button>
      {form.formState.errors.email && <span>{form.formState.errors.email.message}</span>}
      {form.formState.errors.password && <span>{form.formState.errors.password.message}</span>}
    </form>
  )
}

describe('Form Component with Zod Validation', () => {
  it('validates email format', async () => {
    const user = userEvent.setup()
    render(<LoginFormTest />)

    await user.type(screen.getByPlaceholderText('Email'), 'invalid-email')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Invalid email')).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<LoginFormTest />)

    await user.type(screen.getByPlaceholderText('Password'), 'short')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 8 characters')).toBeInTheDocument()
    })
  })

  it('submits valid data', async () => {
    const user = userEvent.setup()
    render(<LoginFormTest />)

    await user.type(screen.getByPlaceholderText('Email'), 'test@example.com')
    await user.type(screen.getByPlaceholderText('Password'), 'password123')
    await user.click(screen.getByRole('button'))

    await waitFor(() => {
      expect(screen.queryByText('Invalid email')).not.toBeInTheDocument()
      expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument()
    })
  })
})
```

### 4.3 Async Component Pattern

**Template:** `tests/templates/async-component.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { mockSupabaseClient } from '../mocks/supabase'

function MembersList() {
  const { data, isLoading } = useMembers()

  if (isLoading) return <div>Loading...</div>

  return (
    <ul>
      {data?.map(member => (
        <li key={member.id}>{member.name}</li>
      ))}
    </ul>
  )
}

describe('Async Data Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } }
    })
  })

  it('shows loading state initially', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MembersList />
      </QueryClientProvider>
    )

    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('displays data after loading', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: [
          { id: 1, name: 'John Doe' },
          { id: 2, name: 'Jane Smith' }
        ],
        error: null
      })
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MembersList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('Jane Smith')).toBeInTheDocument()
    })
  })

  it('handles errors gracefully', async () => {
    mockSupabaseClient.from.mockReturnValue({
      select: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Failed to fetch' }
      })
    })

    render(
      <QueryClientProvider client={queryClient}>
        <MembersList />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

### 4.4 Server Component Pattern

**Template:** `tests/templates/server-component.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'

// Server Components need to be tested differently
// Mock server-side data fetching

vi.mock('@/lib/supabase/server', () => ({
  createServerSupabaseClient: vi.fn(() => ({
    from: () => ({
      select: () => ({
        data: [{ id: 1, name: 'Test' }],
        error: null
      })
    })
  }))
}))

describe('Server Component', () => {
  it('renders server-fetched data', async () => {
    // For Server Components, test the rendered output
    // Integration tests are more appropriate
    const Component = await import('@/app/(dashboard)/members/page')

    // Render and verify the static output
    expect(Component).toBeDefined()
  })
})
```

### 4.5 Touch Gesture Pattern (Portal Components)

**Template:** `tests/templates/touch-gesture.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

describe('SwipeableCard', () => {
  it('handles swipe gestures', async () => {
    const onSwipe = vi.fn()
    const user = userEvent.setup()

    render(<SwipeableCard onSwipe={onSwipe}>Content</SwipeableCard>)

    const card = screen.getByText('Content')

    // Simulate touch events
    await user.pointer([
      { keys: '[TouchA>]', target: card, coords: { x: 0, y: 0 } },
      { coords: { x: 100, y: 0 } },
      { keys: '[/TouchA]' }
    ])

    expect(onSwipe).toHaveBeenCalledWith('right')
  })
})
```

### 4.6 Accessibility Testing Pattern

**Template:** `tests/templates/accessibility.test.tsx`

```typescript
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(<Button>Click me</Button>)
    const results = await axe(container)

    expect(results).toHaveNoViolations()
  })

  it('has proper ARIA attributes', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>Content</DialogContent>
      </Dialog>
    )

    expect(screen.getByRole('button')).toHaveAttribute('aria-haspopup', 'dialog')
  })

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup()
    render(<Button>Click me</Button>)

    await user.tab()
    expect(screen.getByRole('button')).toHaveFocus()

    await user.keyboard('{Enter}')
    // Assert action occurred
  })
})
```

---

## 5. Test File Organization

```
tests/
├── setup.ts                          # Global test setup
├── mocks/
│   ├── supabase.ts                   # Supabase client mock
│   ├── next-router.ts                # Next.js router mock
│   ├── stripe.ts                     # Stripe SDK mock
│   ├── server-actions.ts             # Server action mocks
│   └── react-query.ts                # React Query test client
├── templates/
│   ├── client-component.test.tsx     # Client component template
│   ├── form-component.test.tsx       # Form testing template
│   ├── async-component.test.tsx      # Async data template
│   ├── server-component.test.tsx     # Server component template
│   ├── touch-gesture.test.tsx        # Touch interaction template
│   └── accessibility.test.tsx        # A11y testing template
├── utils/
│   ├── render-with-providers.tsx     # Custom render function
│   ├── test-data.ts                  # Mock data generators
│   └── custom-matchers.ts            # Custom assertions
└── __tests__/
    ├── components/
    │   ├── ui/
    │   │   ├── button.test.tsx
    │   │   ├── input.test.tsx
    │   │   └── ...
    │   └── features/
    │       ├── event-wizard.test.tsx
    │       └── ...
    ├── app/
    │   ├── auth/
    │   │   └── login.test.tsx
    │   └── dashboard/
    │       └── ...
    └── lib/
        ├── hooks/
        │   └── use-members.test.ts
        └── utils/
            └── ...
```

---

## 6. Custom Test Utilities

### 6.1 Render with Providers

**File:** `tests/utils/render-with-providers.tsx`

```typescript
import { render, RenderOptions } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactElement, ReactNode } from 'react'

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false, cacheTime: 0 },
      mutations: { retry: false }
    }
  })

interface ProvidersProps {
  children: ReactNode
  queryClient?: QueryClient
}

function Providers({ children, queryClient }: ProvidersProps) {
  const client = queryClient || createTestQueryClient()

  return (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  )
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { queryClient?: QueryClient }
) {
  const { queryClient, ...renderOptions } = options || {}

  return render(ui, {
    wrapper: ({ children }) => (
      <Providers queryClient={queryClient}>{children}</Providers>
    ),
    ...renderOptions
  })
}
```

### 6.2 Mock Data Generators

**File:** `tests/utils/test-data.ts`

```typescript
import { faker } from '@faker-js/faker'

export const createMockMember = (overrides = {}) => ({
  id: faker.string.uuid(),
  first_name: faker.person.firstName(),
  last_name: faker.person.lastName(),
  email: faker.internet.email(),
  phone: faker.phone.number(),
  status: 'active',
  created_at: faker.date.past().toISOString(),
  ...overrides
})

export const createMockEvent = (overrides = {}) => ({
  id: faker.string.uuid(),
  name: faker.lorem.words(3),
  description: faker.lorem.paragraph(),
  start_date: faker.date.future().toISOString(),
  end_date: faker.date.future().toISOString(),
  location: faker.location.city(),
  status: 'upcoming',
  ...overrides
})

export const createMockInvoice = (overrides = {}) => ({
  id: faker.string.uuid(),
  invoice_number: faker.string.alphanumeric(10),
  amount: faker.number.float({ min: 10, max: 1000, precision: 0.01 }),
  status: 'unpaid',
  due_date: faker.date.future().toISOString(),
  ...overrides
})
```

---

## 7. CI/CD Integration

### GitHub Actions Workflow

**File:** `.github/workflows/test.yml`

```yaml
name: Component Tests

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: component-coverage

      - name: Check coverage thresholds
        run: |
          npm test -- --coverage --coverageThresholds.global.statements=80
```

### Package.json Scripts

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:ci": "vitest run --coverage"
  }
}
```

---

## 8. Estimated Test Count Breakdown

### By Priority

| Priority | Component Count | Tests per Component | Total Tests | Weeks |
|----------|----------------|---------------------|-------------|-------|
| P1 - Critical | 9 | 5 | 45 | 2 |
| P2 - Complex | 17 | 5 | 85 | 3 |
| P3 - UI Primitives | 39 | 2 | 78 | 2 |
| **TOTAL** | **65** | **3.2 avg** | **208** | **7** |

### By Component Type

| Type | Components | Tests | Notes |
|------|------------|-------|-------|
| Auth Components | 4 | 19 | Login, reset, verify, OAuth |
| Financial Components | 5 | 20 | Stripe, invoices, payments |
| Form Components | 10 | 40 | Wizards, builders, editors |
| Dashboard Components | 8 | 25 | Charts, cards, analytics |
| Portal Components | 6 | 25 | Mobile-first, touch gestures |
| UI Primitives | 39 | 78 | shadcn/ui components |
| Layout Components | 3 | 1 | Simple structural tests |
| **TOTAL** | **75** | **208** | - |

### Coverage Targets

| Category | Target Coverage | Rationale |
|----------|----------------|-----------|
| Priority 1 (Critical) | 95%+ | Business-critical flows |
| Priority 2 (Complex) | 85%+ | Rich interactions |
| Priority 3 (UI) | 80%+ | Reusable primitives |
| Overall Target | 85%+ | Industry standard |

---

## 9. Testing Workflow

### Phase 1: Setup (Week 1, Days 1-2)
- [ ] Install testing dependencies
- [ ] Configure Vitest
- [ ] Set up test utilities and mocks
- [ ] Create template test files
- [ ] Verify CI/CD integration

### Phase 2: Priority 1 Testing (Week 1-2)
- [ ] Auth flow tests (LoginForm, PasswordReset, etc.)
- [ ] Payment flow tests (Stripe, Invoices)
- [ ] Critical data mutation tests
- [ ] Error handling validation
- [ ] Accessibility baseline

### Phase 3: Priority 2 Testing (Week 3-5)
- [ ] Feature component tests (Wizards, Builders)
- [ ] Dashboard component tests
- [ ] Portal component tests
- [ ] Complex interaction tests
- [ ] Touch gesture tests

### Phase 4: Priority 3 Testing (Week 6-7)
- [ ] UI primitive tests
- [ ] Form component tests
- [ ] Feedback component tests
- [ ] Keyboard navigation tests
- [ ] Comprehensive accessibility tests

### Phase 5: Optimization (Week 7+)
- [ ] Review coverage reports
- [ ] Fill coverage gaps
- [ ] Performance testing
- [ ] Visual regression testing (optional)
- [ ] Documentation

---

## 10. Success Metrics

### Quantitative Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Overall Coverage | 85%+ | Vitest coverage report |
| Critical Path Coverage | 95%+ | P1 component coverage |
| Test Execution Time | <30s | CI/CD pipeline |
| Test Failure Rate | <5% | CI/CD stability |
| Accessibility Violations | 0 | Axe violations |

### Qualitative Metrics

- [ ] All critical user flows tested
- [ ] Comprehensive error state coverage
- [ ] Keyboard navigation verified
- [ ] Screen reader compatibility validated
- [ ] Mobile touch interactions verified
- [ ] Form validation tested end-to-end
- [ ] Loading states validated
- [ ] Mock infrastructure stable

---

## 11. Next Steps (Post-Planning)

1. **tester** agent will:
   - Implement Priority 1 tests
   - Set up testing infrastructure
   - Create reusable test utilities

2. **accessibility-expert** agent will:
   - Implement accessibility test suite
   - Run axe audits on all components
   - Document ARIA patterns

3. **debugger** agent will:
   - Fix failing tests
   - Optimize test performance
   - Resolve flaky tests

4. **docs-writer** agent will:
   - Document testing patterns
   - Create testing guidelines
   - Update repository documentation in Obsidian vault

---

## Appendix A: Testing Libraries Comparison

| Library | Use Case | Pros | Cons |
|---------|----------|------|------|
| **Vitest** | Unit/Component testing | Fast, Vite native, great DX | Newer, smaller ecosystem |
| **Jest** | Traditional choice | Large ecosystem, mature | Slower, requires config |
| **Testing Library** | Component testing | User-centric, accessible | Learning curve |
| **Playwright** | E2E testing | Real browser, reliable | Slow, complex setup |

**Recommendation:** Vitest + Testing Library for this project.

---

## Appendix B: Common Testing Pitfalls

1. **Testing Implementation Details**
   - ❌ Testing state variables directly
   - ✅ Testing user-visible behavior

2. **Over-Mocking**
   - ❌ Mocking everything
   - ✅ Mock external dependencies only

3. **Ignoring Accessibility**
   - ❌ Testing visuals only
   - ✅ Test keyboard nav and screen readers

4. **Flaky Tests**
   - ❌ Using arbitrary timeouts
   - ✅ Using waitFor with proper queries

5. **Poor Test Organization**
   - ❌ One massive test file
   - ✅ Organized by feature/component

---

**Generated by:** react-specialist
**Date:** 2025-11-29
**Status:** PLAN COMPLETE - Ready for CODE phase
