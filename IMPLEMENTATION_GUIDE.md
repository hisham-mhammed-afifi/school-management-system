# Implementation Guide -- School Management SaaS

> **Purpose:** Everything Claude Code needs beyond the ERD, API Design, and Business Analysis to build this system without guessing.
> **Read this file AFTER reading CLAUDE.md, ERD, and API Design.**

---

## 1. Phased Build Order

Build in this exact order. Each phase depends only on phases before it. Do not start a phase until the previous one compiles, passes tests, and has working endpoints verified via a quick manual curl or integration test.

### Phase 0: Infrastructure (no business logic)

1. Initialize project: `npm init`, install dependencies, configure tsconfig, eslint, prettier.
2. Set up Prisma with the full schema from the ERD. Run `prisma validate` and `prisma migrate dev`.
3. Build shared infrastructure: AppError, error handler, logger, password utils, env config, database singleton.
4. Build Express server factory with health check, 404 handler, error handler.
5. Build auth middleware (JWT verification, tenant extraction).
6. Build `container.ts` skeleton (empty, will grow per phase).
7. Write `docker-compose.yml` (see Section 8).
8. Verify: `npm run dev` starts, `GET /health` returns 200, `npm test` passes (even if no tests yet).

**Commit:** `chore: project infrastructure and scaffolding`

### Phase 1: Foundation (Domains 1-2)

1. **Schools** module (super admin CRUD, school profile endpoints).
2. **Auth** module (login, refresh, logout, forgot/reset password, me).
3. **Users** module (CRUD, role assignment).
4. **Roles** module (CRUD, permission assignment).
5. **Permissions** seed (run the seed script from Section 3).
6. Write integration tests: login flow, RBAC enforcement (forbidden without permission, allowed with).

**Commit per module.** After this phase, you can authenticate and authorize.

### Phase 2: Academic Structure (Domain 3)

1. **Academic Years** module (CRUD + activate action).
2. **Terms** module (nested under academic years).
3. **Departments** module (CRUD).
4. **Grades** module (CRUD).
5. **Subjects** module (CRUD + grade associations).
6. **Class Sections** module (CRUD + student list, timetable placeholder).
7. **Class Subject Requirements** module (GET/PUT per section).

**Commit per module.** After this phase, a school admin can fully configure an academic year.

### Phase 3: People (Domains 4-5)

1. **Students** module (CRUD + soft delete + guardians sub-routes + enrollments sub-routes).
2. **Guardians** module (CRUD + soft delete).
3. **Student-Guardian Links** module (link/unlink/update).
4. **Student Enrollments** module (CRUD + bulk promote).
5. **Teachers** module (CRUD + soft delete + subject assignments).

**Commit per module.** After this phase, students and teachers exist and are enrolled/assigned.

### Phase 4: Time & Space (Domains 6-7)

1. **Period Sets** module (CRUD).
2. **Working Days** module (PUT per period set).
3. **Periods** module (PUT per period set).
4. **Time Slots** module (GET + auto-generate).
5. **Rooms** module (CRUD + subject suitability).

**Commit per module.** After this phase, the scheduling foundation exists.

### Phase 5: Scheduling (Domain 8)

1. **Lessons** module (CRUD + cancel + bulk-create + conflict validation).
2. **Auto-generate** endpoint (the scheduling algorithm, see Section 5.1).
3. **Timetable views** (read-only grid endpoints for class/teacher/room).
4. **Substitutions** module (CRUD + conflict validation).

**Commit per module.** After this phase, a full timetable can be generated and viewed.

### Phase 6: Daily Operations (Domains 9-10)

1. **Teacher Availability** module (GET/PUT per teacher).
2. **Teacher Leaves** module (CRUD + approve/reject/cancel workflow).
3. **Student Attendance** module (bulk record, list, summary, correct).
4. **Teacher Attendance** module (record, list, correct).

**Commit per module.**

### Phase 7: Assessment (Domain 11)

1. **Grading Scales** module (CRUD with nested levels).
2. **Exams** module (CRUD).
3. **Exam Subjects** module (CRUD nested under exams).
4. **Student Grades** module (bulk entry, auto grade-letter computation).
5. **Report Cards** module (generate snapshots, list, view, update remarks).

**Commit per module.** After this phase, exams can be graded and report cards generated.

### Phase 8: Finance (Domain 12)

1. **Fee Categories** module (CRUD).
2. **Fee Structures** module (CRUD).
3. **Fee Discounts** module (CRUD).
4. **Fee Invoices** module (CRUD + issue + cancel + bulk-generate + auto-discount application).
5. **Fee Payments** module (create + auto-status update on invoice).
6. **Financial Reports** module (outstanding, collection, balances, category breakdown).

**Commit per module.**

### Phase 9: Communication & Calendar (Domains 13-14)

1. **Announcements** module (CRUD + publish + targets).
2. **Notifications** module (list own, mark read, send).
3. **Academic Events** module (CRUD).

**Commit per module.**

### Phase 10: Audit & Self-Service (Domain 15 + cross-cutting)

1. **Audit Logs** module (read-only list + detail).
2. **Audit middleware** (intercept writes on critical tables, write to audit_logs).
3. **Self-service routes** (`/my/*` for teacher, student, guardian).
4. **Dashboard endpoints** (admin + super admin).

**Commit per module.**

### Phase 11: Hardening

1. Rate limiting on auth endpoints.
2. Request ID middleware.
3. Subscription tier feature gating middleware (see Section 6).
4. Swagger/OpenAPI generation.
5. Docker production build.
6. Full integration test suite.

---

## 2. Permissions Seed List

Every permission in the system. The `name` field is `module.action` concatenated.

| # | Module | Action | Name (unique key) |
|---|---|---|---|
| 1 | platform | manage | platform.manage |
| 2 | school | view | school.view |
| 3 | school | update | school.update |
| 4 | dashboard | view | dashboard.view |
| 5 | users | view | users.view |
| 6 | users | create | users.create |
| 7 | users | update | users.update |
| 8 | users | delete | users.delete |
| 9 | users | manage_roles | users.manage_roles |
| 10 | roles | view | roles.view |
| 11 | roles | create | roles.create |
| 12 | roles | update | roles.update |
| 13 | roles | delete | roles.delete |
| 14 | roles | manage_permissions | roles.manage_permissions |
| 15 | academic_years | view | academic_years.view |
| 16 | academic_years | create | academic_years.create |
| 17 | academic_years | update | academic_years.update |
| 18 | academic_years | delete | academic_years.delete |
| 19 | academic_years | activate | academic_years.activate |
| 20 | terms | view | terms.view |
| 21 | terms | create | terms.create |
| 22 | terms | update | terms.update |
| 23 | terms | delete | terms.delete |
| 24 | departments | view | departments.view |
| 25 | departments | create | departments.create |
| 26 | departments | update | departments.update |
| 27 | departments | delete | departments.delete |
| 28 | grades | view | grades.view |
| 29 | grades | create | grades.create |
| 30 | grades | update | grades.update |
| 31 | grades | delete | grades.delete |
| 32 | class_sections | view | class_sections.view |
| 33 | class_sections | create | class_sections.create |
| 34 | class_sections | update | class_sections.update |
| 35 | class_sections | delete | class_sections.delete |
| 36 | subjects | view | subjects.view |
| 37 | subjects | create | subjects.create |
| 38 | subjects | update | subjects.update |
| 39 | subjects | delete | subjects.delete |
| 40 | subjects | manage | subjects.manage |
| 41 | requirements | view | requirements.view |
| 42 | requirements | manage | requirements.manage |
| 43 | students | view | students.view |
| 44 | students | create | students.create |
| 45 | students | update | students.update |
| 46 | students | delete | students.delete |
| 47 | students | manage | students.manage |
| 48 | guardians | view | guardians.view |
| 49 | guardians | create | guardians.create |
| 50 | guardians | update | guardians.update |
| 51 | guardians | delete | guardians.delete |
| 52 | enrollments | view | enrollments.view |
| 53 | enrollments | create | enrollments.create |
| 54 | enrollments | update | enrollments.update |
| 55 | enrollments | promote | enrollments.promote |
| 56 | teachers | view | teachers.view |
| 57 | teachers | create | teachers.create |
| 58 | teachers | update | teachers.update |
| 59 | teachers | delete | teachers.delete |
| 60 | teachers | manage | teachers.manage |
| 61 | scheduling | view | scheduling.view |
| 62 | scheduling | manage | scheduling.manage |
| 63 | rooms | view | rooms.view |
| 64 | rooms | create | rooms.create |
| 65 | rooms | update | rooms.update |
| 66 | rooms | delete | rooms.delete |
| 67 | rooms | manage | rooms.manage |
| 68 | lessons | view | lessons.view |
| 69 | lessons | create | lessons.create |
| 70 | lessons | update | lessons.update |
| 71 | lessons | delete | lessons.delete |
| 72 | lessons | cancel | lessons.cancel |
| 73 | lessons | generate | lessons.generate |
| 74 | substitutions | view | substitutions.view |
| 75 | substitutions | create | substitutions.create |
| 76 | substitutions | update | substitutions.update |
| 77 | substitutions | delete | substitutions.delete |
| 78 | availability | view | availability.view |
| 79 | availability | manage | availability.manage |
| 80 | leaves | view | leaves.view |
| 81 | leaves | request | leaves.request |
| 82 | leaves | approve | leaves.approve |
| 83 | attendance | view | attendance.view |
| 84 | attendance | record | attendance.record |
| 85 | attendance | update | attendance.update |
| 86 | grading | view | grading.view |
| 87 | grading | manage | grading.manage |
| 88 | exams | view | exams.view |
| 89 | exams | create | exams.create |
| 90 | exams | update | exams.update |
| 91 | exams | delete | exams.delete |
| 92 | exams | manage | exams.manage |
| 93 | grades_entry | view | grades_entry.view |
| 94 | grades_entry | record | grades_entry.record |
| 95 | grades_entry | update | grades_entry.update |
| 96 | grades_entry | publish | grades_entry.publish |
| 97 | fees | view | fees.view |
| 98 | fees | manage | fees.manage |
| 99 | fees | create_invoice | fees.create_invoice |
| 100 | fees | update_invoice | fees.update_invoice |
| 101 | fees | issue_invoice | fees.issue_invoice |
| 102 | fees | cancel_invoice | fees.cancel_invoice |
| 103 | fees | collect | fees.collect |
| 104 | fees | report | fees.report |
| 105 | announcements | view | announcements.view |
| 106 | announcements | create | announcements.create |
| 107 | announcements | update | announcements.update |
| 108 | announcements | delete | announcements.delete |
| 109 | announcements | publish | announcements.publish |
| 110 | notifications | send | notifications.send |
| 111 | events | view | events.view |
| 112 | events | create | events.create |
| 113 | events | update | events.update |
| 114 | events | delete | events.delete |
| 115 | audit | view | audit.view |

**Total: 115 permissions.**

---

## 3. Role-Permission Matrix

Rows = permissions (grouped by module). Columns = seed roles. `x` = granted.

Self-service permissions (teacher viewing own timetable, student viewing own grades, guardian viewing own children) are NOT enforced through this matrix. Those are handled by the `/my/*` route layer which checks the user's linked entity (teacherId, studentId, guardianId) directly.

**Legend:**
- **SA** = super_admin
- **AD** = school_admin
- **PR** = principal
- **TC** = teacher
- **ST** = student
- **GU** = guardian
- **AC** = accountant

| Permission | SA | AD | PR | TC | ST | GU | AC |
|---|---|---|---|---|---|---|---|
| **Platform** |||||||
| platform.manage | x | | | | | | |
| **School** |||||||
| school.view | x | x | x | | | | |
| school.update | x | x | | | | | |
| dashboard.view | x | x | x | | | | |
| **Users & Roles** |||||||
| users.view | x | x | x | | | | |
| users.create | x | x | | | | | |
| users.update | x | x | | | | | |
| users.delete | x | x | | | | | |
| users.manage_roles | x | x | | | | | |
| roles.view | x | x | x | | | | |
| roles.create | x | x | | | | | |
| roles.update | x | x | | | | | |
| roles.delete | x | x | | | | | |
| roles.manage_permissions | x | x | | | | | |
| **Academic Structure** |||||||
| academic_years.view | x | x | x | x | | | |
| academic_years.create | x | x | | | | | |
| academic_years.update | x | x | | | | | |
| academic_years.delete | x | x | | | | | |
| academic_years.activate | x | x | | | | | |
| terms.view | x | x | x | x | | | |
| terms.create | x | x | | | | | |
| terms.update | x | x | | | | | |
| terms.delete | x | x | | | | | |
| departments.view | x | x | x | x | | | |
| departments.create | x | x | | | | | |
| departments.update | x | x | x | | | | |
| departments.delete | x | x | | | | | |
| grades.view | x | x | x | x | x | x | |
| grades.create | x | x | | | | | |
| grades.update | x | x | | | | | |
| grades.delete | x | x | | | | | |
| class_sections.view | x | x | x | x | | | |
| class_sections.create | x | x | | | | | |
| class_sections.update | x | x | x | | | | |
| class_sections.delete | x | x | | | | | |
| subjects.view | x | x | x | x | x | x | |
| subjects.create | x | x | | | | | |
| subjects.update | x | x | | | | | |
| subjects.delete | x | x | | | | | |
| subjects.manage | x | x | | | | | |
| requirements.view | x | x | x | x | | | |
| requirements.manage | x | x | | | | | |
| **Students** |||||||
| students.view | x | x | x | x | | | |
| students.create | x | x | | | | | |
| students.update | x | x | x | | | | |
| students.delete | x | x | | | | | |
| students.manage | x | x | | | | | |
| guardians.view | x | x | x | x | | | |
| guardians.create | x | x | | | | | |
| guardians.update | x | x | x | | | | |
| guardians.delete | x | x | | | | | |
| enrollments.view | x | x | x | x | | | |
| enrollments.create | x | x | | | | | |
| enrollments.update | x | x | x | | | | |
| enrollments.promote | x | x | | | | | |
| **Teachers** |||||||
| teachers.view | x | x | x | x | | | |
| teachers.create | x | x | | | | | |
| teachers.update | x | x | x | | | | |
| teachers.delete | x | x | | | | | |
| teachers.manage | x | x | x | | | | |
| **Scheduling** |||||||
| scheduling.view | x | x | x | x | | | |
| scheduling.manage | x | x | | | | | |
| rooms.view | x | x | x | x | | | |
| rooms.create | x | x | | | | | |
| rooms.update | x | x | | | | | |
| rooms.delete | x | x | | | | | |
| rooms.manage | x | x | | | | | |
| lessons.view | x | x | x | x | x | x | |
| lessons.create | x | x | | | | | |
| lessons.update | x | x | | | | | |
| lessons.delete | x | x | | | | | |
| lessons.cancel | x | x | x | | | | |
| lessons.generate | x | x | | | | | |
| substitutions.view | x | x | x | x | | | |
| substitutions.create | x | x | x | | | | |
| substitutions.update | x | x | x | | | | |
| substitutions.delete | x | x | x | | | | |
| **Availability & Leaves** |||||||
| availability.view | x | x | x | x | | | |
| availability.manage | x | x | x | | | | |
| leaves.view | x | x | x | x | | | |
| leaves.request | x | x | x | x | | | |
| leaves.approve | x | x | x | | | | |
| **Attendance** |||||||
| attendance.view | x | x | x | x | | | |
| attendance.record | x | x | x | x | | | |
| attendance.update | x | x | x | x | | | |
| **Exams & Grading** |||||||
| grading.view | x | x | x | x | | | |
| grading.manage | x | x | | | | | |
| exams.view | x | x | x | x | x | x | |
| exams.create | x | x | x | | | | |
| exams.update | x | x | x | | | | |
| exams.delete | x | x | x | | | | |
| exams.manage | x | x | x | | | | |
| grades_entry.view | x | x | x | x | x | x | |
| grades_entry.record | x | x | x | x | | | |
| grades_entry.update | x | x | x | x | | | |
| grades_entry.publish | x | x | x | | | | |
| **Fees & Billing** |||||||
| fees.view | x | x | x | | x | x | x |
| fees.manage | x | x | | | | | x |
| fees.create_invoice | x | x | | | | | x |
| fees.update_invoice | x | x | | | | | x |
| fees.issue_invoice | x | x | | | | | x |
| fees.cancel_invoice | x | x | | | | | x |
| fees.collect | x | x | | | | | x |
| fees.report | x | x | x | | | | x |
| **Communication** |||||||
| announcements.view | x | x | x | x | x | x | |
| announcements.create | x | x | x | | | | |
| announcements.update | x | x | x | | | | |
| announcements.delete | x | x | x | | | | |
| announcements.publish | x | x | x | | | | |
| notifications.send | x | x | x | | | | |
| **Calendar** |||||||
| events.view | x | x | x | x | x | x | |
| events.create | x | x | x | | | | |
| events.update | x | x | x | | | | |
| events.delete | x | x | x | | | | |
| **Audit** |||||||
| audit.view | x | x | x | | | | |

**Notes:**
- `super_admin` has ALL permissions including `platform.manage`.
- `school_admin` has ALL school-level permissions.
- `principal` has all view permissions plus management of teachers, scheduling, attendance, exams, announcements, and events.
- `teacher` has view permissions for academic structure, plus can record attendance, enter grades, request leaves, and view own class data.
- `student` and `guardian` have read-only access to grades, fees, announcements, events, and lessons. Their detailed data access is through `/my/*` self-service endpoints, not through these permissions.
- `accountant` is focused on the fees module with full billing lifecycle permissions plus reporting.

---

## 4. State Machine Definitions

Each entity with a status field has explicit transitions. Any transition not listed here is FORBIDDEN and must return `400 BAD_REQUEST` with code `INVALID_STATUS_TRANSITION`.

### 4.1 School Status

```
  active -----> suspended      (trigger: admin suspends or subscription expires)
  active -----> archived       (trigger: admin archives)
  suspended --> active         (trigger: admin reactivates and subscription renewed)
  suspended --> archived       (trigger: admin archives)
  archived ---> (terminal)     (no transitions out)
```

### 4.2 Student Status

```
  active -------> withdrawn     (trigger: admin marks withdrawal, set withdrawn_at)
  active -------> suspended     (trigger: admin suspends for disciplinary)
  active -------> transferred   (trigger: admin marks transfer)
  active -------> graduated     (trigger: admin marks graduation at year end)
  suspended ----> active        (trigger: admin lifts suspension)
  suspended ----> withdrawn     (trigger: admin marks withdrawal)
  withdrawn ----> (terminal)
  transferred --> (terminal)
  graduated ----> (terminal)
```

### 4.3 Teacher Status

```
  active ------> on_leave       (trigger: leave approved covering current date)
  active ------> resigned       (trigger: admin marks resignation)
  active ------> terminated     (trigger: admin terminates)
  on_leave ----> active         (trigger: leave period ends or leave cancelled)
  on_leave ----> resigned       (trigger: admin marks resignation while on leave)
  resigned ----> (terminal)
  terminated --> (terminal)
```

### 4.4 Student Enrollment Status

```
  active -------> withdrawn     (trigger: admin withdraws, set withdrawn_at)
  active -------> transferred   (trigger: admin transfers to another school)
  active -------> promoted      (trigger: bulk promote at year end)
  withdrawn ----> (terminal)
  transferred --> (terminal)
  promoted -----> (terminal)
```

### 4.5 Teacher Leave Status

```
  pending ------> approved      (trigger: principal/admin approves, set approved_by + approved_at)
  pending ------> rejected      (trigger: principal/admin rejects, set approved_by + approved_at)
  pending ------> cancelled     (trigger: teacher cancels own request)
  approved -----> cancelled     (trigger: teacher/admin cancels before leave starts)
  rejected -----> (terminal)
  cancelled ----> (terminal)
```

**Business rule:** An approved leave can only be cancelled if `dateFrom` is in the future. Once the leave has started, it cannot be cancelled (admin must adjust dates instead).

### 4.6 Lesson Status

```
  scheduled ----> cancelled     (trigger: admin cancels, frees slot for reuse)
  scheduled ----> moved         (trigger: admin changes time_slot, old record marked moved, new record created as scheduled)
  cancelled ----> (terminal)
  moved --------> (terminal)
```

**Business rule:** Cancelling a lesson removes the partial unique index block, allowing the teacher/class/room slot to be reassigned.

### 4.7 Fee Invoice Status

```
  draft ----------> issued          (trigger: admin issues invoice, set issued_at)
  draft ----------> cancelled       (trigger: admin cancels draft)
  issued ---------> partially_paid  (trigger: payment recorded, total payments < net_amount)
  issued ---------> paid            (trigger: payment recorded, total payments >= net_amount)
  issued ---------> overdue         (trigger: cron job, due_date passed and not fully paid)
  issued ---------> cancelled       (trigger: admin cancels issued invoice, only if no payments)
  partially_paid -> paid            (trigger: payment recorded, total payments >= net_amount)
  partially_paid -> overdue         (trigger: cron job, due_date passed and not fully paid)
  overdue --------> partially_paid  (trigger: payment recorded after overdue, still not fully paid)
  overdue --------> paid            (trigger: payment recorded, total payments >= net_amount)
  paid -----------> (terminal)
  cancelled ------> (terminal)
```

**Business rules:**
- Only `draft` invoices can be edited (items, amounts).
- `issued` invoices can only be cancelled if zero payments have been recorded against them.
- The `overdue` transition is triggered by a scheduled cron job, not by an API call. The cron runs daily and checks: `WHERE status IN ('issued', 'partially_paid') AND due_date < CURRENT_DATE`.

### 4.8 Announcement Lifecycle

```
  is_draft=true  ----> is_draft=false  (trigger: publish action, set published_at)
  is_draft=false ----> (no unpublish)
```

Only draft announcements can be edited or deleted. Published announcements are immutable.

---

## 5. Business Logic Algorithms

### 5.1 Grade Letter Computation

When a teacher enters a score for a student, the system auto-computes the grade letter using the exam's grading scale.

```
INPUT:
  score: number (the student's raw score)
  examSubjectId: UUID

PROCESS:
  1. Load exam_subject -> exam -> grading_scale -> grading_scale_levels (ordered by order_index ASC)
  2. Normalize: percentage = (score / exam_subject.max_score) * 100
  3. Find matching level: iterate levels, find first where min_score <= percentage <= max_score
  4. If match found: grade_letter = level.letter, gpa_points = level.gpa_points
  5. If no match: grade_letter = null (log warning, data integrity issue in scale)

OUTPUT:
  grade_letter: string
  gpa_points: number | null
```

### 5.2 Report Card Snapshot Generation

```
INPUT:
  termId: UUID
  classSectionId: UUID

PROCESS:
  1. Load all active enrollments for this class_section in this term's academic year.
  2. Load all exams in this term with their weights.
  3. For each enrolled student:
     a. For each subject assigned to the student's grade (via subject_grades):
        i.   Collect all student_grades for this student + each exam_subject in this term
        ii.  Compute weighted average:
             weighted_sum = SUM(score / exam_subject.max_score * 100 * exam.weight)
             total_weight = SUM(exam.weight) across exams that have a grade for this student+subject
             final_score = weighted_sum / total_weight
        iii. Look up grade_letter for final_score using the term's primary grading scale
     b. Compute overall_percentage = AVG(final_score) across all subjects
     c. Compute overall_gpa = AVG(gpa_points) across all subjects (where gpa_points is not null)
  4. Rank students within class by overall_percentage DESC.
  5. Build snapshot_data JSON:
     {
       "subjects": [
         {
           "subjectName": "Mathematics",
           "subjectId": "uuid",
           "exams": [
             { "examName": "Midterm", "score": 85, "maxScore": 100, "weight": 40, "percentage": 85 }
           ],
           "finalScore": 87.5,
           "gradeLetter": "A",
           "gpaPoints": 3.75
         }
       ]
     }
  6. INSERT report_card_snapshot for each student with snapshot_data, overall_gpa, overall_percentage, rank_in_class.

OUTPUT:
  count of snapshots generated
  list of students with missing grades (incomplete data, flagged for review)
```

### 5.3 Invoice Total Computation

```
INPUT:
  items: array of { feeStructureId, quantity, unitAmount }
  studentId: UUID

PROCESS:
  1. total_amount = SUM(item.quantity * item.unitAmount) for all items
  2. Load applicable fee_discounts for this student where fee_structure_id IN (item fee_structure_ids)
  3. For each discount:
     - If discount_type = 'percentage': discount_value = item_total * (discount.amount / 100)
     - If discount_type = 'fixed': discount_value = discount.amount
     - Cap: discount_value cannot exceed the item's total
  4. discount_amount = SUM(all discount_values)
  5. net_amount = total_amount - discount_amount
  6. Validate: net_amount >= 0 (if not, reject with DISCOUNT_EXCEEDS_TOTAL)
  7. Generate invoice_number: "{school_code}-INV-{YYYYMM}-{sequence}"

OUTPUT:
  { totalAmount, discountAmount, netAmount, invoiceNumber }
```

### 5.4 Invoice Status Auto-Update on Payment

```
INPUT:
  invoiceId: UUID
  newPaymentAmount: number

PROCESS:
  1. Load invoice (must be in status: issued, partially_paid, or overdue)
  2. Load all existing payments for this invoice
  3. total_paid = SUM(existing payments) + newPaymentAmount
  4. If total_paid >= invoice.net_amount:
       new_status = 'paid'
     Else if total_paid > 0:
       new_status = 'partially_paid'
     Else:
       new_status unchanged
  5. Validate: total_paid must not exceed net_amount * 1.001 (allow tiny floating point tolerance)
     If exceeded: reject with OVERPAYMENT error
  6. Update invoice.status = new_status

OUTPUT:
  updated invoice with new status
```

### 5.5 Lesson Conflict Validation

```
INPUT:
  teacherId, classSectionId, roomId, timeSlotId, termId
  excludeLessonId: UUID | null (for update operations, exclude self)

PROCESS:
  1. Check teacher conflict:
     SELECT id FROM lessons
     WHERE school_id = :schoolId AND teacher_id = :teacherId AND time_slot_id = :timeSlotId
       AND term_id = :termId AND status != 'cancelled'
       AND (:excludeLessonId IS NULL OR id != :excludeLessonId)
     If found: return error SCHEDULE_CONFLICT_TEACHER

  2. Check class conflict:
     SELECT id FROM lessons
     WHERE school_id = :schoolId AND class_section_id = :classSectionId AND time_slot_id = :timeSlotId
       AND term_id = :termId AND status != 'cancelled'
       AND (:excludeLessonId IS NULL OR id != :excludeLessonId)
     If found: return error SCHEDULE_CONFLICT_CLASS

  3. Check room conflict:
     SELECT id FROM lessons
     WHERE school_id = :schoolId AND room_id = :roomId AND time_slot_id = :timeSlotId
       AND term_id = :termId AND status != 'cancelled'
       AND (:excludeLessonId IS NULL OR id != :excludeLessonId)
     If found: return error SCHEDULE_CONFLICT_ROOM

  4. Check teacher qualification:
     SELECT id FROM teacher_subjects
     WHERE teacher_id = :teacherId AND subject_id = :subjectId
     If not found: return error TEACHER_NOT_QUALIFIED

  5. Check room suitability:
     SELECT COUNT(*) FROM room_subject_suitability WHERE room_id = :roomId
     If count > 0:
       SELECT id FROM room_subject_suitability
       WHERE room_id = :roomId AND subject_id = :subjectId
       If not found: return error ROOM_NOT_SUITABLE

  6. Check teacher availability:
     Load time_slot -> get day_of_week and period_id
     SELECT id FROM teacher_availability
     WHERE teacher_id = :teacherId AND day_of_week = :dayOfWeek AND period_id = :periodId AND is_available = false
     If found: return error TEACHER_NOT_AVAILABLE

OUTPUT:
  void (all checks passed) or specific conflict error
```

### 5.6 Substitution Conflict Validation

```
INPUT:
  lessonId, substituteTeacherId, date

PROCESS:
  1. Load lesson -> get time_slot_id, subject_id, original teacher_id
  2. Validate: substituteTeacherId != lesson.teacher_id (SUBSTITUTE_IS_ORIGINAL_TEACHER)
  3. Check substitute is qualified for the subject (same as 5.5 step 4)
  4. Load time_slot -> get day_of_week, period_id
  5. Check substitute has no lesson at same time_slot in same term:
     SELECT id FROM lessons
     WHERE teacher_id = :substituteTeacherId AND time_slot_id = :timeSlotId
       AND term_id = :termId AND status != 'cancelled'
     If found: check if there's already a substitution covering THAT lesson on THAT date
       (the substitute might already be covered themselves). If no cover: SUBSTITUTE_HAS_CONFLICT
  6. Check substitute has no other substitution at same time_slot on same date:
     SELECT s.id FROM substitutions s
     JOIN lessons l ON s.lesson_id = l.id
     WHERE s.substitute_teacher_id = :substituteTeacherId AND s.date = :date
       AND l.time_slot_id = :timeSlotId
     If found: SUBSTITUTE_ALREADY_ASSIGNED

OUTPUT:
  void or conflict error
```

### 5.7 Auto-Scheduling Algorithm (Simplified)

This is a constraint satisfaction problem. A full production algorithm is complex, but here is the approach Claude Code should implement as a first pass:

```
INPUT:
  termId, periodSetId, options

PROCESS:
  1. Load all inputs:
     - requirements: all class_subject_requirements for the term's academic year
     - teachers: all active teachers with their subject qualifications
     - availability: teacher_availability records
     - rooms: all rooms with subject suitability
     - timeSlots: all time slots from the period set (non-break only)
     - existingLessons: any already-scheduled lessons for this term (to preserve manual placements)

  2. Build constraint maps:
     - teacherSlotUsed[teacherId][timeSlotId] = boolean
     - classSlotUsed[classSectionId][timeSlotId] = boolean
     - roomSlotUsed[roomId][timeSlotId] = boolean
     (Pre-populate from existingLessons)

  3. Sort requirements by constraint tightness (most constrained first):
     - Count eligible teachers per requirement (teachers qualified for the subject)
     - Count eligible rooms per requirement (rooms suitable for the subject)
     - Requirements with fewer options go first (fail-fast)

  4. For each requirement (class_section + subject + weekly count):
     a. Find eligible teachers: qualified for subject AND not deleted
     b. For each needed lesson (1..weekly_lessons_required):
        i.   Iterate time slots (shuffled for variety)
        ii.  For each slot, try each eligible teacher:
             - Skip if teacher not available on this day/period
             - Skip if teacherSlotUsed[teacher][slot]
             - Skip if classSlotUsed[class][slot]
             - Check consecutive lesson limit for teacher (options.maxConsecutive)
        iii. For the first valid teacher+slot, find a room:
             - Prefer rooms with subject suitability match
             - Fall back to general classrooms
             - Skip if roomSlotUsed[room][slot]
             - Check capacity >= class section capacity
        iv.  If teacher+slot+room found: create lesson, mark maps as used
        v.   If no valid assignment found: add to unfulfilled list

  5. Bulk insert all created lessons.

OUTPUT:
  {
    totalLessonsCreated: number,
    totalRequirementsFulfilled: number,
    totalRequirements: number,
    unfulfilled: [{ classSectionId, subjectId, required, scheduled, reason }]
  }
```

**Note:** This greedy algorithm will not produce optimal results for highly constrained schools. It is a v1 implementation. Future improvements: backtracking, simulated annealing, or genetic algorithms. The manual override (create/update/delete individual lessons) exists for the admin to fix whatever the algorithm misses.

---

## 6. Subscription Tier Feature Gating

Implement as Express middleware that runs AFTER auth middleware and BEFORE route handlers.

```typescript
// shared/middleware/feature-gate.middleware.ts

// Feature -> minimum plan required
const FEATURE_PLAN_MAP = {
  'auto_scheduling': 'premium',
  'per_lesson_attendance': 'premium',
  'report_cards': 'basic',
  'fee_management': 'basic',
  'online_payment': 'premium',
  'sms_notifications': 'premium',
  'custom_roles': 'premium',
  'api_access': 'enterprise',
  'audit_logs': 'premium',
} as const;

const PLAN_HIERARCHY = ['free', 'basic', 'premium', 'enterprise'] as const;

function hasPlanAccess(schoolPlan: string, requiredPlan: string): boolean {
  return PLAN_HIERARCHY.indexOf(schoolPlan) >= PLAN_HIERARCHY.indexOf(requiredPlan);
}

// Usage in routes:
// router.post('/lessons/auto-generate', requireFeature('auto_scheduling'), controller.autoGenerate);
```

**Entity limits** (max students, max teachers) are checked at creation time in the service layer, not in middleware.

| Plan | Max Students | Max Teachers |
|---|---|---|
| free | 100 | 10 |
| basic | 500 | 50 |
| premium | 2000 | 200 |
| enterprise | unlimited | unlimited |

---

## 7. Domain-Specific Error Catalog

Beyond the generic errors in the API design, these are the specific business errors each domain can produce. Use these exact codes.

### Auth Errors

| Code | HTTP | Description |
|---|---|---|
| INVALID_CREDENTIALS | 401 | Email or password incorrect |
| ACCOUNT_DISABLED | 403 | User account is_active = false |
| SCHOOL_SUSPENDED | 403 | School status is suspended |
| SCHOOL_ARCHIVED | 403 | School status is archived |
| SUBSCRIPTION_EXPIRED | 403 | School subscription has expired |
| TOKEN_EXPIRED | 401 | JWT has expired |
| INVALID_REFRESH_TOKEN | 401 | Refresh token invalid or revoked |

### Academic Structure Errors

| Code | HTTP | Description |
|---|---|---|
| ACADEMIC_YEAR_OVERLAP | 409 | New year's dates overlap an existing year |
| TERM_OUTSIDE_YEAR | 422 | Term dates fall outside the academic year |
| TERM_OVERLAP | 409 | Term dates overlap another term in the same year |
| ACTIVE_YEAR_EXISTS | 409 | Cannot activate, another year is already active |
| YEAR_HAS_DEPENDENTS | 409 | Cannot delete year with terms, enrollments, or lessons |
| GRADE_IN_USE | 409 | Cannot delete grade with enrolled students or sections |

### Student Errors

| Code | HTTP | Description |
|---|---|---|
| STUDENT_CODE_EXISTS | 409 | Duplicate student code within school |
| ENROLLMENT_EXISTS_FOR_YEAR | 409 | Student already enrolled in this academic year |
| CLASS_SECTION_FULL | 422 | Section capacity reached |
| INVALID_STATUS_TRANSITION | 400 | Status change not allowed (see state machine) |
| GUARDIAN_ALREADY_LINKED | 409 | This guardian is already linked to this student |

### Teacher Errors

| Code | HTTP | Description |
|---|---|---|
| TEACHER_CODE_EXISTS | 409 | Duplicate teacher code within school |
| TEACHER_HAS_ACTIVE_LESSONS | 409 | Cannot delete teacher with scheduled lessons |
| TEACHER_NOT_QUALIFIED | 422 | Teacher not assigned to teach this subject |
| TEACHER_NOT_AVAILABLE | 422 | Teacher marked unavailable for this slot |

### Scheduling Errors

| Code | HTTP | Description |
|---|---|---|
| SCHEDULE_CONFLICT_TEACHER | 409 | Teacher already has a lesson at this time |
| SCHEDULE_CONFLICT_CLASS | 409 | Class already has a lesson at this time |
| SCHEDULE_CONFLICT_ROOM | 409 | Room already occupied at this time |
| ROOM_NOT_SUITABLE | 422 | Room is not suitable for this subject |
| ROOM_CAPACITY_INSUFFICIENT | 422 | Room capacity < class section capacity |
| TIME_SLOT_IS_BREAK | 422 | Cannot schedule lesson during a break period |
| LESSON_ALREADY_CANCELLED | 400 | Lesson is already cancelled |

### Substitution Errors

| Code | HTTP | Description |
|---|---|---|
| SUBSTITUTE_IS_ORIGINAL_TEACHER | 422 | Substitute cannot be the same as the original teacher |
| SUBSTITUTE_HAS_CONFLICT | 409 | Substitute teacher has a conflicting lesson |
| SUBSTITUTE_ALREADY_ASSIGNED | 409 | Substitute already assigned elsewhere at same time on same date |
| SUBSTITUTION_DATE_OUTSIDE_LEAVE | 422 | Substitution date doesn't fall within the teacher's leave period |

### Leave Errors

| Code | HTTP | Description |
|---|---|---|
| LEAVE_DATES_INVALID | 422 | date_from is after date_to |
| LEAVE_OVERLAP | 409 | Teacher already has an approved leave overlapping these dates |
| LEAVE_ALREADY_STARTED | 400 | Cannot cancel a leave that has already started |
| LEAVE_NOT_PENDING | 400 | Can only approve/reject leaves in pending status |

### Exam & Grading Errors

| Code | HTTP | Description |
|---|---|---|
| EXAM_WEIGHT_EXCEEDS_100 | 422 | Sum of exam weights in a term exceeds 100 |
| SCORE_EXCEEDS_MAX | 422 | Student score exceeds exam_subject.max_score |
| GRADE_ALREADY_ENTERED | 409 | Duplicate grade for this student + exam_subject |
| EXAM_HAS_GRADES | 409 | Cannot delete exam that has grade entries |
| INCOMPLETE_GRADES | 422 | Not all students have grades, cannot generate report card |
| REPORT_CARD_ALREADY_EXISTS | 409 | Snapshot already exists for this student + term |

### Fee Errors

| Code | HTTP | Description |
|---|---|---|
| INVOICE_NOT_DRAFT | 400 | Can only edit invoices in draft status |
| INVOICE_HAS_PAYMENTS | 400 | Cannot cancel invoice with recorded payments |
| INVOICE_NOT_PAYABLE | 400 | Can only record payment on issued/partially_paid/overdue invoices |
| OVERPAYMENT | 422 | Payment would exceed the invoice net amount |
| DISCOUNT_EXCEEDS_100 | 422 | Percentage discount cannot exceed 100 |
| DISCOUNT_EXCEEDS_TOTAL | 422 | Total discount exceeds invoice total |
| DUPLICATE_DISCOUNT | 409 | Discount already exists for this student + fee structure |
| FEATURE_NOT_AVAILABLE | 403 | Fee management requires basic plan or higher |

---

## 8. Docker Compose for Local Development

```yaml
# docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: schoolms
      POSTGRES_PASSWORD: schoolms_dev
      POSTGRES_DB: schoolms_dev
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data
      - ./scripts/init-test-db.sql:/docker-entrypoint-initdb.d/init-test-db.sql
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U schoolms']
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - '6379:6379'
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  pgdata:
```

```sql
-- scripts/init-test-db.sql
-- Creates the test database alongside the dev database
CREATE DATABASE schoolms_test;
GRANT ALL PRIVILEGES ON DATABASE schoolms_test TO schoolms;
```

**Startup:** `docker compose up -d`, then `npm run db:migrate:dev`, then `npm run db:seed`.

---

## 9. Full Environment Variables

```env
# .env.example

# ---- Core ----
NODE_ENV=development
PORT=3000

# ---- Database ----
DATABASE_URL=postgresql://schoolms:schoolms_dev@localhost:5432/schoolms_dev?schema=public

# ---- Auth ----
JWT_SECRET=change-this-to-at-least-32-characters-long-secret-key-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d

# ---- Redis (session, rate limiting, caching) ----
REDIS_URL=redis://localhost:6379

# ---- Logging ----
LOG_LEVEL=debug

# ---- CORS ----
CORS_ORIGIN=http://localhost:3000

# ---- File Uploads (logos, photos) ----
UPLOAD_PROVIDER=local
UPLOAD_LOCAL_DIR=./uploads
UPLOAD_MAX_SIZE_MB=5
# For S3-compatible storage:
# UPLOAD_PROVIDER=s3
# S3_BUCKET=schoolms-uploads
# S3_REGION=us-east-1
# S3_ACCESS_KEY=xxx
# S3_SECRET_KEY=xxx

# ---- Email (notifications) ----
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your_mailtrap_user
SMTP_PASS=your_mailtrap_pass
SMTP_FROM=noreply@schoolms.com

# ---- SMS (notifications, premium+ plans only) ----
SMS_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM_NUMBER=+1234567890

# ---- Push Notifications ----
FIREBASE_PROJECT_ID=schoolms-prod
FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json

# ---- Rate Limiting ----
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
AUTH_RATE_LIMIT_WINDOW_MS=900000
AUTH_RATE_LIMIT_MAX_REQUESTS=10

# ---- Cron Jobs ----
CRON_OVERDUE_INVOICES=0 2 * * *
CRON_SUBSCRIPTION_CHECK=0 3 * * *
```

```env
# .env.test
NODE_ENV=test
PORT=3001
DATABASE_URL=postgresql://schoolms:schoolms_dev@localhost:5432/schoolms_test?schema=public
JWT_SECRET=test-secret-key-that-is-at-least-32-chars
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
REDIS_URL=redis://localhost:6379/1
LOG_LEVEL=error
CORS_ORIGIN=*
UPLOAD_PROVIDER=local
UPLOAD_LOCAL_DIR=./test-uploads
```

---

## 10. Seed Script Specification

The seed script creates a realistic demo school for development and testing. It must be **idempotent** (safe to run multiple times via upsert).

### Seed Data

**1. Super admin user:**
- Email: `superadmin@schoolms.com`, password: `SuperAdmin123!`
- Role: super_admin (global)

**2. Demo school:**
- Name: "Al Noor International Academy", code: `al-noor`
- Timezone: `Asia/Riyadh`, locale: `ar`, currency: `SAR`
- Plan: `premium`, status: `active`

**3. Roles:** All 7 seed roles created as global (school_id = null).

**4. Permissions:** All 115 permissions seeded. Role-permission mappings seeded per the matrix in Section 3.

**5. Academic year:**
- "2025/2026", start: 2025-09-01, end: 2026-06-30, is_active: true
- 3 terms: Term 1 (Sep-Dec), Term 2 (Jan-Mar), Term 3 (Apr-Jun)

**6. Grades:** Grade 1 through Grade 6, level_order 1-6.

**7. Subjects:** 8 subjects: Arabic, English, Mathematics, Science, Social Studies, Art, Physical Education, Islamic Studies. Codes: ARA, ENG, MATH, SCI, SOC, ART, PE, ISL.

**8. Subject-grade associations:** All 8 subjects assigned to all 6 grades.

**9. Departments:** 3 departments: Languages, Sciences, Humanities.

**10. Teachers:** 12 teachers (4 per department). Each assigned 2-3 subjects via teacher_subjects.

**11. Class sections:** 2 sections per grade (A, B), total 12. Capacity: 25 each. Homeroom teachers assigned.

**12. Students:** 20 students (roughly 3-4 per section). Varied genders, realistic Arab names.

**13. Guardians:** 15 guardians linked to students (some shared for siblings).

**14. Student enrollments:** All 20 students enrolled in appropriate sections for 2025/2026.

**15. Period set + periods:**
- "Default" period set for 2025/2026.
- Working days: Sunday through Thursday (0-4 active, 5-6 inactive).
- 8 periods: 6 teaching + 2 breaks.

**16. Time slots:** Auto-generated from working days x non-break periods = 30 slots.

**17. Rooms:** 8 rooms (6 classrooms, 1 science lab, 1 computer lab).

**18. Class subject requirements:** Each section gets 28-30 weekly lessons across all subjects.

**19. Grading scale:** "Percentage Scale" with levels A+ through F.

**20. School admin user:**
- Email: `admin@alnoor.edu.sa`, password: `Admin123!`
- Role: school_admin for Al Noor

**21. Teacher users:** 3 of the 12 teachers get user accounts with teacher role.

**22. Fee categories:** Tuition, Transportation, Books.

**23. Fee structures:** Tuition for each grade (term-recurring), Transportation (annual), Books (one-time).

**Seed order (respects FK dependencies):**
1. Permissions
2. Roles
3. Role-permissions
4. Schools
5. Users (super admin, school admin)
6. User-roles
7. Academic years + terms
8. Departments
9. Grades
10. Subjects + subject-grades
11. Teachers + teacher-subjects
12. Class sections
13. Students + guardians + student-guardians
14. Student enrollments
15. Period sets + working days + periods + time slots
16. Rooms + room-subject suitability
17. Class subject requirements
18. Grading scales + levels
19. Fee categories + fee structures
20. Teacher user accounts + user-roles

---

## 11. Cron Jobs

Two scheduled jobs are needed for production. Implement using `node-cron` or a similar lightweight scheduler.

### 11.1 Overdue Invoice Check

**Schedule:** Daily at 2:00 AM (school's local time, but we run in UTC so configure per-school offset).

```
QUERY:
  UPDATE fee_invoices
  SET status = 'overdue', updated_at = NOW()
  WHERE status IN ('issued', 'partially_paid')
    AND due_date < CURRENT_DATE
    AND deleted_at IS NULL;

SIDE EFFECT:
  For each invoice transitioned to overdue:
    - Create notification for the student's primary guardian
    - Channels: in_app (always), sms (if school plan supports it)
```

### 11.2 Subscription Expiry Check

**Schedule:** Daily at 3:00 AM UTC.

```
QUERY:
  UPDATE schools
  SET status = 'suspended', updated_at = NOW()
  WHERE status = 'active'
    AND subscription_expires_at IS NOT NULL
    AND subscription_expires_at < NOW();

SIDE EFFECT:
  - Log audit entry for the suspension
  - Send email notification to school admin(s)
```

---

## 12. Audit Middleware Specification

The audit system logs changes to critical tables. Implement as an Express middleware or as a Prisma middleware/extension.

### Tables to Audit

| Table | INSERT | UPDATE | DELETE |
|---|---|---|---|
| student_grades | x | x | x |
| fee_invoices | x | x | x |
| fee_payments | x | x | x |
| lessons | x | x | x |
| student_enrollments | x | x | |
| teacher_leaves | | x | |
| substitutions | x | x | x |
| users (role changes only) | | x | |

### Implementation Approach

Use a **Prisma extension** (`$extends`) that intercepts `create`, `update`, and `delete` on the audited models and writes to `audit_logs` within the same transaction.

```typescript
// Pseudocode for Prisma extension
const auditedModels = new Set([
  'studentGrade', 'feeInvoice', 'feePayment', 'lesson',
  'studentEnrollment', 'teacherLeave', 'substitution'
]);

prisma.$extends({
  query: {
    $allModels: {
      async update({ model, args, query }) {
        if (!auditedModels.has(model)) return query(args);
        const before = await prisma[model].findUnique({ where: args.where });
        const result = await query(args);
        await prisma.auditLog.create({
          data: {
            schoolId: result.schoolId,
            userId: getCurrentUserId(),  // from AsyncLocalStorage
            tableName: toSnakeCase(model),
            recordId: result.id,
            action: 'UPDATE',
            oldValues: before,
            newValues: result,
            ipAddress: getCurrentIp(),
            userAgent: getCurrentUserAgent(),
          }
        });
        return result;
      }
    }
  }
});
```

Use `AsyncLocalStorage` (Node.js 24 native) to carry the current user's ID, IP address, and user agent through the request lifecycle without passing them through every function call.

---

## 13. File Checklist

Before handing off to Claude Code, ensure these files exist:

| File | Status | Purpose |
|---|---|---|
| `CLAUDE.md` | Done | Tech stack, conventions, code patterns |
| `School_Management_SaaS_ERD.md` | Done | Full data model (38 entities) |
| `School_Management_SaaS_Business_Analysis.md` | Done | Business context and processes |
| `School_Management_SaaS_API_Design.md` | Done | 130+ endpoint specifications |
| `IMPLEMENTATION_GUIDE.md` | This file | Build order, permissions, state machines, algorithms, errors, infra |

With all 5 files, Claude Code has zero ambiguity. Every question it could ask has an answer in one of these documents.
