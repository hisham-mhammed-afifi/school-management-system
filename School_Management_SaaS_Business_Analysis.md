# School Management SaaS - Business Analysis Document

> **Version:** 1.0
> **Date:** February 2026
> **Based on:** ERD v3.0 (Production-Ready)

---

## 1. Executive Summary

This document provides a comprehensive business analysis of a multi-tenant School Management SaaS platform. The system is designed to serve K-12 educational institutions by digitizing and automating their core operational workflows: student lifecycle management, academic scheduling, attendance tracking, examinations and grading, financial billing, and stakeholder communication.

The platform follows a multi-tenant architecture where each school operates as an isolated tenant. This allows a single deployment to serve hundreds of schools simultaneously while maintaining strict data separation, making the product viable as both a SaaS offering and a self-hosted enterprise solution.

The data model consists of 38 entities organized across 15 functional domains, supporting 7 distinct user roles and 4 subscription tiers.

---

## 2. Stakeholder Identification

### 2.1 Primary Stakeholders

**School Administrators** are the decision-makers who purchase and configure the system. They manage academic year setup, class structures, fee schedules, and overall school operations. Their primary concern is operational efficiency and reporting accuracy.

**Teachers** interact with the system daily for attendance recording, grade entry, timetable viewing, and leave management. Their primary concern is ease of use and time savings on administrative tasks.

**Students** (or their families acting on their behalf) access grades, attendance records, fee balances, and announcements. Their primary concern is transparency and timely information access.

**Guardians/Parents** are the financial counterpart and communication endpoint. They pay fees, receive progress reports, and communicate with the school. Their primary concern is visibility into their child's academic and financial status.

### 2.2 Secondary Stakeholders

**Accountants** manage fee structures, invoice generation, payment collection, and financial reporting. They need accurate, auditable financial records.

**Platform Operators (Super Admins)** manage the SaaS platform itself: onboarding new schools, managing subscriptions, monitoring system health, and handling cross-tenant operations.

### 2.3 Stakeholder-to-Role Mapping

| Stakeholder          | System Role(s)              | Access Scope           |
| -------------------- | --------------------------- | ---------------------- |
| Platform Operator    | super_admin                 | Cross-tenant           |
| School Admin         | school_admin                | Single school (all)    |
| Principal            | principal                   | Single school (all)    |
| Teacher              | teacher                     | Assigned classes only  |
| Student              | student                     | Own records only       |
| Parent/Guardian      | guardian                    | Linked children only   |
| Finance Staff        | accountant                  | Financial module only  |

---

## 3. Functional Domain Analysis

### 3.1 Domain Overview

The system is decomposed into 15 functional domains. Each domain is self-contained but interconnected through well-defined foreign key relationships.

| #  | Domain                   | Core Tables                                                           | Business Function                          |
| -- | ------------------------ | --------------------------------------------------------------------- | ------------------------------------------ |
| 1  | Multi-Tenancy            | schools                                                               | Tenant isolation and subscription mgmt     |
| 2  | Identity & Access        | users, roles, permissions, role_permissions, user_roles               | Authentication and authorization           |
| 3  | Academic Structure       | academic_years, terms, departments, grades, class_sections, subjects, subject_grades | School organizational hierarchy |
| 4  | Student Management       | students, guardians, student_guardians, student_enrollments           | Student lifecycle and family relationships |
| 5  | Teacher Management       | teachers, teacher_subjects, class_subject_requirements                | Staff profiles and teaching assignments    |
| 6  | Time Modeling            | period_sets, school_working_days, periods, time_slots                 | Bell schedule and calendar configuration   |
| 7  | Room Management          | rooms, room_subject_suitability                                       | Physical space allocation                  |
| 8  | Scheduling               | lessons, substitutions                                                | Timetable generation and conflict mgmt     |
| 9  | Availability & Leaves    | teacher_availability, teacher_leaves                                  | Staff capacity and leave workflows         |
| 10 | Attendance               | student_attendance, teacher_attendance                                | Daily/per-lesson presence tracking         |
| 11 | Exams & Grading          | grading_scales, grading_scale_levels, exams, exam_subjects, student_grades, report_card_snapshots | Assessment and academic performance |
| 12 | Fees & Billing           | fee_categories, fee_structures, fee_discounts, fee_invoices, fee_invoice_items, fee_payments | Financial operations |
| 13 | Communication            | announcements, announcement_targets, notifications                    | Stakeholder messaging                      |
| 14 | Calendar & Events        | academic_events                                                       | School calendar management                 |
| 15 | Audit                    | audit_logs                                                            | Compliance and change tracking             |

### 3.2 Domain Dependency Map

The following describes how domains depend on each other. Higher-numbered domains depend on lower-numbered ones, never the reverse. This means implementation can follow this order with minimal rework.

```
Layer 0 (Foundation):     Multi-Tenancy
Layer 1 (Identity):       Identity & Access
Layer 2 (Structure):      Academic Structure, Time Modeling, Room Management
Layer 3 (People):         Student Management, Teacher Management
Layer 4 (Operations):     Scheduling, Availability & Leaves, Attendance
Layer 5 (Assessment):     Exams & Grading
Layer 6 (Finance):        Fees & Billing
Layer 7 (Cross-cutting):  Communication, Calendar & Events, Audit
```

---

## 4. Detailed Domain Analysis

### 4.1 Multi-Tenancy (Domain 1)

**Business purpose:** The `schools` table is the root of the entire data model. Every piece of data in the system belongs to exactly one school. This enables the SaaS business model where a single platform instance serves multiple customers.

**Key business rules:**
- Each school has a unique `code` used for identification and URL routing (e.g., `app.example.com/al-noor-academy`).
- Schools operate in different timezones and currencies. All internal timestamps are stored in UTC and converted for display using the school's configured timezone. Currency (ISO 4217) applies to all financial operations within that tenant.
- Subscription plans (free, basic, premium, enterprise) gate feature access and usage limits. The `subscription_expires_at` field enables automated suspension of expired accounts.
- School status progression: `active` (normal operation) to `suspended` (non-payment or policy violation, data preserved but access blocked) to `archived` (soft termination, data retained for legal compliance).

**Revenue model implications:** The subscription_plan and subscription_expires_at fields directly support a tiered SaaS revenue model. Feature gating can be implemented at the application layer using these fields without schema changes.

### 4.2 Identity & Access Management (Domain 2)

**Business purpose:** Manages who can log in and what they can do. This domain serves every other domain by controlling data access.

**Key business rules:**
- A single email address maps to one user account globally. A teacher who is also a parent at another school uses one login and is assigned different roles per school via `user_roles.school_id`. This is a deliberate design choice that prioritizes user experience (single sign-on across schools) over implementation simplicity.
- User accounts link to at most one person entity (teacher, student, or guardian) via nullable FKs. Admin-only users have no person link. This polymorphic approach avoids a separate "person" abstraction while maintaining clear identity mapping.
- Permissions are system-defined (not tenant-customizable) to keep the RBAC model manageable. Schools can, however, create custom roles and assign any combination of system permissions to them.
- The seed roles cover the 7 standard personas. Schools can add custom roles (e.g., "department_head", "librarian", "bus_coordinator") as needed.

**Business process: User provisioning**
1. Admin creates a teacher/student/guardian record.
2. Admin creates a user account linked to that record.
3. Admin assigns one or more roles to the user.
4. User receives credentials (email invite flow, handled at application layer).

**Security considerations:** Password hashing, session management, and MFA are application-layer concerns. The schema stores `password_hash` (never plaintext) and `last_login_at` for audit purposes.

### 4.3 Academic Structure (Domain 3)

**Business purpose:** Defines the organizational hierarchy that all academic operations depend on. This is the "configuration" domain that school admins set up at the start of each academic year.

**Key business rules:**
- Only one academic year can be active per school at any time (enforced via partial unique index). This determines which year's data is shown by default in the UI.
- Terms subdivide the academic year (e.g., Semester 1, Semester 2 or Term 1, Term 2, Term 3). Their `order_index` determines display order.
- Grades have a `level_order` that defines progression (e.g., Grade 1 = 1, Grade 2 = 2, ..., Grade 12 = 12). This enables automated promotion workflows.
- Class sections are scoped to a specific academic year and grade. The section "3A" in Grade 3 during 2025/2026 is a different entity from "3A" in Grade 3 during 2026/2027. This preserves historical accuracy.
- Each class section has an optional homeroom teacher responsible for that class's overall management.
- Subjects are linked to grades via `subject_grades`. This prevents invalid assignments like "Advanced Calculus" being scheduled for Grade 1.
- Departments group teachers by discipline and have an optional head teacher. This supports organizational reporting and hierarchical approval workflows.

**Business process: Academic year setup**
1. Admin creates a new academic year with start and end dates.
2. Admin creates terms within the year.
3. Admin creates or reuses grades and subjects.
4. Admin creates class sections for each grade.
5. Admin defines subject-grade associations.
6. Admin sets class subject requirements (how many weekly lessons each class needs per subject).
7. Admin activates the academic year (deactivating the previous one).

### 4.4 Student Management (Domain 4)

**Business purpose:** Manages the complete student lifecycle from admission to graduation, including family relationships.

**Key business rules:**
- Each student has a unique `student_code` within a school, used for identification on ID cards, forms, and reports.
- Students carry rich demographic data (national ID, nationality, religion, blood type) because school systems in many regions (particularly MENA) require this for government reporting and emergency situations.
- The guardian relationship is many-to-many: one student can have multiple guardians, and one guardian can be linked to multiple students (siblings). Each relationship specifies type (father, mother, etc.), whether it's the primary contact, and whether it's the emergency contact.
- Student enrollment ties a student to a specific class section in a specific academic year. The unique constraint `(school_id, student_id, academic_year_id)` means a student can only be in one class per year.
- Enrollment status tracks the student's journey: `active` (currently attending), `withdrawn` (left mid-year), `transferred` (moved to another school), `promoted` (moved to next grade at year end).

**Business process: Student admission**
1. Admin registers the student with personal details.
2. Admin registers one or more guardians.
3. Admin links guardians to the student with relationship types.
4. Admin enrolls the student in a class section for the current academic year.
5. Admin creates a user account for the student and/or guardian (optional, for portal access).

**Business process: Year-end promotion**
1. System generates report cards for all students (report_card_snapshots).
2. Admin reviews and publishes results.
3. Admin runs promotion: active enrollments are marked "promoted", new enrollments are created in the next academic year's class sections.
4. Students who failed or need to repeat are re-enrolled in the same grade.

### 4.5 Teacher Management (Domain 5)

**Business purpose:** Manages teacher profiles, qualifications, and what they are authorized to teach.

**Key business rules:**
- Teachers belong to a department and have a unique `teacher_code`.
- `teacher_subjects` defines which subjects a teacher is qualified to teach. The scheduler must respect this when assigning lessons.
- `class_subject_requirements` defines how many weekly lessons each class section needs for each subject. This is the "demand" side of the scheduling equation. For example: "Grade 3A needs 5 Math lessons per week."
- Requirements are scoped to an academic year, allowing schools to adjust curricula year over year.

**Relationship to scheduling:** The scheduler's job is to satisfy all `class_subject_requirements` by creating `lessons` that assign a qualified teacher (from `teacher_subjects`), an available room, and an open time slot, without any conflicts.

### 4.6 Time Modeling (Domain 6)

**Business purpose:** Defines when school operates and how the day is divided into schedulable periods.

**Key business rules:**
- `period_sets` group bell schedules by academic year. This allows a school to change its period timings between years (e.g., shifting from 45-minute to 40-minute periods) without breaking historical timetables.
- `school_working_days` defines which days of the week a school operates. This is configurable per period set (and therefore per year). Most schools work Sunday through Thursday or Monday through Friday.
- Periods divide the school day into time blocks. Each period has a start time, end time, and order. The `is_break` flag distinguishes teaching periods from break times. Break periods are never scheduled with lessons.
- `time_slots` are the schedulable atoms: a combination of a day and a period. The scheduler assigns lessons to time slots.

**Example configuration for a school:**
- Working days: Sunday through Thursday (5 days active, Friday and Saturday inactive).
- Periods: Period 1 (8:00-8:45), Period 2 (8:50-9:35), Break (9:35-9:55), Period 3 (9:55-10:40), and so on.
- Time slots: Sunday-Period 1, Sunday-Period 2, Sunday-Period 3, Monday-Period 1, etc.
- Total schedulable slots: 5 days * 6 teaching periods = 30 slots per week.

### 4.7 Room Management (Domain 7)

**Business purpose:** Manages physical spaces and their suitability for different types of instruction.

**Key business rules:**
- Rooms have a type (classroom, lab, hall, library, gym, office) and a capacity.
- For multi-building campuses, `building` and `floor` help with navigation and logistics.
- `room_subject_suitability` restricts which subjects can be taught in specialized rooms. A chemistry lab is suitable only for chemistry; a regular classroom is suitable for anything. If no suitability entries exist for a room, it is assumed to be suitable for all subjects.
- Room capacity should be checked against class section capacity during scheduling to avoid overcrowding.

### 4.8 Scheduling (Domain 8)

**Business purpose:** The core operational domain. Generates and maintains weekly timetables, ensuring no resource conflicts.

**Key business rules:**
- A lesson represents a single scheduled instance: one subject, taught by one teacher, to one class section, in one room, at one time slot, during one term.
- Three hard constraints prevent double-booking, enforced at the database level via partial unique indexes:
  - A teacher cannot teach two classes at the same time.
  - A class section cannot have two lessons at the same time.
  - A room cannot host two lessons at the same time.
- The partial index condition (`WHERE status != 'cancelled'`) ensures that cancelling a lesson frees the slot for reassignment.
- Substitutions handle temporary teacher replacements. When a teacher is on leave, the admin assigns a substitute for specific lessons on specific dates. The original lesson's teacher assignment is preserved for when the teacher returns.

**Business process: Timetable generation**
1. Ensure prerequisites are complete: class sections created, subjects assigned to grades, requirements defined, teachers assigned subjects, periods configured, rooms set up.
2. Run the scheduling algorithm (application layer) to fill time slots with lessons that satisfy all class_subject_requirements while respecting all constraints (teacher qualifications, availability, room suitability, no double-booking).
3. Admin reviews and manually adjusts if needed.
4. Timetable is published (lessons in "scheduled" status).

**Business process: Handling teacher absence**
1. Teacher submits a leave request.
2. Principal/admin approves the leave.
3. Admin creates substitution records, assigning available and qualified teachers to cover the absent teacher's lessons for the leave period.
4. Substitute teacher sees the additional lessons in their timetable for the specified dates.

### 4.9 Availability & Leaves (Domain 9)

**Business purpose:** Captures teacher capacity constraints that the scheduler and admin must respect.

**Key business rules:**
- `teacher_availability` defines the weekly baseline. A teacher might be unavailable on Sunday mornings due to a part-time commitment elsewhere. The scheduler must not assign lessons during unavailable slots.
- `teacher_leaves` handles date-specific absences. The leave workflow follows a request-approve pattern: teacher submits a leave request with type and dates, and an authorized user (principal or admin) approves or rejects it.
- Leave types cover standard categories: sick, personal, maternity, paternity, annual, unpaid, and other.
- Leave status progression: `pending` (submitted) to `approved`/`rejected` (decision made) to `cancelled` (withdrawn by teacher or admin).

### 4.10 Attendance (Domain 10)

**Business purpose:** Tracks daily presence of students and teachers, generating data for compliance reporting, parent communication, and operational oversight.

**Key business rules:**
- Student attendance supports two modes:
  - **Daily mode** (`lesson_id = NULL`): One attendance record per student per day. Suitable for schools where the homeroom teacher marks attendance once in the morning.
  - **Per-lesson mode** (`lesson_id` set): One attendance record per student per lesson. Suitable for schools that track presence for every class, common in secondary and higher education.
- Schools choose one mode and stick with it consistently. The schema enforces uniqueness differently for each mode via partial indexes.
- Teacher attendance tracks check-in and check-out times, supporting both manual entry and integration with biometric/card systems (via application layer).
- Attendance statuses: `present`, `absent`, `late`, `excused` (for students), and `present`, `absent`, `late`, `on_leave` (for teachers).

**Reporting use cases:**
- Absenteeism report: Students with more than X absences in a term.
- Teacher punctuality report: Average check-in time and late count.
- Daily attendance summary: Percentage present per class section.
- Parent alert: Notification when a student is marked absent.

### 4.11 Exams & Grading (Domain 11)

**Business purpose:** Manages the complete assessment lifecycle from exam definition through grading to report card generation.

**Key business rules:**
- Grading scales are school-defined and reusable. A school might have a "Percentage Scale" (A = 90-100, B = 80-89, etc.) and a "GPA Scale" with different thresholds.
- Each exam is linked to a grading scale, so the system knows how to convert raw scores into letter grades.
- Exams have a `weight` field for weighted average calculations. If a midterm is worth 40% and the final is worth 60%, their weights are 40 and 60 respectively. The application computes weighted averages across all exams in a term.
- `exam_subjects` breaks an exam into per-subject, per-grade entries. The midterm exam might have different max scores and dates for Math vs. Science, and different configurations for Grade 3 vs. Grade 10.
- `student_grades` stores the actual score each student received. The `grade_letter` is computed by the application using the exam's grading scale and stored for snapshot purposes.
- `report_card_snapshots` are generated at the end of each term. The JSONB `snapshot_data` field captures the full breakdown of every subject, every exam, every score, and the computed final grades at the moment of generation. This is critical because:
  - Report cards must be immutable once published. If a teacher later corrects a grade, the published report card should not retroactively change.
  - Historical report cards must be retrievable years later, even if grading scales or calculation methods have changed.
  - The snapshot includes class rank, overall GPA, overall percentage, and teacher remarks.

**Business process: End-of-term grading**
1. Teachers enter scores for each exam-subject combination.
2. System auto-computes grade letters using the exam's grading scale.
3. Admin reviews all grades for completeness.
4. Admin generates report card snapshots for all students.
5. Admin publishes snapshots (triggers notification to guardians).
6. Guardians view/download report cards via the portal.

### 4.12 Fees & Billing (Domain 12)

**Business purpose:** Manages the financial relationship between the school and student families.

**Key business rules:**
- Fee categories group fee types (Tuition, Transportation, Books, Lab Fees, Activities). This enables financial reporting by category.
- Fee structures define the actual amounts charged per grade per academic year. For example: "Grade 5 Tuition for 2025/2026 = $5,000/year." Structures can be one-time or recurring (monthly, quarterly, per-term, annual).
- The CHECK constraint on fee_structures ensures `recurrence` is null when `is_recurring = false` and non-null when `is_recurring = true`, preventing inconsistent data.
- Fee discounts are applied per student per fee structure. A student might receive a 10% sibling discount on tuition. The unique constraint prevents the same discount from being applied twice accidentally.
- Fee invoices are the billing documents sent to families. Each invoice has line items (`fee_invoice_items`) with quantity and unit pricing. The invoice tracks `total_amount`, `discount_amount`, and `net_amount` with a CHECK ensuring they are consistent.
- Invoice status progression: `draft` (being prepared) to `issued` (sent to guardian) to `partially_paid`/`paid` (payments received) to `overdue` (past due date, no full payment). Invoices can also be `cancelled`.
- Fee payments record individual transactions against invoices. Multiple partial payments can be made against a single invoice (installment plans). Each payment records the method, reference number, and who received it.

**Financial reporting use cases:**
- Revenue by category: Total tuition collected vs. total transportation fees.
- Outstanding receivables: All invoices in "issued" or "partially_paid" status.
- Student balance: Sum of net_amount minus sum of payments for a given student.
- Collection rate: Percentage of issued invoices that are fully paid.
- Daily cash report: All payments received on a given date, grouped by method.

### 4.13 Communication (Domain 13)

**Business purpose:** Enables the school to reach the right audience with timely information.

**Key business rules:**
- Announcements are broadcast messages created by school staff. Unlike the v2 design which limited each announcement to a single target audience, the v3 design uses `announcement_targets` as a junction table, allowing one announcement to target multiple audiences simultaneously (e.g., "Parent-teacher meeting" targeting both the "guardian" role and specific Grade 5 class sections).
- Target types: `all` (entire school), `role` (all users with a specific role), `grade` (all students/guardians in a grade), `class_section` (a specific class).
- Announcements have a publication lifecycle: `is_draft = true` (being composed) then `is_draft = false` with `published_at` set (visible to targets). They can also expire via `expires_at`.
- Notifications are per-user messages delivered through specific channels (in-app, SMS, email, push). The same notification sent via multiple channels creates multiple rows, enabling per-channel delivery tracking and retry logic.
- Read tracking (`is_read`, `read_at`) supports notification badges and engagement metrics.

**Integration points:** The notification system is designed to be channel-agnostic at the data level. The application layer integrates with SMS gateways (Twilio, etc.), email services (SendGrid, etc.), and push notification providers (Firebase, etc.) to deliver notifications based on the `channel` field.

### 4.14 Calendar & Events (Domain 14)

**Business purpose:** Manages the school calendar, including holidays, exam periods, and activities.

**Key business rules:**
- Events are scoped to an academic year.
- The `is_school_closed` flag is operationally significant: it tells the attendance system to skip those dates and tells the scheduling system that no lessons occur.
- Event types (holiday, exam_period, meeting, activity, ceremony, other) support filtering and display in calendar views.
- Exam period events complement the `exams` table by blocking out scheduling during exam weeks.

### 4.15 Audit (Domain 15)

**Business purpose:** Provides a tamper-resistant log of all significant data changes for compliance, dispute resolution, and debugging.

**Key business rules:**
- The audit log is append-only. No updates or deletes are allowed. This is enforced via database triggers or application middleware.
- Each entry captures: who made the change (`user_id`), what changed (`table_name`, `record_id`), the nature of the change (`action`: INSERT, UPDATE, DELETE), the before and after states (`old_values`, `new_values` as JSONB), and contextual metadata (`ip_address`, `user_agent`).
- Priority tables for auditing: `student_grades` (grade disputes), `fee_payments` (financial discrepancies), `fee_invoices` (billing disputes), `lessons` (scheduling changes).
- The table is partitioned by `created_at` (monthly) to manage growth, as it will be one of the highest-volume tables in the system.

**Compliance use cases:**
- "Who changed this student's grade and when?"
- "What was the original invoice amount before the discount was applied?"
- "Show me all changes made by user X in the last 30 days."

---

## 5. Business Process Flows

### 5.1 Annual Lifecycle

The following describes the major operational flow a school follows each year, mapped to the domains they involve.

```
[1] Pre-Year Setup (Domains: 3, 6, 7)
    |
    |-- Create academic year and terms
    |-- Configure period sets and working days
    |-- Create/update class sections
    |-- Define subject-grade associations
    |-- Define class subject requirements
    |-- Verify room availability
    |
[2] Student Registration (Domain: 4)
    |
    |-- Admit new students
    |-- Register guardians
    |-- Enroll students in class sections
    |-- Promote returning students from previous year
    |
[3] Teacher Assignment (Domains: 5, 9)
    |
    |-- Update teacher profiles and subjects
    |-- Set teacher availability
    |-- Assign homeroom teachers
    |
[4] Scheduling (Domain: 8)
    |
    |-- Generate timetable
    |-- Review and adjust
    |-- Publish timetable
    |
[5] Fee Setup (Domain: 12)
    |
    |-- Define fee structures for the year
    |-- Apply discounts
    |-- Generate and issue invoices
    |
[6] Daily Operations (Domains: 8, 9, 10, 13)
    |
    |-- Record attendance (daily/per-lesson)
    |-- Process teacher leaves and substitutions
    |-- Collect fee payments
    |-- Send announcements and notifications
    |
[7] Assessment Cycles (Domain: 11)
    |
    |-- Create exams (midterm, final, quizzes)
    |-- Teachers enter grades
    |-- System computes grade letters
    |-- Admin reviews
    |
[8] Term/Year End (Domains: 4, 11, 12)
    |
    |-- Generate report card snapshots
    |-- Publish results
    |-- Reconcile fee accounts
    |-- Promote/retain students
    |-- Archive academic year
```

### 5.2 Cross-Domain Interactions

| Scenario                              | Domains Involved           | Key Tables                                                         |
| ------------------------------------- | -------------------------- | ------------------------------------------------------------------ |
| Schedule a lesson                     | 5, 6, 7, 8                | class_subject_requirements, time_slots, rooms, lessons             |
| Record attendance for a lesson        | 8, 10                     | lessons, student_attendance                                        |
| Grade an exam                         | 4, 11                     | student_enrollments, exam_subjects, student_grades                 |
| Generate a report card                | 4, 11                     | student_enrollments, student_grades, report_card_snapshots         |
| Issue a fee invoice                   | 4, 12                     | student_enrollments, fee_structures, fee_invoices                  |
| Notify parents of absence             | 4, 10, 13                 | student_attendance, student_guardians, notifications               |
| Handle teacher leave                  | 5, 8, 9                   | teacher_leaves, lessons, substitutions                             |
| Promote students                      | 3, 4                      | academic_years, grades, student_enrollments                        |

---

## 6. Data Volume Estimates

Accurate capacity planning requires estimating row counts. The following projections are based on a medium-sized school (800 students, 50 teachers, 30 class sections) over a single academic year.

| Table                  | Estimated Rows/Year | Notes                                               |
| ---------------------- | ------------------- | --------------------------------------------------- |
| students               | 800                 | Grows with admissions, shrinks slowly via graduation |
| guardians              | ~1,200              | ~1.5 guardians per student                           |
| student_guardians      | ~1,400              | Some students have 2+ guardians linked               |
| student_enrollments    | 800                 | One per student per year                             |
| teachers               | 50                  | Relatively stable                                    |
| class_sections         | 30                  | Re-created each year                                 |
| lessons                | ~900                | 30 sections * ~30 slots/week = 900 weekly lessons    |
| time_slots             | ~30                 | 5 days * 6 periods = 30                              |
| student_attendance     | ~144,000            | 800 students * 180 school days (daily mode)          |
| student_grades         | ~24,000             | 800 students * 10 subjects * 3 exam types            |
| report_card_snapshots  | ~2,400              | 800 students * 3 terms                               |
| fee_invoices           | ~2,400              | 800 students * 3 terms                               |
| fee_payments           | ~3,000              | Some invoices have multiple payments                 |
| notifications          | ~50,000             | Attendance alerts, grade notifications, etc.          |
| audit_logs             | ~200,000            | High volume from attendance and grade operations     |

**Multi-tenant extrapolation:** For 100 schools on the platform, multiply each estimate by 100. The audit_logs table would reach ~20M rows/year, justifying the monthly partitioning strategy.

---

## 7. Subscription Tier Feature Matrix

The `subscription_plan` field on `schools` gates feature access. The following is a suggested tier breakdown.

| Feature                        | Free  | Basic | Premium | Enterprise |
| ------------------------------ | ----- | ----- | ------- | ---------- |
| Max students                   | 100   | 500   | 2,000   | Unlimited  |
| Max teachers                   | 10    | 50    | 200     | Unlimited  |
| Academic structure             | Yes   | Yes   | Yes     | Yes        |
| Manual scheduling              | Yes   | Yes   | Yes     | Yes        |
| Auto-scheduling algorithm      | No    | No    | Yes     | Yes        |
| Daily attendance               | Yes   | Yes   | Yes     | Yes        |
| Per-lesson attendance          | No    | No    | Yes     | Yes        |
| Basic grading (score entry)    | Yes   | Yes   | Yes     | Yes        |
| Report card generation         | No    | Yes   | Yes     | Yes        |
| Fee management                 | No    | Yes   | Yes     | Yes        |
| Online payment integration     | No    | No    | Yes     | Yes        |
| SMS notifications              | No    | No    | Yes     | Yes        |
| Custom roles                   | No    | No    | Yes     | Yes        |
| API access                     | No    | No    | No      | Yes        |
| Audit logs                     | No    | No    | Yes     | Yes        |
| Multi-branch (multiple schools)| No    | No    | No      | Yes        |
| Dedicated support              | No    | No    | No      | Yes        |

---

## 8. Non-Functional Requirements

### 8.1 Data Integrity

The schema enforces integrity at multiple levels. CHECK constraints validate data ranges and enum values. Unique constraints prevent duplicate records. Foreign key constraints prevent orphan records. Partial unique indexes handle conditional uniqueness (e.g., one active academic year, no double-booking excluding cancelled lessons). These database-level guardrails mean the system remains consistent even if application-layer validation is bypassed.

### 8.2 Data Retention and Privacy

Student records contain sensitive personal data (national IDs, medical notes, religion). The system must comply with relevant data protection regulations (GDPR for EU schools, PDPL for Saudi schools, etc.). Soft deletes preserve data for legal compliance while hiding it from normal operations. The `deleted_at` pattern allows for scheduled hard deletion after a retention period (e.g., 7 years post-graduation).

### 8.3 Multi-Tenancy Isolation

Every tenant-bound query must include `school_id` in its WHERE clause. Row-Level Security (RLS) at the database level provides defense-in-depth. A bug in the application layer that omits the school_id filter will still be caught by RLS policies, preventing cross-tenant data leakage.

### 8.4 Scalability

The schema is designed for horizontal scaling via school_id-based partitioning. High-volume tables (audit_logs, notifications, student_attendance) should be partitioned by time. UUID primary keys avoid sequential ID conflicts in distributed systems.

### 8.5 Auditability

The combination of per-table audit columns (`created_at`, `updated_at`, `created_by`, `updated_by`) and the centralized `audit_logs` table provides a complete change history. Critical operations (grade changes, payment modifications, schedule alterations) are logged with before/after state, enabling full traceability.

---

## 9. Risks and Mitigation

| Risk                                          | Impact   | Probability | Mitigation                                                                                   |
| --------------------------------------------- | -------- | ----------- | -------------------------------------------------------------------------------------------- |
| Scheduling algorithm fails to find valid solution | High  | Medium      | Allow manual override; implement "best effort" mode that highlights unresolved conflicts      |
| Cross-tenant data leakage                     | Critical | Low         | RLS at DB level; school_id in every query; automated penetration testing                     |
| Report card data inconsistency                | High     | Low         | JSONB snapshots are immutable; grade corrections create audit trail, do not modify snapshots  |
| Fee payment disputes                          | Medium   | Medium      | Audit log on all payment operations; reference numbers for external reconciliation            |
| Performance degradation at scale              | High     | Medium      | Table partitioning; query indexing strategy; caching at application layer                     |
| Schema migration complexity over time         | Medium   | High        | Additive-only schema changes where possible; use JSONB for extensible fields (snapshot_data)  |
| Timezone-related bugs                         | Medium   | Medium      | All timestamps in UTC; conversion only at display layer; school timezone stored once          |

---

## 10. Future Extension Roadmap

The following modules are not included in the current ERD but can be added as independent domains without modifying existing tables.

| Module              | Purpose                                                     | Key New Tables                                                |
| ------------------- | ----------------------------------------------------------- | ------------------------------------------------------------- |
| Transportation      | Bus routes, student assignments, driver tracking             | routes, route_stops, student_transport_assignments, drivers   |
| Library             | Book inventory, borrowing, fines                             | books, book_copies, borrows, library_fines                    |
| Hostel/Dormitory    | Room assignments, meal plans, check-in/out                   | hostel_rooms, hostel_assignments, meal_plans                  |
| Inventory           | School supplies, lab equipment tracking                      | inventory_items, inventory_transactions                       |
| HR & Payroll        | Teacher salary, benefits, payslips                           | salary_structures, payslips, deductions, benefits             |
| Parent Portal       | Homework, teacher-parent messaging, progress tracking        | homework_assignments, homework_submissions, messages          |
| Online Learning     | Virtual classrooms, content delivery                         | courses, lessons_online, enrollments_online, content          |
| Discipline          | Incident tracking, behavioral notes, consequences            | incidents, incident_participants, consequences                |
| Health Clinic       | School nurse visits, medication tracking                     | clinic_visits, medications, health_screenings                 |

Each module would follow the same conventions: `school_id` on all tables, UUID primary keys, audit columns, and soft deletes where appropriate.

---

## 11. Glossary

| Term                     | Definition                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| Academic Year            | A full school year (e.g., 2025/2026), the top-level time container for all operations              |
| Term                     | A subdivision of the academic year (semester, trimester, quarter)                                   |
| Grade                    | An educational level (e.g., Grade 1, Grade 12, KG2)                                               |
| Class Section            | A specific group of students within a grade (e.g., Grade 3 Section A, or "3A")                     |
| Period                   | A time block within a school day (e.g., 8:00-8:45)                                                 |
| Time Slot                | A schedulable unit combining a day and a period (e.g., Monday, Period 3)                            |
| Lesson                   | A single scheduled class session: one teacher, one subject, one class, one room, one time slot      |
| Period Set               | A named collection of periods and working days tied to an academic year                             |
| Homeroom Teacher         | The primary teacher responsible for a class section's overall management                            |
| Grading Scale            | A defined mapping from numerical scores to letter grades (e.g., 90-100 = A)                        |
| Report Card Snapshot     | An immutable JSON record of a student's grades at the end of a term                                 |
| Fee Structure            | A defined charge amount for a specific grade, category, and academic year                           |
| Substitution             | A temporary teacher replacement for a specific lesson on a specific date                            |
| RLS (Row-Level Security) | A database feature that restricts which rows a query can access based on the current user's context |
| Tenant                   | A single school instance within the multi-tenant platform                                           |
