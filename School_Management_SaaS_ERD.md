# School Management SaaS - Production-Ready ERD

> **Version:** 3.0 (Reviewed & Hardened)
> **Status:** Production-Ready
> **Last Updated:** February 2026

---

## Conventions

- All tables use UUID `id` as primary key (PK).
- All tenant-bound tables include `school_id (FK)` for row-level isolation. The only exceptions are child tables that can only be reached through a parent that already carries `school_id` (e.g., `grading_scale_levels` via `grading_scales`, `fee_invoice_items` via `fee_invoices`). These are noted explicitly.
- All tables include audit columns: `created_at`, `updated_at`, `created_by`, `updated_by`.
- Soft deletes via `deleted_at` (nullable timestamp) on all major entities.
- Timestamps stored in UTC. Display converted using `schools.timezone`.
- All foreign keys have `ON DELETE RESTRICT` unless otherwise noted.
- ENUMs are implemented as VARCHAR with CHECK constraints for portability (e.g., `CHECK (status IN ('active', 'suspended'))`).

---

## 1. Multi-Tenancy Layer

### schools

| Column                  | Type         | Constraints                             |
| ----------------------- | ------------ | --------------------------------------- |
| id                      | UUID         | PK                                      |
| name                    | VARCHAR(255) | NOT NULL                                |
| code                    | VARCHAR(50)  | UNIQUE, NOT NULL                        |
| logo_url                | TEXT         |                                         |
| timezone                | VARCHAR(50)  | NOT NULL                                |
| default_locale          | VARCHAR(10)  | NOT NULL, default 'en'                  |
| currency                | VARCHAR(3)   | NOT NULL, default 'USD' (ISO 4217)      |
| country                 | VARCHAR(100) |                                         |
| city                    | VARCHAR(100) |                                         |
| address                 | TEXT         |                                         |
| phone                   | VARCHAR(20)  |                                         |
| email                   | VARCHAR(255) |                                         |
| website                 | VARCHAR(255) |                                         |
| subscription_plan       | VARCHAR(20)  | NOT NULL, CHECK IN (free, basic, premium, enterprise) |
| subscription_expires_at | TIMESTAMP    |                                         |
| status                  | VARCHAR(20)  | NOT NULL, CHECK IN (active, suspended, archived) |
| created_at              | TIMESTAMP    | NOT NULL                                |
| updated_at              | TIMESTAMP    | NOT NULL                                |

---

## 2. Users, Roles & Authentication

### users

| Column        | Type         | Constraints                      |
| ------------- | ------------ | -------------------------------- |
| id            | UUID         | PK                               |
| school_id     | UUID (FK)    | NULLABLE (null for super admins) |
| email         | VARCHAR(255) | UNIQUE, NOT NULL                 |
| password_hash | TEXT         | NOT NULL                         |
| phone         | VARCHAR(20)  |                                  |
| is_active     | BOOLEAN      | NOT NULL, default true           |
| last_login_at | TIMESTAMP    |                                  |
| teacher_id    | UUID (FK)    | NULLABLE                         |
| student_id    | UUID (FK)    | NULLABLE                         |
| guardian_id   | UUID (FK)    | NULLABLE                         |
| created_at    | TIMESTAMP    | NOT NULL                         |
| updated_at    | TIMESTAMP    | NOT NULL                         |

**CHECK:** At most one of `teacher_id`, `student_id`, `guardian_id` is non-null:
```sql
CHECK (
  (CASE WHEN teacher_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN student_id IS NOT NULL THEN 1 ELSE 0 END +
   CASE WHEN guardian_id IS NOT NULL THEN 1 ELSE 0 END) <= 1
)
```

**Design note:** `email` is globally unique. A person needing access to multiple schools should use one account and be assigned roles per school via `user_roles`. This keeps authentication simple (single login) and avoids duplicate identity issues.

### roles

| Column    | Type         | Constraints                      |
| --------- | ------------ | -------------------------------- |
| id        | UUID         | PK                               |
| school_id | UUID (FK)    | NULLABLE (null for global roles) |
| name      | VARCHAR(100) | NOT NULL                         |

**Unique:** (school_id, name)

**Seed roles:** super_admin, school_admin, principal, teacher, student, guardian, accountant

### permissions

| Column | Type         | Constraints          |
| ------ | ------------ | -------------------- |
| id     | UUID         | PK                   |
| module | VARCHAR(100) | NOT NULL             |
| action | VARCHAR(50)  | NOT NULL             |
| name   | VARCHAR(150) | UNIQUE, NOT NULL     |

**Note:** This is a global lookup table. No `school_id` because permissions are system-defined, not tenant-defined.

**Examples:** `students.view`, `students.create`, `attendance.record`, `grades.publish`

### role_permissions

| Column        | Type      | Constraints |
| ------------- | --------- | ----------- |
| id            | UUID      | PK          |
| role_id       | UUID (FK) | NOT NULL    |
| permission_id | UUID (FK) | NOT NULL    |

**Unique:** (role_id, permission_id)

### user_roles

| Column    | Type      | Constraints |
| --------- | --------- | ----------- |
| id        | UUID      | PK          |
| user_id   | UUID (FK) | NOT NULL    |
| role_id   | UUID (FK) | NOT NULL    |
| school_id | UUID (FK) | NULLABLE    |

**Unique:** (user_id, role_id, school_id)

**Note:** `school_id` here enables multi-school access. A user can have `teacher` role at School A and `guardian` role at School B.

---

## 3. Academic Structure

### academic_years

| Column     | Type        | Constraints                 |
| ---------- | ----------- | --------------------------- |
| id         | UUID        | PK                          |
| school_id  | UUID (FK)   | NOT NULL                    |
| name       | VARCHAR(50) | NOT NULL                    |
| start_date | DATE        | NOT NULL                    |
| end_date   | DATE        | NOT NULL                    |
| is_active  | BOOLEAN     | NOT NULL, default false     |

**Unique:** (school_id, name)
**Check:** end_date > start_date
**Partial unique index:** Only one `is_active = true` per `school_id`:
```sql
CREATE UNIQUE INDEX idx_one_active_year ON academic_years (school_id) WHERE is_active = true;
```

### terms

| Column           | Type         | Constraints |
| ---------------- | ------------ | ----------- |
| id               | UUID         | PK          |
| school_id        | UUID (FK)    | NOT NULL    |
| academic_year_id | UUID (FK)    | NOT NULL    |
| name             | VARCHAR(100) | NOT NULL    |
| start_date       | DATE         | NOT NULL    |
| end_date         | DATE         | NOT NULL    |
| order_index      | SMALLINT     | NOT NULL    |

**Unique:** (school_id, academic_year_id, name)
**Check:** end_date > start_date

### departments

| Column          | Type         | Constraints |
| --------------- | ------------ | ----------- |
| id              | UUID         | PK          |
| school_id       | UUID (FK)    | NOT NULL    |
| name            | VARCHAR(100) | NOT NULL    |
| head_teacher_id | UUID (FK)    | NULLABLE    |

**Unique:** (school_id, name)

**Circular FK note:** `departments.head_teacher_id` references `teachers.id`, and `teachers.department_id` references `departments.id`. To resolve insertion order: insert department first with `head_teacher_id = NULL`, insert teachers with `department_id`, then update department's `head_teacher_id`. Alternatively, use a `DEFERRABLE INITIALLY DEFERRED` constraint.

### grades

| Column      | Type        | Constraints |
| ----------- | ----------- | ----------- |
| id          | UUID        | PK          |
| school_id   | UUID (FK)   | NOT NULL    |
| name        | VARCHAR(50) | NOT NULL    |
| level_order | SMALLINT    | NOT NULL    |

**Unique:** (school_id, name)
**Unique:** (school_id, level_order)

### class_sections

| Column              | Type        | Constraints |
| ------------------- | ----------- | ----------- |
| id                  | UUID        | PK          |
| school_id           | UUID (FK)   | NOT NULL    |
| academic_year_id    | UUID (FK)   | NOT NULL    |
| grade_id            | UUID (FK)   | NOT NULL    |
| name                | VARCHAR(20) | NOT NULL    |
| capacity            | SMALLINT    | NOT NULL    |
| homeroom_teacher_id | UUID (FK)   | NULLABLE    |

**Unique:** (school_id, academic_year_id, **grade_id**, name)

**v2 fix:** Previous version used `(school_id, academic_year_id, name)` which incorrectly prevented sections like "1A" from existing in both Grade 1 and Grade 10 in the same academic year. Adding `grade_id` scopes the uniqueness correctly.

### subjects

| Column      | Type         | Constraints             |
| ----------- | ------------ | ----------------------- |
| id          | UUID         | PK                      |
| school_id   | UUID (FK)    | NOT NULL                |
| name        | VARCHAR(100) | NOT NULL                |
| code        | VARCHAR(20)  | NOT NULL                |
| is_lab      | BOOLEAN      | NOT NULL, default false |
| is_elective | BOOLEAN      | NOT NULL, default false |

**Unique:** (school_id, code)

### subject_grades

| Column     | Type      | Constraints |
| ---------- | --------- | ----------- |
| id         | UUID      | PK          |
| school_id  | UUID (FK) | NOT NULL    |
| subject_id | UUID (FK) | NOT NULL    |
| grade_id   | UUID (FK) | NOT NULL    |

**Unique:** (school_id, subject_id, grade_id)

---

## 4. Students

### students

| Column         | Type         | Constraints                                            |
| -------------- | ------------ | ------------------------------------------------------ |
| id             | UUID         | PK                                                     |
| school_id      | UUID (FK)    | NOT NULL                                               |
| student_code   | VARCHAR(30)  | NOT NULL                                               |
| first_name     | VARCHAR(100) | NOT NULL                                               |
| last_name      | VARCHAR(100) | NOT NULL                                               |
| date_of_birth  | DATE         | NOT NULL                                               |
| gender         | VARCHAR(10)  | NOT NULL, CHECK IN (male, female)                      |
| national_id    | VARCHAR(30)  |                                                        |
| nationality    | VARCHAR(50)  |                                                        |
| religion       | VARCHAR(50)  |                                                        |
| blood_type     | VARCHAR(5)   | CHECK IN (A+, A-, B+, B-, AB+, AB-, O+, O-)           |
| address        | TEXT         |                                                        |
| phone          | VARCHAR(20)  |                                                        |
| email          | VARCHAR(255) |                                                        |
| photo_url      | TEXT         |                                                        |
| medical_notes  | TEXT         |                                                        |
| admission_date | DATE         | NOT NULL                                               |
| status         | VARCHAR(20)  | NOT NULL, CHECK IN (active, graduated, withdrawn, suspended, transferred) |
| deleted_at     | TIMESTAMP    |                                                        |

**Unique:** (school_id, student_code)

### guardians

| Column      | Type         | Constraints |
| ----------- | ------------ | ----------- |
| id          | UUID         | PK          |
| school_id   | UUID (FK)    | NOT NULL    |
| first_name  | VARCHAR(100) | NOT NULL    |
| last_name   | VARCHAR(100) | NOT NULL    |
| phone       | VARCHAR(20)  | NOT NULL    |
| email       | VARCHAR(255) |             |
| national_id | VARCHAR(30)  |             |
| occupation  | VARCHAR(100) |             |
| address     | TEXT         |             |
| deleted_at  | TIMESTAMP    |             |

### student_guardians

| Column               | Type        | Constraints                                                               |
| -------------------- | ----------- | ------------------------------------------------------------------------- |
| id                   | UUID        | PK                                                                        |
| school_id            | UUID (FK)   | NOT NULL                                                                  |
| student_id           | UUID (FK)   | NOT NULL                                                                  |
| guardian_id          | UUID (FK)   | NOT NULL                                                                  |
| relationship_type    | VARCHAR(20) | NOT NULL, CHECK IN (father, mother, brother, sister, uncle, aunt, grandparent, other) |
| is_primary           | BOOLEAN     | NOT NULL, default false                                                   |
| is_emergency_contact | BOOLEAN     | NOT NULL, default false                                                   |

**Unique:** (school_id, student_id, guardian_id)

### student_enrollments

| Column           | Type        | Constraints                                               |
| ---------------- | ----------- | --------------------------------------------------------- |
| id               | UUID        | PK                                                        |
| school_id        | UUID (FK)   | NOT NULL                                                  |
| student_id       | UUID (FK)   | NOT NULL                                                  |
| class_section_id | UUID (FK)   | NOT NULL                                                  |
| academic_year_id | UUID (FK)   | NOT NULL                                                  |
| enrolled_at      | TIMESTAMP   | NOT NULL                                                  |
| status           | VARCHAR(20) | NOT NULL, CHECK IN (active, withdrawn, transferred, promoted) |
| withdrawn_at     | TIMESTAMP   |                                                           |
| notes            | TEXT        |                                                           |

**Unique:** (school_id, student_id, academic_year_id)

---

## 5. Teachers

### teachers

| Column         | Type         | Constraints                                                  |
| -------------- | ------------ | ------------------------------------------------------------ |
| id             | UUID         | PK                                                           |
| school_id      | UUID (FK)    | NOT NULL                                                     |
| department_id  | UUID (FK)    | NULLABLE                                                     |
| teacher_code   | VARCHAR(30)  | NOT NULL                                                     |
| first_name     | VARCHAR(100) | NOT NULL                                                     |
| last_name      | VARCHAR(100) | NOT NULL                                                     |
| gender         | VARCHAR(10)  | NOT NULL, CHECK IN (male, female)                            |
| national_id    | VARCHAR(30)  |                                                              |
| phone          | VARCHAR(20)  |                                                              |
| email          | VARCHAR(255) |                                                              |
| specialization | VARCHAR(100) |                                                              |
| qualification  | VARCHAR(100) |                                                              |
| photo_url      | TEXT         |                                                              |
| hire_date      | DATE         | NOT NULL                                                     |
| status         | VARCHAR(20)  | NOT NULL, CHECK IN (active, on_leave, resigned, terminated)  |
| deleted_at     | TIMESTAMP    |                                                              |

**Unique:** (school_id, teacher_code)

### teacher_subjects

| Column     | Type      | Constraints |
| ---------- | --------- | ----------- |
| id         | UUID      | PK          |
| school_id  | UUID (FK) | NOT NULL    |
| teacher_id | UUID (FK) | NOT NULL    |
| subject_id | UUID (FK) | NOT NULL    |

**Unique:** (school_id, teacher_id, subject_id)

### class_subject_requirements

| Column                  | Type      | Constraints |
| ----------------------- | --------- | ----------- |
| id                      | UUID      | PK          |
| school_id               | UUID (FK) | NOT NULL    |
| academic_year_id        | UUID (FK) | NOT NULL    |
| class_section_id        | UUID (FK) | NOT NULL    |
| subject_id              | UUID (FK) | NOT NULL    |
| weekly_lessons_required | SMALLINT  | NOT NULL    |

**Unique:** (school_id, academic_year_id, class_section_id, subject_id)
**Check:** weekly_lessons_required > 0

---

## 6. Time Modeling

### period_sets

| Column           | Type         | Constraints |
| ---------------- | ------------ | ----------- |
| id               | UUID         | PK          |
| school_id        | UUID (FK)    | NOT NULL    |
| academic_year_id | UUID (FK)    | NOT NULL    |
| name             | VARCHAR(50)  | NOT NULL, default 'Default' |

**Unique:** (school_id, academic_year_id, name)

**v2 fix:** Periods are now grouped by academic year via `period_sets`. This allows bell schedule changes between years without corrupting historical timetables. A school that never changes schedules simply has one period_set per year with identical data.

### school_working_days

| Column           | Type      | Constraints                      |
| ---------------- | --------- | -------------------------------- |
| id               | UUID      | PK                               |
| school_id        | UUID (FK) | NOT NULL                         |
| period_set_id    | UUID (FK) | NOT NULL                         |
| day_of_week      | SMALLINT  | NOT NULL, CHECK BETWEEN 0 AND 6  |
| is_active        | BOOLEAN   | NOT NULL, default true           |

**Unique:** (school_id, period_set_id, day_of_week)

### periods

| Column        | Type        | Constraints             |
| ------------- | ----------- | ----------------------- |
| id            | UUID        | PK                      |
| school_id     | UUID (FK)   | NOT NULL                |
| period_set_id | UUID (FK)   | NOT NULL                |
| name          | VARCHAR(50) | NOT NULL                |
| start_time    | TIME        | NOT NULL                |
| end_time      | TIME        | NOT NULL                |
| order_index   | SMALLINT    | NOT NULL                |
| is_break      | BOOLEAN     | NOT NULL, default false |

**Unique:** (school_id, period_set_id, order_index)
**Check:** end_time > start_time

### time_slots

| Column      | Type      | Constraints                     |
| ----------- | --------- | ------------------------------- |
| id          | UUID      | PK                              |
| school_id   | UUID (FK) | NOT NULL                        |
| day_of_week | SMALLINT  | NOT NULL, CHECK BETWEEN 0 AND 6 |
| period_id   | UUID (FK) | NOT NULL                        |

**Unique:** (school_id, day_of_week, period_id)

**Note:** `time_slots` inherits year-awareness through `period_id`, which belongs to a `period_set` tied to a specific academic year.

---

## 7. Rooms

### rooms

| Column    | Type        | Constraints                                                    |
| --------- | ----------- | -------------------------------------------------------------- |
| id        | UUID        | PK                                                             |
| school_id | UUID (FK)   | NOT NULL                                                       |
| name      | VARCHAR(50) | NOT NULL                                                       |
| building  | VARCHAR(50) |                                                                |
| floor     | VARCHAR(20) |                                                                |
| capacity  | SMALLINT    | NOT NULL                                                       |
| room_type | VARCHAR(20) | NOT NULL, CHECK IN (classroom, lab, hall, library, gym, office) |

**Unique:** (school_id, name)

### room_subject_suitability

| Column     | Type      | Constraints |
| ---------- | --------- | ----------- |
| id         | UUID      | PK          |
| school_id  | UUID (FK) | NOT NULL    |
| room_id    | UUID (FK) | NOT NULL    |
| subject_id | UUID (FK) | NOT NULL    |

**Unique:** (school_id, room_id, subject_id)

**Note:** Only needed for specialized rooms (labs). If no entries exist for a room, it is assumed suitable for any subject.

---

## 8. Scheduling Core

### lessons

| Column           | Type        | Constraints                                        |
| ---------------- | ----------- | -------------------------------------------------- |
| id               | UUID        | PK                                                 |
| school_id        | UUID (FK)   | NOT NULL                                           |
| academic_year_id | UUID (FK)   | NOT NULL                                           |
| term_id          | UUID (FK)   | NOT NULL                                           |
| class_section_id | UUID (FK)   | NOT NULL                                           |
| subject_id       | UUID (FK)   | NOT NULL                                           |
| teacher_id       | UUID (FK)   | NOT NULL                                           |
| room_id          | UUID (FK)   | NOT NULL                                           |
| time_slot_id     | UUID (FK)   | NOT NULL                                           |
| status           | VARCHAR(20) | NOT NULL, CHECK IN (scheduled, cancelled, moved)   |

**Unique Constraints (prevent double-booking):**

These use partial unique indexes to exclude cancelled lessons, so a cancelled slot can be reused:

```sql
CREATE UNIQUE INDEX idx_teacher_no_conflict
  ON lessons (school_id, teacher_id, time_slot_id, term_id)
  WHERE status != 'cancelled';

CREATE UNIQUE INDEX idx_class_no_conflict
  ON lessons (school_id, class_section_id, time_slot_id, term_id)
  WHERE status != 'cancelled';

CREATE UNIQUE INDEX idx_room_no_conflict
  ON lessons (school_id, room_id, time_slot_id, term_id)
  WHERE status != 'cancelled';
```

**v2 fix:** Previous version used plain unique constraints, which meant cancelling a lesson still blocked the time slot from being reassigned.

### substitutions

| Column                | Type      | Constraints |
| --------------------- | --------- | ----------- |
| id                    | UUID      | PK          |
| school_id             | UUID (FK) | NOT NULL    |
| lesson_id             | UUID (FK) | NOT NULL    |
| original_teacher_id   | UUID (FK) | NOT NULL    |
| substitute_teacher_id | UUID (FK) | NOT NULL    |
| date                  | DATE      | NOT NULL    |
| reason                | TEXT      |             |
| approved_by           | UUID (FK) | NULLABLE    |

**Unique:** (school_id, lesson_id, date)
**Check:** original_teacher_id != substitute_teacher_id

**Note:** To prevent double-booking the substitute teacher, use application-level validation. A DB-level check would require checking all lessons for that teacher on that day/time_slot, which is impractical in a single constraint. The application must verify the substitute teacher has no conflicting lesson or substitution at the same time_slot on that date.

---

## 9. Availability & Leaves

### teacher_availability

| Column       | Type      | Constraints                     |
| ------------ | --------- | ------------------------------- |
| id           | UUID      | PK                              |
| school_id    | UUID (FK) | NOT NULL                        |
| teacher_id   | UUID (FK) | NOT NULL                        |
| day_of_week  | SMALLINT  | NOT NULL, CHECK BETWEEN 0 AND 6 |
| period_id    | UUID (FK) | NOT NULL                        |
| is_available | BOOLEAN   | NOT NULL, default true          |

**Unique:** (school_id, teacher_id, day_of_week, period_id)

### teacher_leaves

| Column      | Type        | Constraints                                                                  |
| ----------- | ----------- | ---------------------------------------------------------------------------- |
| id          | UUID        | PK                                                                           |
| school_id   | UUID (FK)   | NOT NULL                                                                     |
| teacher_id  | UUID (FK)   | NOT NULL                                                                     |
| leave_type  | VARCHAR(20) | NOT NULL, CHECK IN (sick, personal, maternity, paternity, annual, unpaid, other) |
| date_from   | DATE        | NOT NULL                                                                     |
| date_to     | DATE        | NOT NULL                                                                     |
| reason      | TEXT        |                                                                              |
| status      | VARCHAR(20) | NOT NULL, CHECK IN (pending, approved, rejected, cancelled)                  |
| approved_by | UUID (FK)   | NULLABLE (FK to users)                                                       |
| approved_at | TIMESTAMP   |                                                                              |

**Check:** date_to >= date_from

---

## 10. Attendance

### student_attendance

| Column           | Type        | Constraints                                        |
| ---------------- | ----------- | -------------------------------------------------- |
| id               | UUID        | PK                                                 |
| school_id        | UUID (FK)   | NOT NULL                                           |
| student_id       | UUID (FK)   | NOT NULL                                           |
| class_section_id | UUID (FK)   | NOT NULL                                           |
| date             | DATE        | NOT NULL                                           |
| lesson_id        | UUID (FK)   | NULLABLE                                           |
| status           | VARCHAR(10) | NOT NULL, CHECK IN (present, absent, late, excused) |
| recorded_by      | UUID (FK)   | NOT NULL (FK to users)                             |
| notes            | TEXT        |                                                    |

**Unique (daily mode):** Partial unique index when `lesson_id IS NULL`:
```sql
CREATE UNIQUE INDEX idx_daily_attendance
  ON student_attendance (school_id, student_id, date)
  WHERE lesson_id IS NULL;
```

**Unique (per-lesson mode):** Partial unique index when `lesson_id IS NOT NULL`:
```sql
CREATE UNIQUE INDEX idx_lesson_attendance
  ON student_attendance (school_id, student_id, date, lesson_id)
  WHERE lesson_id IS NOT NULL;
```

**v2 fix:** Previous version only supported daily attendance. Now supports both daily and per-lesson attendance. Schools choose their mode. Daily mode sets `lesson_id = NULL` and records one row per student per day. Per-lesson mode sets `lesson_id` and records one row per student per lesson.

### teacher_attendance

| Column     | Type        | Constraints                                              |
| ---------- | ----------- | -------------------------------------------------------- |
| id         | UUID        | PK                                                       |
| school_id  | UUID (FK)   | NOT NULL                                                 |
| teacher_id | UUID (FK)   | NOT NULL                                                 |
| date       | DATE        | NOT NULL                                                 |
| check_in   | TIME        |                                                          |
| check_out  | TIME        |                                                          |
| status     | VARCHAR(10) | NOT NULL, CHECK IN (present, absent, late, on_leave)     |

**Unique:** (school_id, teacher_id, date)

---

## 11. Exams & Grading

### grading_scales

| Column    | Type        | Constraints |
| --------- | ----------- | ----------- |
| id        | UUID        | PK          |
| school_id | UUID (FK)   | NOT NULL    |
| name      | VARCHAR(50) | NOT NULL    |

**Unique:** (school_id, name)

### grading_scale_levels

| Column           | Type         | Constraints |
| ---------------- | ------------ | ----------- |
| id               | UUID         | PK          |
| grading_scale_id | UUID (FK)    | NOT NULL    |
| letter           | VARCHAR(5)   | NOT NULL    |
| min_score        | DECIMAL(5,2) | NOT NULL    |
| max_score        | DECIMAL(5,2) | NOT NULL    |
| gpa_points       | DECIMAL(3,2) |             |
| order_index      | SMALLINT     | NOT NULL    |

**Check:** max_score > min_score

**Convention exception:** No `school_id` here. This table is only accessible via `grading_scales`, which already carries `school_id`. Adding it would be redundant.

### exams

| Column           | Type         | Constraints                                                    |
| ---------------- | ------------ | -------------------------------------------------------------- |
| id               | UUID         | PK                                                             |
| school_id        | UUID (FK)    | NOT NULL                                                       |
| academic_year_id | UUID (FK)    | NOT NULL                                                       |
| term_id          | UUID (FK)    | NOT NULL                                                       |
| grading_scale_id | UUID (FK)    | NOT NULL                                                       |
| name             | VARCHAR(100) | NOT NULL                                                       |
| exam_type        | VARCHAR(20)  | NOT NULL, CHECK IN (quiz, midterm, final, assignment, practical) |
| weight           | DECIMAL(5,2) | NOT NULL, default 100.00                                       |
| start_date       | DATE         |                                                                |
| end_date         | DATE         |                                                                |

**v2 fix:** Added `grading_scale_id` so the system knows which scale to use when auto-computing grade letters. Added `weight` for weighted average calculations across multiple exams in a term.

### exam_subjects

| Column     | Type         | Constraints |
| ---------- | ------------ | ----------- |
| id         | UUID         | PK          |
| school_id  | UUID (FK)    | NOT NULL    |
| exam_id    | UUID (FK)    | NOT NULL    |
| subject_id | UUID (FK)    | NOT NULL    |
| grade_id   | UUID (FK)    | NOT NULL    |
| max_score  | DECIMAL(5,2) | NOT NULL    |
| pass_score | DECIMAL(5,2) |             |
| exam_date  | DATE         |             |
| exam_time  | TIME         |             |

**Unique:** (school_id, exam_id, subject_id, grade_id)
**Check:** max_score > 0
**Check:** pass_score IS NULL OR (pass_score >= 0 AND pass_score <= max_score)

### student_grades

| Column          | Type         | Constraints            |
| --------------- | ------------ | ---------------------- |
| id              | UUID         | PK                     |
| school_id       | UUID (FK)    | NOT NULL               |
| student_id      | UUID (FK)    | NOT NULL               |
| exam_subject_id | UUID (FK)    | NOT NULL               |
| score           | DECIMAL(5,2) | NOT NULL               |
| grade_letter    | VARCHAR(5)   |                        |
| graded_by       | UUID (FK)    | NOT NULL (FK to users) |
| graded_at       | TIMESTAMP    | NOT NULL               |
| notes           | TEXT         |                        |

**Unique:** (school_id, student_id, exam_subject_id)
**Check:** score >= 0

**Note:** `grade_letter` is computed by the application using the exam's `grading_scale_id` and stored for snapshot purposes.

### report_card_snapshots

| Column           | Type         | Constraints            |
| ---------------- | ------------ | ---------------------- |
| id               | UUID         | PK                     |
| school_id        | UUID (FK)    | NOT NULL               |
| student_id       | UUID (FK)    | NOT NULL               |
| academic_year_id | UUID (FK)    | NOT NULL               |
| term_id          | UUID (FK)    | NOT NULL               |
| class_section_id | UUID (FK)    | NOT NULL               |
| snapshot_data    | JSONB        | NOT NULL               |
| overall_gpa      | DECIMAL(3,2) |                        |
| overall_percentage | DECIMAL(5,2) |                      |
| rank_in_class    | SMALLINT     |                        |
| teacher_remarks  | TEXT         |                        |
| generated_by     | UUID (FK)    | NOT NULL (FK to users) |
| generated_at     | TIMESTAMP    | NOT NULL               |

**Unique:** (school_id, student_id, term_id)

**Note:** `snapshot_data` (JSONB) stores the full term grades breakdown at generation time, making report cards immutable regardless of future grade edits. Structure:
```json
{
  "subjects": [
    {
      "subject_name": "Mathematics",
      "exams": [
        { "exam_name": "Midterm", "score": 85, "max": 100, "weight": 40 }
      ],
      "final_score": 87.5,
      "grade_letter": "A"
    }
  ]
}
```

---

## 12. Fees & Billing

### fee_categories

| Column    | Type         | Constraints |
| --------- | ------------ | ----------- |
| id        | UUID         | PK          |
| school_id | UUID (FK)    | NOT NULL    |
| name      | VARCHAR(100) | NOT NULL    |

**Unique:** (school_id, name)

**Examples:** Tuition, Transportation, Books, Lab Fees, Activities

### fee_structures

| Column           | Type          | Constraints                                           |
| ---------------- | ------------- | ----------------------------------------------------- |
| id               | UUID          | PK                                                    |
| school_id        | UUID (FK)     | NOT NULL                                              |
| academic_year_id | UUID (FK)     | NOT NULL                                              |
| grade_id         | UUID (FK)     | NOT NULL                                              |
| fee_category_id  | UUID (FK)     | NOT NULL                                              |
| name             | VARCHAR(100)  | NOT NULL                                              |
| amount           | DECIMAL(10,2) | NOT NULL                                              |
| due_date         | DATE          |                                                       |
| is_recurring     | BOOLEAN       | NOT NULL, default false                               |
| recurrence       | VARCHAR(20)   | CHECK IN (monthly, quarterly, term, annual)           |

**Check:** `(is_recurring = false AND recurrence IS NULL) OR (is_recurring = true AND recurrence IS NOT NULL)`

**v2 fix:** Added CHECK to prevent inconsistent state where `is_recurring = false` but `recurrence` is set.

### fee_discounts

| Column           | Type          | Constraints              |
| ---------------- | ------------- | ------------------------ |
| id               | UUID          | PK                       |
| school_id        | UUID (FK)     | NOT NULL                 |
| student_id       | UUID (FK)     | NOT NULL                 |
| fee_structure_id | UUID (FK)     | NOT NULL                 |
| discount_type    | VARCHAR(15)   | NOT NULL, CHECK IN (percentage, fixed) |
| amount           | DECIMAL(10,2) | NOT NULL                 |
| reason           | TEXT          |                          |
| approved_by      | UUID (FK)     | NULLABLE                 |

**Unique:** (school_id, student_id, fee_structure_id)
**Check:** amount > 0
**Check:** If `discount_type = 'percentage'` THEN `amount <= 100`

**v2 fix:** Added unique constraint to prevent duplicate discounts for the same student and fee structure.

### fee_invoices

| Column          | Type          | Constraints                                                                     |
| --------------- | ------------- | ------------------------------------------------------------------------------- |
| id              | UUID          | PK                                                                              |
| school_id       | UUID (FK)     | NOT NULL                                                                        |
| student_id      | UUID (FK)     | NOT NULL                                                                        |
| invoice_number  | VARCHAR(30)   | NOT NULL                                                                        |
| total_amount    | DECIMAL(10,2) | NOT NULL                                                                        |
| discount_amount | DECIMAL(10,2) | NOT NULL, default 0                                                             |
| net_amount      | DECIMAL(10,2) | NOT NULL                                                                        |
| status          | VARCHAR(20)   | NOT NULL, CHECK IN (draft, issued, partially_paid, paid, overdue, cancelled)    |
| issued_at       | TIMESTAMP     |                                                                                 |
| due_date        | DATE          | NOT NULL                                                                        |

**Unique:** (school_id, invoice_number)
**Check:** net_amount = total_amount - discount_amount
**Check:** net_amount >= 0

### fee_invoice_items

| Column           | Type          | Constraints |
| ---------------- | ------------- | ----------- |
| id               | UUID          | PK          |
| school_id        | UUID (FK)     | NOT NULL    |
| invoice_id       | UUID (FK)     | NOT NULL    |
| fee_structure_id | UUID (FK)     | NOT NULL    |
| description      | VARCHAR(255)  |             |
| quantity         | SMALLINT      | NOT NULL, default 1 |
| unit_amount      | DECIMAL(10,2) | NOT NULL    |
| total_amount     | DECIMAL(10,2) | NOT NULL    |

**Check:** quantity > 0
**Check:** total_amount = unit_amount * quantity

**v2 fix:** Added `school_id`, `quantity`, `unit_amount`, `description`, and computed `total_amount`. Previous version had only `amount` with no breakdown capability.

### fee_payments

| Column           | Type          | Constraints                                                    |
| ---------------- | ------------- | -------------------------------------------------------------- |
| id               | UUID          | PK                                                             |
| school_id        | UUID (FK)     | NOT NULL                                                       |
| invoice_id       | UUID (FK)     | NOT NULL                                                       |
| amount_paid      | DECIMAL(10,2) | NOT NULL                                                       |
| payment_date     | DATE          | NOT NULL                                                       |
| payment_method   | VARCHAR(20)   | NOT NULL, CHECK IN (cash, bank_transfer, card, cheque, online) |
| reference_number | VARCHAR(50)   |                                                                |
| received_by      | UUID (FK)     | NOT NULL (FK to users)                                         |
| notes            | TEXT          |                                                                |

**Check:** amount_paid > 0

---

## 13. Communication

### announcements

| Column       | Type         | Constraints |
| ------------ | ------------ | ----------- |
| id           | UUID         | PK          |
| school_id    | UUID (FK)    | NOT NULL    |
| title        | VARCHAR(255) | NOT NULL    |
| body         | TEXT         | NOT NULL    |
| published_by | UUID (FK)    | NOT NULL    |
| published_at | TIMESTAMP    |             |
| expires_at   | TIMESTAMP    |             |
| is_draft     | BOOLEAN      | NOT NULL, default true |

### announcement_targets

| Column              | Type        | Constraints                                              |
| ------------------- | ----------- | -------------------------------------------------------- |
| id                  | UUID        | PK                                                       |
| announcement_id     | UUID (FK)   | NOT NULL                                                 |
| target_type         | VARCHAR(20) | NOT NULL, CHECK IN (all, role, grade, class_section)     |
| target_role_id      | UUID (FK)   | NULLABLE                                                 |
| target_grade_id     | UUID (FK)   | NULLABLE                                                 |
| target_class_section_id | UUID (FK) | NULLABLE                                               |

**Check:** Exactly one target reference is set based on `target_type`:
- `target_type = 'all'`: all target FKs are NULL
- `target_type = 'role'`: only `target_role_id` is NOT NULL
- `target_type = 'grade'`: only `target_grade_id` is NOT NULL
- `target_type = 'class_section'`: only `target_class_section_id` is NOT NULL

**v2 fix:** Previous version used a single ENUM + nullable FKs on the announcement itself, which could only target one audience. Now uses a junction table, so one announcement can target Grade 3, Grade 4, and the "guardians" role simultaneously.

### notifications

| Column   | Type         | Constraints                                     |
| -------- | ------------ | ----------------------------------------------- |
| id       | UUID         | PK                                              |
| school_id| UUID (FK)    | NOT NULL                                        |
| user_id  | UUID (FK)    | NOT NULL                                        |
| title    | VARCHAR(255) | NOT NULL                                        |
| body     | TEXT         | NOT NULL                                        |
| channel  | VARCHAR(10)  | NOT NULL, CHECK IN (in_app, sms, email, push)   |
| is_read  | BOOLEAN      | NOT NULL, default false                         |
| read_at  | TIMESTAMP    |                                                 |
| sent_at  | TIMESTAMP    | NOT NULL                                        |

**Note:** If a notification is sent via multiple channels, create one row per channel. This keeps delivery tracking simple and allows per-channel retry logic.

---

## 14. Calendar & Events

### academic_events

| Column           | Type         | Constraints                                                              |
| ---------------- | ------------ | ------------------------------------------------------------------------ |
| id               | UUID         | PK                                                                       |
| school_id        | UUID (FK)    | NOT NULL                                                                 |
| academic_year_id | UUID (FK)    | NOT NULL                                                                 |
| title            | VARCHAR(255) | NOT NULL                                                                 |
| description      | TEXT         |                                                                          |
| event_type       | VARCHAR(20)  | NOT NULL, CHECK IN (holiday, exam_period, meeting, activity, ceremony, other) |
| start_date       | DATE         | NOT NULL                                                                 |
| end_date         | DATE         | NOT NULL                                                                 |
| is_school_closed | BOOLEAN      | NOT NULL, default false                                                  |

**Check:** end_date >= start_date

---

## 15. Audit Log

### audit_logs

| Column       | Type         | Constraints |
| ------------ | ------------ | ----------- |
| id           | UUID         | PK          |
| school_id    | UUID (FK)    | NOT NULL    |
| user_id      | UUID (FK)    | NULLABLE    |
| table_name   | VARCHAR(100) | NOT NULL    |
| record_id    | UUID         | NOT NULL    |
| action       | VARCHAR(10)  | NOT NULL, CHECK IN (INSERT, UPDATE, DELETE) |
| old_values   | JSONB        |             |
| new_values   | JSONB        |             |
| ip_address   | VARCHAR(45)  |             |
| user_agent   | TEXT         |             |
| created_at   | TIMESTAMP    | NOT NULL    |

**Note:** This is an append-only table. No updates or deletes allowed. Implement via database triggers on critical tables (student_grades, fee_payments, fee_invoices, lessons) or application-level middleware.

**Partitioning recommendation:** Partition by `created_at` (monthly) to manage table size.

---

## Entity Relationship Summary

```
schools
  |
  |-- academic_years
  |     |-- terms
  |     |-- class_sections --> grades, teachers (homeroom)
  |     |-- class_subject_requirements --> class_sections, subjects
  |     |-- exams --> terms, grading_scales
  |     |-- student_enrollments --> students, class_sections
  |     |-- academic_events
  |     |-- period_sets
  |           |-- school_working_days
  |           |-- periods
  |                 |-- time_slots
  |
  |-- departments <--> teachers (circular, deferred)
  |
  |-- grades
  |     |-- subject_grades --> subjects
  |
  |-- students
  |     |-- student_guardians --> guardians
  |     |-- student_enrollments
  |     |-- student_attendance (daily or per-lesson)
  |     |-- student_grades --> exam_subjects
  |     |-- report_card_snapshots
  |     |-- fee_invoices --> fee_invoice_items, fee_payments
  |     |-- fee_discounts
  |
  |-- teachers
  |     |-- teacher_subjects --> subjects
  |     |-- teacher_availability
  |     |-- teacher_leaves
  |     |-- teacher_attendance
  |     |-- lessons
  |     |-- substitutions (original + substitute)
  |
  |-- rooms
  |     |-- room_subject_suitability --> subjects
  |     |-- lessons
  |
  |-- lessons --> class_sections, subjects, teachers, rooms, time_slots
  |
  |-- users --> teachers, students, guardians
  |     |-- user_roles --> roles --> role_permissions --> permissions
  |
  |-- grading_scales --> grading_scale_levels
  |-- fee_categories --> fee_structures
  |-- announcements --> announcement_targets
  |-- notifications --> users
  |-- audit_logs
```

---

## Key Indexes (Beyond PKs and Unique Constraints)

| Table                | Index Columns                             | Purpose                   |
| -------------------- | ----------------------------------------- | ------------------------- |
| students             | (school_id, status)                       | Active student lookups    |
| students             | (school_id, deleted_at)                   | Soft delete filtering     |
| student_enrollments  | (school_id, class_section_id, status)     | Class roster queries      |
| student_attendance   | (school_id, class_section_id, date)       | Daily attendance sheet    |
| student_grades       | (school_id, student_id)                   | Student report card       |
| lessons              | (school_id, term_id, class_section_id)    | Class timetable view      |
| lessons              | (school_id, term_id, teacher_id)          | Teacher timetable view    |
| teacher_leaves       | (school_id, teacher_id, status)           | Active leave requests     |
| fee_invoices         | (school_id, student_id, status)           | Outstanding invoices      |
| fee_payments         | (school_id, payment_date)                 | Financial reports by date |
| notifications        | (user_id, is_read)                        | Unread notification count |
| audit_logs           | (school_id, table_name, record_id)        | Record history lookup     |
| audit_logs           | (school_id, created_at)                   | Time-based audit queries  |

---

## Architectural Principles

1. **Tenant isolation**: All tenant-bound tables include `school_id`. Row-Level Security (RLS) policies enforce isolation at the database level. Application layer always includes `school_id` in WHERE clauses as defense-in-depth.

2. **Audit trail**: All tables carry `created_at`, `updated_at`, `created_by`, `updated_by`. Critical tables (student_grades, fee_payments, fee_invoices, lessons) additionally log changes to `audit_logs` via triggers.

3. **Soft deletes**: Major entities (students, teachers, guardians) use `deleted_at` instead of hard deletes. Application queries filter `WHERE deleted_at IS NULL` by default. Junction tables do not need soft deletes; remove the row instead.

4. **Immutable records**: Published report card snapshots, completed payments, and audit logs are append-only. Grade corrections create new records, they do not overwrite.

5. **Separation of concerns**: Requirements (`class_subject_requirements`) are decoupled from actual scheduled lessons. Fee structures are decoupled from invoices and payments. Grading scales are decoupled from exams.

6. **Scheduling integrity**: Double-booking is prevented at the database level via partial unique indexes that exclude cancelled lessons. Substitution conflicts are validated at the application level.

7. **Year-aware time modeling**: Bell schedules (periods) are grouped into `period_sets` per academic year, ensuring historical timetables remain valid when schedules change.

8. **Scalability**: Schema supports horizontal scaling via `school_id` partitioning. No cross-tenant queries needed for normal operations. `audit_logs` should be partitioned by `created_at`.

9. **Extensibility**: Add-on modules (transport, library, hostel, inventory) can be added as new tables with `school_id` FK without modifying existing schema.

10. **Portability**: ENUMs are implemented as `VARCHAR + CHECK` constraints for cross-database compatibility (PostgreSQL, MySQL, etc.).
