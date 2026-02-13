# School Management SaaS -- API Design

> **Version:** 1.0
> **Based on:** ERD v3.0, Business Analysis v1.0
> **Base URL:** `https://api.example.com/api/v1`

---

## Conventions

### Authentication

All endpoints except `POST /auth/login` require a Bearer JWT token. The token payload contains:

```json
{
  "sub": "user-uuid",
  "schoolId": "school-uuid | null",
  "roles": ["school_admin"],
  "permissions": ["students.view", "students.create"]
}
```

The `schoolId` is extracted from the token and injected into every query as a tenant filter. Super admins (`schoolId: null`) pass `X-School-Id` header to operate on a specific school.

### Multi-Tenancy

Tenant scoping is implicit. The API never exposes `school_id` as a URL parameter. It is always derived from the authenticated user's JWT. This prevents accidental or malicious cross-tenant access.

Exception: Super admin endpoints under `/platform/schools` operate across tenants.

### Pagination

All list endpoints accept these query params and return this envelope:

```
GET /resource?page=1&limit=20&sortBy=createdAt&order=desc
```

```json
{
  "success": true,
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

### Standard Responses

```json
// Single resource
{ "success": true, "data": { ... } }

// Created (201)
{ "success": true, "data": { ... } }

// No content (204): empty body

// Error (4xx/5xx)
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": [{ "path": "email", "message": "Invalid email format" }]
  }
}
```

### Common Error Codes

| HTTP | Code | Meaning |
|---|---|---|
| 400 | BAD_REQUEST | Malformed request body or params |
| 401 | UNAUTHORIZED | Missing or invalid token |
| 403 | FORBIDDEN | Valid token but insufficient permissions |
| 404 | NOT_FOUND | Resource does not exist or is soft-deleted |
| 409 | CONFLICT | Unique constraint violation (duplicate) |
| 422 | VALIDATION_ERROR | Zod validation failed |
| 429 | RATE_LIMITED | Too many requests |

### URL Patterns

- Plural nouns for collections: `/students`, `/teachers`
- UUID for single resource: `/students/:id`
- Nested resources for tight parent-child: `/exams/:examId/subjects`
- Query params for filtering: `/students?status=active&gradeId=xxx`
- Action verbs only for non-CRUD operations: `/academic-years/:id/activate`

### Soft Deletes

`DELETE` endpoints perform soft deletes (set `deleted_at`). Soft-deleted records are excluded from all list queries by default. Pass `?includeDeleted=true` (admin only) to include them.

### Permission Notation

Each endpoint lists its required permission as `module.action`. The RBAC system checks if any of the user's roles grant that permission.

---

## Domain 1: Platform & Multi-Tenancy

### Schools (Super Admin)

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/platform/schools` | `platform.manage` | Onboard a new school |
| GET | `/platform/schools` | `platform.manage` | List all schools (with pagination, filters) |
| GET | `/platform/schools/:id` | `platform.manage` | Get school details |
| PATCH | `/platform/schools/:id` | `platform.manage` | Update school settings |
| POST | `/platform/schools/:id/suspend` | `platform.manage` | Suspend a school |
| POST | `/platform/schools/:id/reactivate` | `platform.manage` | Reactivate a suspended school |

### School Profile (School Admin)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/school/profile` | `school.view` | Get current school profile |
| PATCH | `/school/profile` | `school.update` | Update school profile (name, logo, contact) |

**`POST /platform/schools`**

```json
{
  "name": "Al Noor Academy",
  "code": "al-noor-academy",
  "timezone": "Asia/Riyadh",
  "defaultLocale": "ar",
  "currency": "SAR",
  "country": "Saudi Arabia",
  "city": "Riyadh",
  "address": "123 King Fahd Road",
  "phone": "+966501234567",
  "email": "info@alnoor.edu.sa",
  "subscriptionPlan": "premium"
}
```

---

## Domain 2: Identity & Access Management

### Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/login` | None | Login with email/password |
| POST | `/auth/refresh` | Refresh token | Refresh access token |
| POST | `/auth/logout` | Bearer | Invalidate session |
| POST | `/auth/forgot-password` | None | Request password reset email |
| POST | `/auth/reset-password` | Reset token | Reset password with token |
| GET | `/auth/me` | Bearer | Get current user profile + roles |
| PATCH | `/auth/me` | Bearer | Update own profile (email, phone, password) |

**`POST /auth/login`**

```json
// Request
{ "email": "admin@alnoor.edu.sa", "password": "..." }

// Response 200
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ...",
    "expiresIn": 3600,
    "user": {
      "id": "uuid",
      "email": "admin@alnoor.edu.sa",
      "roles": [
        { "roleId": "uuid", "roleName": "school_admin", "schoolId": "uuid", "schoolName": "Al Noor Academy" }
      ]
    }
  }
}
```

**`GET /auth/me`** -- returns the full user context including all school memberships and permissions.

If a user has roles across multiple schools, the response lists all of them. The client selects the active school context and sends it via `X-School-Id` header on subsequent requests.

### Users

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/users` | `users.create` | Create a user account |
| GET | `/users` | `users.view` | List users (filter by role, status) |
| GET | `/users/:id` | `users.view` | Get user details with roles |
| PATCH | `/users/:id` | `users.update` | Update user (email, phone, active) |
| DELETE | `/users/:id` | `users.delete` | Deactivate user account |
| POST | `/users/:id/roles` | `users.manage_roles` | Assign role to user |
| DELETE | `/users/:id/roles/:roleId` | `users.manage_roles` | Remove role from user |

**`POST /users`**

```json
{
  "email": "teacher@alnoor.edu.sa",
  "phone": "+966509876543",
  "password": "tempPassword123!",
  "teacherId": "teacher-uuid",
  "roleIds": ["teacher-role-uuid"]
}
```

### Roles & Permissions

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/roles` | `roles.create` | Create a custom role |
| GET | `/roles` | `roles.view` | List roles (includes seed + custom) |
| GET | `/roles/:id` | `roles.view` | Get role with permissions |
| PATCH | `/roles/:id` | `roles.update` | Update role name |
| DELETE | `/roles/:id` | `roles.delete` | Delete custom role (seed roles protected) |
| PUT | `/roles/:id/permissions` | `roles.manage_permissions` | Set permissions for a role (full replace) |
| GET | `/permissions` | `roles.view` | List all system permissions |

**`PUT /roles/:id/permissions`** -- replaces all permissions for the role. This avoids incremental add/remove complexity.

```json
{
  "permissionIds": ["perm-uuid-1", "perm-uuid-2", "perm-uuid-3"]
}
```

---

## Domain 3: Academic Structure

### Academic Years

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/academic-years` | `academic_years.create` | Create academic year |
| GET | `/academic-years` | `academic_years.view` | List academic years |
| GET | `/academic-years/:id` | `academic_years.view` | Get academic year with terms |
| PATCH | `/academic-years/:id` | `academic_years.update` | Update academic year |
| POST | `/academic-years/:id/activate` | `academic_years.activate` | Set as active year (deactivates others) |
| DELETE | `/academic-years/:id` | `academic_years.delete` | Soft delete (only if no dependent data) |

**`POST /academic-years`**

```json
{
  "name": "2025/2026",
  "startDate": "2025-09-01",
  "endDate": "2026-06-30"
}
```

### Terms

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/academic-years/:yearId/terms` | `terms.create` | Create term within a year |
| GET | `/academic-years/:yearId/terms` | `terms.view` | List terms for a year |
| PATCH | `/terms/:id` | `terms.update` | Update term |
| DELETE | `/terms/:id` | `terms.delete` | Delete term |

**`POST /academic-years/:yearId/terms`**

```json
{
  "name": "Term 1",
  "startDate": "2025-09-01",
  "endDate": "2025-12-20",
  "orderIndex": 1
}
```

### Departments

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/departments` | `departments.create` | Create department |
| GET | `/departments` | `departments.view` | List departments |
| GET | `/departments/:id` | `departments.view` | Get department with head teacher |
| PATCH | `/departments/:id` | `departments.update` | Update department (name, head teacher) |
| DELETE | `/departments/:id` | `departments.delete` | Delete department |

### Grades (Education Levels)

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/grades` | `grades.create` | Create grade level |
| GET | `/grades` | `grades.view` | List grades (ordered by levelOrder) |
| PATCH | `/grades/:id` | `grades.update` | Update grade |
| DELETE | `/grades/:id` | `grades.delete` | Delete grade |

### Class Sections

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/class-sections` | `class_sections.create` | Create class section |
| GET | `/class-sections` | `class_sections.view` | List class sections (filter: yearId, gradeId) |
| GET | `/class-sections/:id` | `class_sections.view` | Get section with enrolled students count |
| PATCH | `/class-sections/:id` | `class_sections.update` | Update section (capacity, homeroom teacher) |
| DELETE | `/class-sections/:id` | `class_sections.delete` | Delete section |
| GET | `/class-sections/:id/students` | `students.view` | List enrolled students in section |
| GET | `/class-sections/:id/timetable` | `lessons.view` | Get weekly timetable for section |

**`POST /class-sections`**

```json
{
  "academicYearId": "year-uuid",
  "gradeId": "grade-uuid",
  "name": "A",
  "capacity": 30,
  "homeroomTeacherId": "teacher-uuid"
}
```

### Subjects

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/subjects` | `subjects.create` | Create subject |
| GET | `/subjects` | `subjects.view` | List subjects (filter: gradeId) |
| PATCH | `/subjects/:id` | `subjects.update` | Update subject |
| DELETE | `/subjects/:id` | `subjects.delete` | Delete subject |

### Subject-Grade Associations

| Method | Path | Permission | Description |
|---|---|---|---|
| PUT | `/subjects/:subjectId/grades` | `subjects.manage` | Set grades for a subject (full replace) |
| GET | `/grades/:gradeId/subjects` | `subjects.view` | List subjects available for a grade |

**`PUT /subjects/:subjectId/grades`**

```json
{ "gradeIds": ["grade-uuid-1", "grade-uuid-2"] }
```

### Class Subject Requirements

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/class-sections/:sectionId/requirements` | `requirements.view` | List subject requirements for a section |
| PUT | `/class-sections/:sectionId/requirements` | `requirements.manage` | Set all requirements for a section (full replace) |

**`PUT /class-sections/:sectionId/requirements`**

```json
{
  "requirements": [
    { "subjectId": "math-uuid", "weeklyLessonsRequired": 5 },
    { "subjectId": "science-uuid", "weeklyLessonsRequired": 4 },
    { "subjectId": "english-uuid", "weeklyLessonsRequired": 5 }
  ]
}
```

---

## Domain 4: Student Management

### Students

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/students` | `students.create` | Register a new student |
| GET | `/students` | `students.view` | List students (filter: status, gradeId, classSectionId, search) |
| GET | `/students/:id` | `students.view` | Get student full profile |
| PATCH | `/students/:id` | `students.update` | Update student details |
| DELETE | `/students/:id` | `students.delete` | Soft delete student |
| GET | `/students/:id/guardians` | `students.view` | List guardians for student |
| GET | `/students/:id/enrollments` | `students.view` | Enrollment history across years |
| GET | `/students/:id/attendance` | `attendance.view` | Attendance records (filter: termId, dateFrom, dateTo) |
| GET | `/students/:id/grades` | `grades.view` | All grades (filter: termId, examId) |
| GET | `/students/:id/report-cards` | `grades.view` | Report card snapshots |
| GET | `/students/:id/invoices` | `fees.view` | Fee invoices and balance |

**`POST /students`**

```json
{
  "studentCode": "STU-2025-001",
  "firstName": "Ahmed",
  "lastName": "Al-Rashid",
  "dateOfBirth": "2012-05-15",
  "gender": "male",
  "nationalId": "1234567890",
  "nationality": "Saudi",
  "bloodType": "O+",
  "address": "123 Main St, Riyadh",
  "phone": "+966501234567",
  "admissionDate": "2025-09-01",
  "status": "active"
}
```

### Guardians

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/guardians` | `guardians.create` | Register a guardian |
| GET | `/guardians` | `guardians.view` | List guardians (search by name, phone) |
| GET | `/guardians/:id` | `guardians.view` | Get guardian with linked students |
| PATCH | `/guardians/:id` | `guardians.update` | Update guardian details |
| DELETE | `/guardians/:id` | `guardians.delete` | Soft delete guardian |

### Student-Guardian Links

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/students/:studentId/guardians` | `students.manage` | Link guardian to student |
| PATCH | `/students/:studentId/guardians/:guardianId` | `students.manage` | Update link (relationship, primary, emergency) |
| DELETE | `/students/:studentId/guardians/:guardianId` | `students.manage` | Unlink guardian from student |

**`POST /students/:studentId/guardians`**

```json
{
  "guardianId": "guardian-uuid",
  "relationshipType": "father",
  "isPrimary": true,
  "isEmergencyContact": true
}
```

### Student Enrollments

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/enrollments` | `enrollments.create` | Enroll student in class section |
| GET | `/enrollments` | `enrollments.view` | List enrollments (filter: yearId, sectionId, status) |
| PATCH | `/enrollments/:id` | `enrollments.update` | Update enrollment (status, notes) |
| POST | `/enrollments/bulk-promote` | `enrollments.promote` | Bulk promote students to next year |

**`POST /enrollments`**

```json
{
  "studentId": "student-uuid",
  "classSectionId": "section-uuid",
  "academicYearId": "year-uuid"
}
```

**`POST /enrollments/bulk-promote`**

```json
{
  "fromAcademicYearId": "current-year-uuid",
  "toAcademicYearId": "next-year-uuid",
  "promotions": [
    { "studentId": "student-uuid-1", "toClassSectionId": "next-section-uuid" },
    { "studentId": "student-uuid-2", "toClassSectionId": "next-section-uuid" }
  ]
}
```

Response includes a summary of successful promotions and any failures (e.g., student already enrolled in the target year).

---

## Domain 5: Teacher Management

### Teachers

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/teachers` | `teachers.create` | Register a teacher |
| GET | `/teachers` | `teachers.view` | List teachers (filter: departmentId, status, search) |
| GET | `/teachers/:id` | `teachers.view` | Get teacher profile with subjects |
| PATCH | `/teachers/:id` | `teachers.update` | Update teacher details |
| DELETE | `/teachers/:id` | `teachers.delete` | Soft delete teacher |
| GET | `/teachers/:id/timetable` | `lessons.view` | Weekly timetable for teacher |
| GET | `/teachers/:id/leaves` | `leaves.view` | Leave history |
| GET | `/teachers/:id/attendance` | `attendance.view` | Attendance records |

**`POST /teachers`**

```json
{
  "teacherCode": "TCH-001",
  "firstName": "Fatima",
  "lastName": "Hassan",
  "gender": "female",
  "departmentId": "dept-uuid",
  "phone": "+966507654321",
  "email": "fatima@alnoor.edu.sa",
  "specialization": "Mathematics",
  "qualification": "M.Ed. Mathematics",
  "hireDate": "2020-08-15",
  "status": "active"
}
```

### Teacher-Subject Assignments

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/teachers/:teacherId/subjects` | `teachers.view` | List subjects a teacher can teach |
| PUT | `/teachers/:teacherId/subjects` | `teachers.manage` | Set subject assignments (full replace) |

**`PUT /teachers/:teacherId/subjects`**

```json
{ "subjectIds": ["math-uuid", "physics-uuid"] }
```

---

## Domain 6: Time Modeling

### Period Sets

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/period-sets` | `scheduling.manage` | Create period set for academic year |
| GET | `/period-sets` | `scheduling.view` | List period sets (filter: yearId) |
| GET | `/period-sets/:id` | `scheduling.view` | Get period set with periods and working days |
| PATCH | `/period-sets/:id` | `scheduling.manage` | Update period set name |
| DELETE | `/period-sets/:id` | `scheduling.manage` | Delete period set |

### Working Days

| Method | Path | Permission | Description |
|---|---|---|---|
| PUT | `/period-sets/:setId/working-days` | `scheduling.manage` | Set working days (full replace) |

**`PUT /period-sets/:setId/working-days`**

```json
{
  "workingDays": [
    { "dayOfWeek": 0, "isActive": true },
    { "dayOfWeek": 1, "isActive": true },
    { "dayOfWeek": 2, "isActive": true },
    { "dayOfWeek": 3, "isActive": true },
    { "dayOfWeek": 4, "isActive": true },
    { "dayOfWeek": 5, "isActive": false },
    { "dayOfWeek": 6, "isActive": false }
  ]
}
```

### Periods (Bell Schedule)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/period-sets/:setId/periods` | `scheduling.view` | List periods in order |
| PUT | `/period-sets/:setId/periods` | `scheduling.manage` | Set all periods (full replace) |

**`PUT /period-sets/:setId/periods`**

```json
{
  "periods": [
    { "name": "Period 1", "startTime": "08:00", "endTime": "08:45", "orderIndex": 1, "isBreak": false },
    { "name": "Period 2", "startTime": "08:50", "endTime": "09:35", "orderIndex": 2, "isBreak": false },
    { "name": "Break", "startTime": "09:35", "endTime": "09:55", "orderIndex": 3, "isBreak": true },
    { "name": "Period 3", "startTime": "09:55", "endTime": "10:40", "orderIndex": 4, "isBreak": false }
  ]
}
```

### Time Slots

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/period-sets/:setId/time-slots` | `scheduling.view` | List all generated time slots |
| POST | `/period-sets/:setId/time-slots/generate` | `scheduling.manage` | Auto-generate slots from periods x working days |

Time slots are auto-generated by combining active working days with non-break periods. This endpoint creates all combinations and returns the count.

---

## Domain 7: Room Management

### Rooms

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/rooms` | `rooms.create` | Create a room |
| GET | `/rooms` | `rooms.view` | List rooms (filter: roomType, building) |
| GET | `/rooms/:id` | `rooms.view` | Get room details with suitability |
| PATCH | `/rooms/:id` | `rooms.update` | Update room |
| DELETE | `/rooms/:id` | `rooms.delete` | Delete room |
| GET | `/rooms/:id/timetable` | `lessons.view` | Weekly schedule for a room |

### Room-Subject Suitability

| Method | Path | Permission | Description |
|---|---|---|---|
| PUT | `/rooms/:roomId/subjects` | `rooms.manage` | Set suitable subjects (full replace, empty = all subjects) |

---

## Domain 8: Scheduling

### Lessons

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/lessons` | `lessons.create` | Create a single lesson (manual scheduling) |
| GET | `/lessons` | `lessons.view` | List lessons (filter: termId, classSectionId, teacherId, dayOfWeek) |
| GET | `/lessons/:id` | `lessons.view` | Get lesson details |
| PATCH | `/lessons/:id` | `lessons.update` | Update lesson (room, teacher, time slot) |
| POST | `/lessons/:id/cancel` | `lessons.cancel` | Cancel a lesson (frees the slot) |
| POST | `/lessons/bulk-create` | `lessons.create` | Bulk create lessons (scheduling output) |
| POST | `/lessons/auto-generate` | `lessons.generate` | Run auto-scheduling algorithm |
| DELETE | `/lessons/clear` | `lessons.delete` | Clear all lessons for a term (for re-scheduling) |

**`POST /lessons`**

```json
{
  "academicYearId": "year-uuid",
  "termId": "term-uuid",
  "classSectionId": "section-uuid",
  "subjectId": "subject-uuid",
  "teacherId": "teacher-uuid",
  "roomId": "room-uuid",
  "timeSlotId": "slot-uuid"
}
```

The server validates all three conflict constraints (teacher, class, room) before creating. Returns `409 CONFLICT` with details if any constraint is violated.

**`POST /lessons/auto-generate`**

```json
{
  "termId": "term-uuid",
  "periodSetId": "period-set-uuid",
  "options": {
    "respectTeacherAvailability": true,
    "respectRoomSuitability": true,
    "maxConsecutiveLessonsPerTeacher": 4
  }
}
```

Response:

```json
{
  "success": true,
  "data": {
    "totalLessonsCreated": 870,
    "totalRequirementsFulfilled": 285,
    "totalRequirements": 290,
    "unfulfilled": [
      {
        "classSectionId": "uuid",
        "classSectionName": "5A",
        "subjectId": "uuid",
        "subjectName": "Art",
        "requiredLessons": 2,
        "scheduledLessons": 1,
        "reason": "No available teacher with free slot"
      }
    ]
  }
}
```

### Timetable Views (read-only aggregations)

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/timetable/class/:classSectionId` | `lessons.view` | Weekly grid for a class section |
| GET | `/timetable/teacher/:teacherId` | `lessons.view` | Weekly grid for a teacher |
| GET | `/timetable/room/:roomId` | `lessons.view` | Weekly grid for a room |

Response format for timetable views:

```json
{
  "success": true,
  "data": {
    "termId": "term-uuid",
    "grid": {
      "0": {
        "period-1-uuid": { "lessonId": "uuid", "subject": "Math", "teacher": "Fatima H.", "room": "101" },
        "period-2-uuid": { "lessonId": "uuid", "subject": "Science", "teacher": "Ahmad M.", "room": "Lab-1" },
        "period-3-uuid": null
      },
      "1": { ... }
    }
  }
}
```

Keys are `dayOfWeek` (0-6), values are period-to-lesson maps. `null` means free slot.

### Substitutions

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/substitutions` | `substitutions.create` | Assign a substitute teacher |
| GET | `/substitutions` | `substitutions.view` | List substitutions (filter: date, teacherId) |
| GET | `/substitutions/:id` | `substitutions.view` | Get substitution details |
| PATCH | `/substitutions/:id` | `substitutions.update` | Update substitution |
| DELETE | `/substitutions/:id` | `substitutions.delete` | Remove substitution |

**`POST /substitutions`**

```json
{
  "lessonId": "lesson-uuid",
  "substituteTeacherId": "teacher-uuid",
  "date": "2025-10-15",
  "reason": "Sick leave"
}
```

Server validates: substitute teacher is not the original teacher, substitute has no conflicting lesson/substitution at the same time slot on the same date, and substitute is qualified to teach the subject.

---

## Domain 9: Availability & Leaves

### Teacher Availability

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/teachers/:teacherId/availability` | `availability.view` | Get weekly availability grid |
| PUT | `/teachers/:teacherId/availability` | `availability.manage` | Set full weekly availability (replace) |

**`PUT /teachers/:teacherId/availability`**

```json
{
  "slots": [
    { "dayOfWeek": 0, "periodId": "period-1-uuid", "isAvailable": true },
    { "dayOfWeek": 0, "periodId": "period-2-uuid", "isAvailable": false },
    { "dayOfWeek": 1, "periodId": "period-1-uuid", "isAvailable": true }
  ]
}
```

### Teacher Leaves

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/teacher-leaves` | `leaves.request` | Submit leave request (teacher self-serve) |
| GET | `/teacher-leaves` | `leaves.view` | List leave requests (filter: teacherId, status, dateRange) |
| GET | `/teacher-leaves/:id` | `leaves.view` | Get leave details |
| POST | `/teacher-leaves/:id/approve` | `leaves.approve` | Approve leave request |
| POST | `/teacher-leaves/:id/reject` | `leaves.approve` | Reject leave request |
| POST | `/teacher-leaves/:id/cancel` | `leaves.request` | Cancel own leave request |

**`POST /teacher-leaves`**

```json
{
  "teacherId": "teacher-uuid",
  "leaveType": "sick",
  "dateFrom": "2025-10-14",
  "dateTo": "2025-10-16",
  "reason": "Medical appointment"
}
```

---

## Domain 10: Attendance

### Student Attendance

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/student-attendance/bulk` | `attendance.record` | Record attendance for entire class (daily or per-lesson) |
| GET | `/student-attendance` | `attendance.view` | List records (filter: classSectionId, date, studentId, lessonId) |
| PATCH | `/student-attendance/:id` | `attendance.update` | Correct an attendance record |
| GET | `/student-attendance/summary` | `attendance.view` | Aggregated stats (filter: classSectionId, termId) |

**`POST /student-attendance/bulk`** -- the primary endpoint. Teachers submit attendance for a full class at once.

```json
{
  "classSectionId": "section-uuid",
  "date": "2025-10-15",
  "lessonId": null,
  "records": [
    { "studentId": "student-uuid-1", "status": "present" },
    { "studentId": "student-uuid-2", "status": "absent", "notes": "No contact from guardian" },
    { "studentId": "student-uuid-3", "status": "late" },
    { "studentId": "student-uuid-4", "status": "excused", "notes": "Doctor appointment" }
  ]
}
```

Set `lessonId: null` for daily mode, or provide a lesson UUID for per-lesson mode.

**`GET /student-attendance/summary`** -- returns aggregated counts per student.

```json
{
  "success": true,
  "data": [
    {
      "studentId": "uuid",
      "studentName": "Ahmed Al-Rashid",
      "present": 42,
      "absent": 3,
      "late": 2,
      "excused": 1,
      "totalDays": 48,
      "attendanceRate": 87.5
    }
  ]
}
```

### Teacher Attendance

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/teacher-attendance` | `attendance.record` | Record teacher check-in/out |
| GET | `/teacher-attendance` | `attendance.view` | List records (filter: teacherId, dateRange) |
| PATCH | `/teacher-attendance/:id` | `attendance.update` | Correct a record |

---

## Domain 11: Exams & Grading

### Grading Scales

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/grading-scales` | `grading.manage` | Create grading scale with levels |
| GET | `/grading-scales` | `grading.view` | List grading scales |
| GET | `/grading-scales/:id` | `grading.view` | Get scale with levels |
| PATCH | `/grading-scales/:id` | `grading.manage` | Update scale (name, levels) |
| DELETE | `/grading-scales/:id` | `grading.manage` | Delete scale (only if unused) |

**`POST /grading-scales`**

```json
{
  "name": "Standard Percentage Scale",
  "levels": [
    { "letter": "A+", "minScore": 95, "maxScore": 100, "gpaPoints": 4.0, "orderIndex": 1 },
    { "letter": "A", "minScore": 90, "maxScore": 94.99, "gpaPoints": 3.75, "orderIndex": 2 },
    { "letter": "B+", "minScore": 85, "maxScore": 89.99, "gpaPoints": 3.5, "orderIndex": 3 },
    { "letter": "B", "minScore": 80, "maxScore": 84.99, "gpaPoints": 3.0, "orderIndex": 4 },
    { "letter": "C", "minScore": 70, "maxScore": 79.99, "gpaPoints": 2.5, "orderIndex": 5 },
    { "letter": "D", "minScore": 60, "maxScore": 69.99, "gpaPoints": 2.0, "orderIndex": 6 },
    { "letter": "F", "minScore": 0, "maxScore": 59.99, "gpaPoints": 0, "orderIndex": 7 }
  ]
}
```

### Exams

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/exams` | `exams.create` | Create an exam |
| GET | `/exams` | `exams.view` | List exams (filter: termId, examType) |
| GET | `/exams/:id` | `exams.view` | Get exam with subjects |
| PATCH | `/exams/:id` | `exams.update` | Update exam details |
| DELETE | `/exams/:id` | `exams.delete` | Delete exam (only if no grades entered) |

**`POST /exams`**

```json
{
  "academicYearId": "year-uuid",
  "termId": "term-uuid",
  "gradingScaleId": "scale-uuid",
  "name": "Midterm Exam",
  "examType": "midterm",
  "weight": 40,
  "startDate": "2025-11-10",
  "endDate": "2025-11-14"
}
```

### Exam Subjects

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/exams/:examId/subjects` | `exams.manage` | Add subject to exam |
| GET | `/exams/:examId/subjects` | `exams.view` | List exam subjects |
| PATCH | `/exams/:examId/subjects/:id` | `exams.manage` | Update exam subject (maxScore, dates) |
| DELETE | `/exams/:examId/subjects/:id` | `exams.manage` | Remove subject from exam |

**`POST /exams/:examId/subjects`**

```json
{
  "subjectId": "math-uuid",
  "gradeId": "grade-5-uuid",
  "maxScore": 100,
  "passScore": 50,
  "examDate": "2025-11-10",
  "examTime": "09:00"
}
```

### Student Grades

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/grades/bulk` | `grades.record` | Bulk enter grades for an exam-subject |
| GET | `/grades` | `grades.view` | List grades (filter: examSubjectId, studentId) |
| PATCH | `/grades/:id` | `grades.update` | Correct a grade (creates audit log) |
| GET | `/grades/report` | `grades.view` | Grade report for class (filter: termId, classSectionId) |

**`POST /grades/bulk`** -- teachers enter grades for all students in a class for one exam-subject.

```json
{
  "examSubjectId": "exam-subject-uuid",
  "grades": [
    { "studentId": "student-uuid-1", "score": 92, "notes": "" },
    { "studentId": "student-uuid-2", "score": 78, "notes": "Needs improvement in algebra" },
    { "studentId": "student-uuid-3", "score": 45, "notes": "Below passing" }
  ]
}
```

The server auto-computes `gradeLetter` using the exam's grading scale and returns the full grade objects with letters.

### Report Cards

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/report-cards/generate` | `grades.publish` | Generate report card snapshots for a term |
| GET | `/report-cards` | `grades.view` | List report cards (filter: termId, classSectionId) |
| GET | `/report-cards/:id` | `grades.view` | Get full report card snapshot |
| PATCH | `/report-cards/:id/remarks` | `grades.update` | Add/update teacher remarks and rank |

**`POST /report-cards/generate`**

```json
{
  "termId": "term-uuid",
  "classSectionId": "section-uuid"
}
```

Response includes the count of generated snapshots and any students missing grades.

---

## Domain 12: Fees & Billing

### Fee Categories

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/fee-categories` | `fees.manage` | Create fee category |
| GET | `/fee-categories` | `fees.view` | List fee categories |
| PATCH | `/fee-categories/:id` | `fees.manage` | Update category |
| DELETE | `/fee-categories/:id` | `fees.manage` | Delete category |

### Fee Structures

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/fee-structures` | `fees.manage` | Create fee structure |
| GET | `/fee-structures` | `fees.view` | List structures (filter: yearId, gradeId, categoryId) |
| PATCH | `/fee-structures/:id` | `fees.manage` | Update structure |
| DELETE | `/fee-structures/:id` | `fees.manage` | Delete structure |

**`POST /fee-structures`**

```json
{
  "academicYearId": "year-uuid",
  "gradeId": "grade-5-uuid",
  "feeCategoryId": "tuition-category-uuid",
  "name": "Grade 5 Tuition - Term",
  "amount": 5000.00,
  "dueDate": "2025-09-15",
  "isRecurring": true,
  "recurrence": "term"
}
```

### Fee Discounts

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/fee-discounts` | `fees.manage` | Apply discount to student |
| GET | `/fee-discounts` | `fees.view` | List discounts (filter: studentId) |
| PATCH | `/fee-discounts/:id` | `fees.manage` | Update discount |
| DELETE | `/fee-discounts/:id` | `fees.manage` | Remove discount |

**`POST /fee-discounts`**

```json
{
  "studentId": "student-uuid",
  "feeStructureId": "structure-uuid",
  "discountType": "percentage",
  "amount": 10,
  "reason": "Sibling discount"
}
```

### Fee Invoices

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/fee-invoices` | `fees.create_invoice` | Create invoice for a student |
| POST | `/fee-invoices/bulk-generate` | `fees.create_invoice` | Generate invoices for all students in a grade/section |
| GET | `/fee-invoices` | `fees.view` | List invoices (filter: studentId, status, dateRange) |
| GET | `/fee-invoices/:id` | `fees.view` | Get invoice with items and payments |
| PATCH | `/fee-invoices/:id` | `fees.update_invoice` | Update invoice (only draft status) |
| POST | `/fee-invoices/:id/issue` | `fees.issue_invoice` | Issue invoice (transitions from draft to issued) |
| POST | `/fee-invoices/:id/cancel` | `fees.cancel_invoice` | Cancel invoice |

**`POST /fee-invoices`**

```json
{
  "studentId": "student-uuid",
  "dueDate": "2025-10-01",
  "items": [
    { "feeStructureId": "tuition-uuid", "description": "Term 1 Tuition", "quantity": 1, "unitAmount": 5000.00 },
    { "feeStructureId": "transport-uuid", "description": "Bus - Term 1", "quantity": 1, "unitAmount": 500.00 }
  ]
}
```

Server computes `totalAmount`, applies discounts from `fee_discounts`, and sets `discountAmount` and `netAmount`.

**`POST /fee-invoices/bulk-generate`**

```json
{
  "academicYearId": "year-uuid",
  "gradeId": "grade-5-uuid",
  "dueDate": "2025-10-01",
  "feeStructureIds": ["tuition-uuid", "transport-uuid"]
}
```

Generates one invoice per enrolled active student in the grade, applying their individual discounts. Returns summary with count and total value.

### Fee Payments

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/fee-payments` | `fees.collect` | Record a payment against an invoice |
| GET | `/fee-payments` | `fees.view` | List payments (filter: invoiceId, dateRange, method) |
| GET | `/fee-payments/:id` | `fees.view` | Get payment details |

**`POST /fee-payments`**

```json
{
  "invoiceId": "invoice-uuid",
  "amountPaid": 2500.00,
  "paymentDate": "2025-10-05",
  "paymentMethod": "bank_transfer",
  "referenceNumber": "TXN-2025-00456",
  "notes": "First installment"
}
```

Server auto-updates invoice status: if total payments >= net amount, status becomes `paid`; if partial, `partially_paid`.

### Financial Reports

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/reports/fees/outstanding` | `fees.report` | Outstanding invoices summary |
| GET | `/reports/fees/collection` | `fees.report` | Collection report by date range |
| GET | `/reports/fees/student-balance` | `fees.report` | Per-student balance summary |
| GET | `/reports/fees/category-breakdown` | `fees.report` | Revenue by fee category |

---

## Domain 13: Communication

### Announcements

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/announcements` | `announcements.create` | Create announcement (draft) |
| GET | `/announcements` | `announcements.view` | List announcements (filter: isDraft, targetType) |
| GET | `/announcements/:id` | `announcements.view` | Get announcement with targets |
| PATCH | `/announcements/:id` | `announcements.update` | Update announcement (draft only) |
| POST | `/announcements/:id/publish` | `announcements.publish` | Publish announcement (sets publishedAt, isDraft=false) |
| DELETE | `/announcements/:id` | `announcements.delete` | Delete announcement |

**`POST /announcements`**

```json
{
  "title": "Parent-Teacher Meeting",
  "body": "We are pleased to invite you to the annual parent-teacher meeting on November 20th...",
  "expiresAt": "2025-11-21T00:00:00Z",
  "targets": [
    { "targetType": "grade", "targetGradeId": "grade-5-uuid" },
    { "targetType": "grade", "targetGradeId": "grade-6-uuid" },
    { "targetType": "role", "targetRoleId": "guardian-role-uuid" }
  ]
}
```

### Notifications

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/notifications` | (self) | List own notifications (filter: isRead, channel) |
| GET | `/notifications/unread-count` | (self) | Get unread notification count |
| POST | `/notifications/:id/read` | (self) | Mark notification as read |
| POST | `/notifications/read-all` | (self) | Mark all notifications as read |
| POST | `/notifications/send` | `notifications.send` | Send notification to users (admin) |

**`POST /notifications/send`**

```json
{
  "userIds": ["user-uuid-1", "user-uuid-2"],
  "title": "Absence Alert",
  "body": "Your child Ahmed was marked absent today.",
  "channels": ["in_app", "sms"]
}
```

Creates one notification row per user per channel.

---

## Domain 14: Calendar & Events

### Academic Events

| Method | Path | Permission | Description |
|---|---|---|---|
| POST | `/academic-events` | `events.create` | Create event |
| GET | `/academic-events` | `events.view` | List events (filter: yearId, eventType, dateRange) |
| GET | `/academic-events/:id` | `events.view` | Get event details |
| PATCH | `/academic-events/:id` | `events.update` | Update event |
| DELETE | `/academic-events/:id` | `events.delete` | Delete event |

**`POST /academic-events`**

```json
{
  "academicYearId": "year-uuid",
  "title": "Eid Al-Fitr Holiday",
  "description": "School closed for Eid Al-Fitr celebration",
  "eventType": "holiday",
  "startDate": "2026-03-30",
  "endDate": "2026-04-03",
  "isSchoolClosed": true
}
```

---

## Domain 15: Audit

### Audit Logs

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/audit-logs` | `audit.view` | List audit logs (filter: tableName, recordId, userId, dateRange) |
| GET | `/audit-logs/:id` | `audit.view` | Get full audit entry with old/new values |

Audit logs are read-only. No create, update, or delete endpoints. They are generated automatically by the system on INSERT/UPDATE/DELETE of audited tables.

**Query examples:**
- `/audit-logs?tableName=student_grades&recordId=grade-uuid` -- history of a specific grade
- `/audit-logs?userId=user-uuid&dateFrom=2025-10-01&dateTo=2025-10-31` -- all changes by a user in October
- `/audit-logs?tableName=fee_payments&action=DELETE` -- all deleted payments (suspicious activity check)

---

## Self-Service Endpoints (Role-Specific)

These endpoints are for authenticated users accessing their own data. They do not require admin permissions.

### Teacher Self-Service

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/my/timetable` | teacher | Own weekly timetable |
| GET | `/my/classes` | teacher | Classes I teach (current term) |
| GET | `/my/leaves` | teacher | Own leave requests |
| POST | `/my/leaves` | teacher | Submit leave request |
| GET | `/my/substitutions` | teacher | Substitutions assigned to me |

### Student Self-Service

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/my/timetable` | student | Own class timetable |
| GET | `/my/grades` | student | Own grades |
| GET | `/my/attendance` | student | Own attendance records |
| GET | `/my/report-cards` | student | Own report card snapshots |
| GET | `/my/invoices` | student | Own fee invoices |

### Guardian Self-Service

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/my/children` | guardian | List linked students |
| GET | `/my/children/:studentId/grades` | guardian | Child's grades |
| GET | `/my/children/:studentId/attendance` | guardian | Child's attendance |
| GET | `/my/children/:studentId/report-cards` | guardian | Child's report cards |
| GET | `/my/children/:studentId/invoices` | guardian | Child's fee invoices |

---

## Dashboard Endpoints

### School Admin Dashboard

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/dashboard/overview` | `dashboard.view` | Key metrics (students, teachers, attendance rate, fee collection) |
| GET | `/dashboard/attendance-today` | `dashboard.view` | Today's attendance summary by class |
| GET | `/dashboard/fees-summary` | `dashboard.view` | Financial overview (outstanding, collected, overdue) |
| GET | `/dashboard/recent-activity` | `dashboard.view` | Recent audit log entries |

### Super Admin Dashboard

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/platform/dashboard` | `platform.manage` | Platform-wide metrics (schools, users, subscriptions) |
| GET | `/platform/schools/expiring` | `platform.manage` | Schools with subscriptions expiring soon |

---

## Webhook / Event Triggers

These are not API endpoints but internal events that trigger side effects. Listed here for completeness since they affect notification delivery.

| Event | Trigger | Side Effect |
|---|---|---|
| `student.marked_absent` | Attendance record created with status=absent | Notify primary guardian via configured channels |
| `grade.published` | Report card snapshot generated | Notify student and guardian |
| `invoice.issued` | Invoice status changed to issued | Notify guardian |
| `invoice.overdue` | Cron: invoice past due_date and not paid | Notify guardian |
| `leave.approved` | Leave status changed to approved | Notify teacher |
| `leave.rejected` | Leave status changed to rejected | Notify teacher |
| `announcement.published` | Announcement isDraft set to false | Notify all targeted users |
| `substitution.created` | Substitution record created | Notify substitute teacher |
