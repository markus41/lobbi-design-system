# Epic-08: Learning Management System

**Epic ID:** EPIC-08
**Priority:** P2 (Medium)
**Effort:** 60 hours
**Dependencies:** Epic-01
**Blocks:** None (standalone feature)

---

## Summary

Complete the Learning Management System including course delivery, progress tracking, assessments, and certificate generation. Currently at 72% completion with critical gaps in content delivery and progress tracking.

## Business Value

- **Revenue:** Enables course sales ($8K-15K/month potential)
- **Engagement:** Increases member value and retention
- **Certification:** Professional development offerings
- **Differentiation:** Competitive advantage for the association

---

## Gaps Addressed

| Gap ID | Description | Severity | Completion |
|--------|-------------|----------|------------|
| GAP-021 | Course content delivery missing | Critical | 0% |
| GAP-022 | Course assessments/quizzes missing | High | 0% |
| GAP-023 | Certificate PDF generation missing | High | 0% |
| GAP-024 | Course progress tracking missing | Critical | 0% |
| GAP-I08 | Course enrollment management | High | 50% |

---

## User Stories

### US-08.1: Course Content Delivery
**As a** member
**I want to** access course content in a structured format
**So that** I can learn at my own pace

**Acceptance Criteria:**
- [ ] Display course modules and lessons
- [ ] Support video, text, and document content
- [ ] Mark lessons as complete
- [ ] Resume from last position
- [ ] Support downloadable resources

### US-08.2: Progress Tracking
**As a** member
**I want to** track my course progress
**So that** I know how much I've completed

**Acceptance Criteria:**
- [ ] Display overall course progress percentage
- [ ] Show completed/remaining modules
- [ ] Track time spent on course
- [ ] Save progress automatically
- [ ] Display progress on dashboard

### US-08.3: Assessments & Quizzes
**As a** course instructor
**I want to** add quizzes to validate learning
**So that** members demonstrate understanding

**Acceptance Criteria:**
- [ ] Create multiple choice questions
- [ ] Create true/false questions
- [ ] Set passing score requirement
- [ ] Display quiz results immediately
- [ ] Allow quiz retakes if configured
- [ ] Track quiz attempt history

### US-08.4: Certificate Generation
**As a** member
**I want to** receive a certificate upon course completion
**So that** I can demonstrate my achievement

**Acceptance Criteria:**
- [ ] Generate PDF certificate on completion
- [ ] Include member name, course, and date
- [ ] Support organization branding
- [ ] Unique certificate ID for verification
- [ ] Download and email certificate

### US-08.5: Course Enrollment
**As a** member
**I want to** enroll in courses
**So that** I can access the learning content

**Acceptance Criteria:**
- [ ] Browse available courses
- [ ] View course details and syllabus
- [ ] Enroll in free courses instantly
- [ ] Process payment for paid courses
- [ ] Receive enrollment confirmation email

---

## Technical Implementation

### Database Schema

```sql
-- Course modules
CREATE TABLE course_modules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Course lessons
CREATE TABLE course_lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    module_id UUID REFERENCES course_modules(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_type TEXT CHECK (content_type IN ('video', 'text', 'document', 'quiz')),
    content JSONB NOT NULL,
    order_index INTEGER NOT NULL,
    duration_minutes INTEGER,
    is_previewable BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Member progress
CREATE TABLE course_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    lesson_id UUID REFERENCES course_lessons(id),
    status TEXT DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    progress_percent INTEGER DEFAULT 0,
    last_position JSONB, -- For video: { time: seconds }, for text: { scroll: percent }
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    time_spent_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(member_id, course_id, lesson_id)
);

-- Quizzes
CREATE TABLE course_quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID REFERENCES course_lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    passing_score INTEGER DEFAULT 70,
    max_attempts INTEGER,
    time_limit_minutes INTEGER,
    shuffle_questions BOOLEAN DEFAULT false,
    show_correct_answers BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Quiz questions
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quiz_id UUID REFERENCES course_quizzes(id) ON DELETE CASCADE,
    question_type TEXT CHECK (question_type IN ('multiple_choice', 'true_false', 'short_answer')),
    question_text TEXT NOT NULL,
    options JSONB, -- For multiple choice: [{ id, text, isCorrect }]
    correct_answer TEXT,
    explanation TEXT,
    points INTEGER DEFAULT 1,
    order_index INTEGER NOT NULL
);

-- Quiz attempts
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    quiz_id UUID REFERENCES course_quizzes(id) ON DELETE CASCADE,
    score INTEGER,
    passed BOOLEAN,
    answers JSONB, -- { questionId: answer }
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    time_spent_seconds INTEGER
);

-- Certificates
CREATE TABLE certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    issued_at TIMESTAMPTZ DEFAULT NOW(),
    pdf_url TEXT,
    metadata JSONB DEFAULT '{}'
);
```

### Course Progress Service

```typescript
// lib/services/course-progress.ts
import { createClient } from '@/lib/supabase/server';

export class CourseProgressService {
  private supabase = createClient();

  async getProgress(memberId: string, courseId: string): Promise<CourseProgress> {
    const { data: progress } = await this.supabase
      .from('course_progress')
      .select('*')
      .eq('member_id', memberId)
      .eq('course_id', courseId);

    const { data: lessons } = await this.supabase
      .from('course_lessons')
      .select('id, module_id')
      .eq('module.course_id', courseId);

    const completedLessons = progress?.filter(p => p.status === 'completed').length || 0;
    const totalLessons = lessons?.length || 0;

    return {
      overallProgress: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      completedLessons,
      totalLessons,
      totalTimeSpent: progress?.reduce((sum, p) => sum + (p.time_spent_minutes || 0), 0) || 0,
      lessonProgress: progress || [],
      isCompleted: completedLessons === totalLessons && totalLessons > 0
    };
  }

  async updateLessonProgress(
    memberId: string,
    lessonId: string,
    updates: Partial<LessonProgress>
  ): Promise<void> {
    // Get lesson to find course
    const { data: lesson } = await this.supabase
      .from('course_lessons')
      .select('module:course_modules(course_id)')
      .eq('id', lessonId)
      .single();

    const courseId = lesson?.module?.course_id;

    await this.supabase
      .from('course_progress')
      .upsert({
        member_id: memberId,
        course_id: courseId,
        lesson_id: lessonId,
        ...updates,
        updated_at: new Date()
      });

    // Check if course is now complete
    const progress = await this.getProgress(memberId, courseId);
    if (progress.isCompleted) {
      await this.issueCertificate(memberId, courseId);
    }
  }

  async markLessonComplete(memberId: string, lessonId: string): Promise<void> {
    await this.updateLessonProgress(memberId, lessonId, {
      status: 'completed',
      completed_at: new Date(),
      progress_percent: 100
    });
  }

  async saveVideoPosition(
    memberId: string,
    lessonId: string,
    timeSeconds: number
  ): Promise<void> {
    await this.updateLessonProgress(memberId, lessonId, {
      last_position: { time: timeSeconds },
      status: 'in_progress'
    });
  }

  private async issueCertificate(
    memberId: string,
    courseId: string
  ): Promise<void> {
    const { CertificateGenerator } = await import('./certificate-generator');
    const generator = new CertificateGenerator();
    await generator.generateCertificate(memberId, courseId);
  }
}
```

### Quiz Service

```typescript
// lib/services/quiz-service.ts
export class QuizService {
  private supabase = createClient();

  async startQuizAttempt(
    memberId: string,
    quizId: string
  ): Promise<QuizAttempt> {
    const { data: quiz } = await this.supabase
      .from('course_quizzes')
      .select('*, questions:quiz_questions(*)')
      .eq('id', quizId)
      .single();

    // Check max attempts
    const { count } = await this.supabase
      .from('quiz_attempts')
      .select('id', { count: 'exact' })
      .eq('member_id', memberId)
      .eq('quiz_id', quizId);

    if (quiz.max_attempts && count >= quiz.max_attempts) {
      throw new Error('Maximum attempts reached');
    }

    // Create attempt
    const { data: attempt } = await this.supabase
      .from('quiz_attempts')
      .insert({
        member_id: memberId,
        quiz_id: quizId,
        started_at: new Date()
      })
      .select()
      .single();

    // Shuffle questions if configured
    let questions = quiz.questions;
    if (quiz.shuffle_questions) {
      questions = this.shuffleArray(questions);
    }

    return {
      attemptId: attempt.id,
      quiz: quiz,
      questions: questions.map(q => ({
        id: q.id,
        type: q.question_type,
        text: q.question_text,
        options: q.options?.map(o => ({ id: o.id, text: o.text })) // Hide isCorrect
      })),
      timeLimit: quiz.time_limit_minutes
    };
  }

  async submitQuizAttempt(
    attemptId: string,
    answers: Record<string, any>
  ): Promise<QuizResult> {
    const { data: attempt } = await this.supabase
      .from('quiz_attempts')
      .select('*, quiz:course_quizzes(*, questions:quiz_questions(*))')
      .eq('id', attemptId)
      .single();

    // Score the quiz
    let earnedPoints = 0;
    let totalPoints = 0;
    const results: QuestionResult[] = [];

    for (const question of attempt.quiz.questions) {
      totalPoints += question.points;
      const memberAnswer = answers[question.id];
      let isCorrect = false;

      if (question.question_type === 'multiple_choice') {
        const correctOption = question.options.find(o => o.isCorrect);
        isCorrect = memberAnswer === correctOption?.id;
      } else if (question.question_type === 'true_false') {
        isCorrect = memberAnswer === question.correct_answer;
      }

      if (isCorrect) {
        earnedPoints += question.points;
      }

      results.push({
        questionId: question.id,
        memberAnswer,
        isCorrect,
        correctAnswer: attempt.quiz.show_correct_answers ? question.correct_answer : undefined,
        explanation: attempt.quiz.show_correct_answers ? question.explanation : undefined
      });
    }

    const score = Math.round((earnedPoints / totalPoints) * 100);
    const passed = score >= attempt.quiz.passing_score;

    // Update attempt
    await this.supabase
      .from('quiz_attempts')
      .update({
        score,
        passed,
        answers,
        completed_at: new Date(),
        time_spent_seconds: Math.floor(
          (Date.now() - new Date(attempt.started_at).getTime()) / 1000
        )
      })
      .eq('id', attemptId);

    return { score, passed, results, passingScore: attempt.quiz.passing_score };
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}
```

### Certificate Generator

```typescript
// lib/services/certificate-generator.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export class CertificateGenerator {
  private supabase = createClient();

  async generateCertificate(memberId: string, courseId: string): Promise<string> {
    // Get member and course details
    const [{ data: member }, { data: course }] = await Promise.all([
      this.supabase.from('members').select('*').eq('id', memberId).single(),
      this.supabase.from('courses').select('*, organization:organizations(*)').eq('id', courseId).single()
    ]);

    // Generate certificate number
    const certificateNumber = this.generateCertificateNumber();

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([792, 612]); // Landscape letter

    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const { width, height } = page.getSize();

    // Title
    page.drawText('Certificate of Completion', {
      x: width / 2 - 150,
      y: height - 100,
      size: 32,
      font: helveticaBold,
      color: rgb(0.1, 0.1, 0.4)
    });

    // Recipient
    page.drawText('This certifies that', {
      x: width / 2 - 60,
      y: height - 200,
      size: 14,
      font: helvetica
    });

    page.drawText(`${member.first_name} ${member.last_name}`, {
      x: width / 2 - 100,
      y: height - 240,
      size: 28,
      font: helveticaBold
    });

    // Course
    page.drawText('has successfully completed', {
      x: width / 2 - 80,
      y: height - 300,
      size: 14,
      font: helvetica
    });

    page.drawText(course.title, {
      x: width / 2 - 150,
      y: height - 340,
      size: 24,
      font: helveticaBold
    });

    // Date
    page.drawText(`Date: ${new Date().toLocaleDateString()}`, {
      x: width / 2 - 50,
      y: 100,
      size: 12,
      font: helvetica
    });

    // Certificate number
    page.drawText(`Certificate ID: ${certificateNumber}`, {
      x: width / 2 - 80,
      y: 60,
      size: 10,
      font: helvetica
    });

    // Save PDF
    const pdfBytes = await pdfDoc.save();

    // Upload to storage
    const { data: upload } = await this.supabase.storage
      .from('certificates')
      .upload(`${memberId}/${certificateNumber}.pdf`, pdfBytes, {
        contentType: 'application/pdf'
      });

    const pdfUrl = this.supabase.storage
      .from('certificates')
      .getPublicUrl(upload.path).data.publicUrl;

    // Save certificate record
    await this.supabase.from('certificates').insert({
      member_id: memberId,
      course_id: courseId,
      certificate_number: certificateNumber,
      pdf_url: pdfUrl
    });

    // Send email with certificate
    await this.sendCertificateEmail(member.email, member.first_name, course.title, pdfUrl);

    return pdfUrl;
  }

  private generateCertificateNumber(): string {
    const prefix = 'CERT';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }
}
```

---

## Dependencies

### Upstream
- **Epic-01:** Base database infrastructure

### Downstream
- None (standalone feature module)

---

## Risk Assessment

| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Video hosting costs | Medium | Medium | Use external CDN |
| Quiz cheating | Low | Low | Time limits, shuffle |
| Large file uploads | Medium | Medium | Size limits, chunking |
| Certificate fraud | Low | High | Verification endpoint |

---

## Testing Plan

### Unit Tests
- [ ] Progress calculation accuracy
- [ ] Quiz scoring logic
- [ ] Certificate number uniqueness

### Integration Tests
- [ ] Course enrollment flow
- [ ] Progress tracking persistence
- [ ] Quiz attempt lifecycle

### E2E Tests
- [ ] Complete course journey
- [ ] Certificate download
- [ ] Video playback and resume

---

## Definition of Done

- [ ] Course content delivery working
- [ ] Progress tracking implemented
- [ ] Quiz system functional
- [ ] Certificates generated on completion
- [ ] Enrollment flow complete
- [ ] All tests passing
- [ ] Documentation complete

---

## Metadata

| Field | Value |
|-------|-------|
| **Sprint:** | Sprint 3-4 |
| **Team:** | Backend, Frontend |
| **Owner:** | Product Lead |
| **Target Release:** | v1.6.0 |
| **Created:** | 2025-12-07 |
