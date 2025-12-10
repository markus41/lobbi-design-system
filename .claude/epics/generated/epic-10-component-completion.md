# Epic-10: Component Completion

**Epic ID:** EPIC-10
**Priority:** P2 (Medium)
**Effort:** 16 hours
**Dependencies:** None
**Blocks:** None

---

## Summary

Create the remaining UI components that are referenced but not implemented. Currently 13 components are missing, causing build warnings and broken UI sections.

## Business Value

- **User Experience:** Fixes broken dashboard sections
- **Development:** Unblocks features that need these components
- **Consistency:** Maintains design system coherence
- **Polish:** Professional appearance for users

---

## Gaps Addressed

| Gap ID | Description | Severity | Effort |
|--------|-------------|----------|--------|
| GAP-025 | CourseCard component missing | Medium | 2 hours |
| GAP-026 | CourseProgress component missing | Medium | 2 hours |
| GAP-027 | RecentMembers dashboard missing | Medium | 2 hours |

---

## Missing Components Analysis

| Component | Used In | Priority | Effort |
|-----------|---------|----------|--------|
| CourseCard | /learning | High | 2h |
| CourseProgress | /learning/[id] | High | 2h |
| RecentMembers | /dashboard | High | 2h |
| EventCalendar | /events | Medium | 3h |
| MemberTimeline | /members/[id] | Medium | 2h |
| QuickActions | /dashboard | Low | 1h |
| NotificationBell | Header | Medium | 1h |
| SearchCommand | Global | Low | 2h |
| EmptyState | Multiple | Low | 1h |

---

## User Stories

### US-10.1: Learning Components
**As a** member
**I want to** see course cards and progress
**So that** I can navigate and track my learning

**Acceptance Criteria:**
- [ ] CourseCard displays course info, progress, and CTA
- [ ] CourseProgress shows module completion status
- [ ] Components match existing design system
- [ ] Components are responsive

### US-10.2: Dashboard Components
**As a** user
**I want to** see recent members on dashboard
**So that** I can quickly access new member profiles

**Acceptance Criteria:**
- [ ] RecentMembers shows last 5 new members
- [ ] Each member card is clickable
- [ ] Shows join date and membership type
- [ ] Handles empty state

### US-10.3: Global Components
**As a** user
**I want to** have consistent UI elements
**So that** the application feels cohesive

**Acceptance Criteria:**
- [ ] EmptyState component for lists with no data
- [ ] QuickActions for common tasks
- [ ] NotificationBell for alerts
- [ ] All use consistent styling

---

## Technical Implementation

### CourseCard Component

```typescript
// components/learning/CourseCard.tsx
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, BookOpen, Award } from 'lucide-react';
import Link from 'next/link';

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description: string;
    thumbnail_url?: string;
    duration_hours: number;
    module_count: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    category?: string;
  };
  progress?: number;
  enrolled?: boolean;
}

export function CourseCard({ course, progress = 0, enrolled = false }: CourseCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 text-green-800',
    intermediate: 'bg-yellow-100 text-yellow-800',
    advanced: 'bg-red-100 text-red-800',
  };

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        <div className="relative h-40 bg-gradient-to-br from-blue-500 to-purple-600 rounded-t-lg">
          {course.thumbnail_url && (
            <img
              src={course.thumbnail_url}
              alt={course.title}
              className="w-full h-full object-cover rounded-t-lg"
            />
          )}
          <Badge className={`absolute top-3 right-3 ${difficultyColors[course.difficulty]}`}>
            {course.difficulty}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
          {course.title}
        </h3>
        <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
          {course.description}
        </p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {course.duration_hours}h
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {course.module_count} modules
          </span>
        </div>

        {enrolled && progress > 0 && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Link href={`/learning/${course.id}`} className="w-full">
          <Button variant={enrolled ? 'outline' : 'default'} className="w-full">
            {enrolled ? (progress > 0 ? 'Continue' : 'Start Course') : 'Enroll Now'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
```

### CourseProgress Component

```typescript
// components/learning/CourseProgress.tsx
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  duration_minutes: number;
  status: 'locked' | 'available' | 'in_progress' | 'completed';
}

interface CourseProgressProps {
  modules: Module[];
  currentLessonId?: string;
  onLessonClick?: (lessonId: string) => void;
}

export function CourseProgress({
  modules,
  currentLessonId,
  onLessonClick
}: CourseProgressProps) {
  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce(
    (sum, m) => sum + m.lessons.filter(l => l.status === 'completed').length,
    0
  );
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex justify-between mb-2">
          <span className="font-medium">Course Progress</span>
          <span className="text-muted-foreground">{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-3" />
        <p className="text-sm text-muted-foreground mt-1">
          {completedLessons} of {totalLessons} lessons completed
        </p>
      </div>

      <div className="space-y-4">
        {modules.map((module, moduleIndex) => (
          <div key={module.id} className="border rounded-lg">
            <div className="p-4 bg-muted/50 font-medium">
              Module {moduleIndex + 1}: {module.title}
            </div>
            <div className="divide-y">
              {module.lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => lesson.status !== 'locked' && onLessonClick?.(lesson.id)}
                  disabled={lesson.status === 'locked'}
                  className={cn(
                    'w-full p-4 flex items-center gap-3 text-left hover:bg-muted/30 transition-colors',
                    lesson.status === 'locked' && 'opacity-50 cursor-not-allowed',
                    currentLessonId === lesson.id && 'bg-primary/10'
                  )}
                >
                  {lesson.status === 'completed' ? (
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                  ) : lesson.status === 'locked' ? (
                    <Lock className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{lesson.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {lesson.duration_minutes} min
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### RecentMembers Component

```typescript
// components/dashboard/RecentMembers.tsx
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Users, ArrowRight } from 'lucide-react';

interface RecentMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
  member_type: string;
  join_date: string;
}

interface RecentMembersProps {
  members: RecentMember[];
  loading?: boolean;
}

export function RecentMembers({ members, loading }: RecentMembersProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Members
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="h-10 w-10 rounded-full bg-muted" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-3 w-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!members.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recent Members
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p>No new members yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Recent Members
        </CardTitle>
        <Link href="/members">
          <Button variant="ghost" size="sm" className="text-muted-foreground">
            View all <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/members/${member.id}`}
              className="flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-muted transition-colors"
            >
              <Avatar>
                <AvatarImage src={member.avatar_url} />
                <AvatarFallback>
                  {member.first_name[0]}{member.last_name[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">
                  {member.first_name} {member.last_name}
                </p>
                <p className="text-sm text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(member.join_date), { addSuffix: true })}
                </p>
              </div>
              <Badge variant="secondary">{member.member_type}</Badge>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
```

### EmptyState Component

```typescript
// components/ui/empty-state.tsx
import { cn } from '@/lib/utils';
import { Button } from './button';
import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <Icon className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      {description && (
        <p className="text-muted-foreground mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
```

---

## Component Checklist

| Component | Status | Location |
|-----------|--------|----------|
| CourseCard | To Create | components/learning/ |
| CourseProgress | To Create | components/learning/ |
| RecentMembers | To Create | components/dashboard/ |
| EmptyState | To Create | components/ui/ |
| EventCalendar | To Create | components/events/ |
| MemberTimeline | To Create | components/members/ |
| QuickActions | To Create | components/dashboard/ |
| NotificationBell | To Create | components/layout/ |
| SearchCommand | To Create | components/global/ |

---

## Dependencies

### Upstream
- None (uses existing UI primitives)

### Downstream
- None (standalone UI components)

---

## Testing Plan

### Component Tests
- [ ] CourseCard renders with all props
- [ ] CourseProgress shows correct completion
- [ ] RecentMembers handles empty state
- [ ] EmptyState displays action button

### Visual Tests
- [ ] Components match design system
- [ ] Responsive on all breakpoints
- [ ] Hover/active states work

---

## Definition of Done

- [ ] All 9 components created
- [ ] Components use existing design system
- [ ] Components are responsive
- [ ] TypeScript types complete
- [ ] Tests written for each component
- [ ] Storybook stories (if applicable)
- [ ] No console warnings

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 1 |
| **Team:** | Frontend |
| **Owner:** | Frontend Lead |
| **Target Release:** | v1.5.0 |
| **Created:** | 2025-12-07 |
