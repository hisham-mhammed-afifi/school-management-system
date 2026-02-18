-- CreateIndex
CREATE INDEX "academic_events_school_id_idx" ON "academic_events"("school_id");

-- CreateIndex
CREATE INDEX "academic_events_academic_year_id_idx" ON "academic_events"("academic_year_id");

-- CreateIndex
CREATE INDEX "academic_years_school_id_idx" ON "academic_years"("school_id");

-- CreateIndex
CREATE INDEX "announcement_targets_announcement_id_idx" ON "announcement_targets"("announcement_id");

-- CreateIndex
CREATE INDEX "announcement_targets_target_role_id_idx" ON "announcement_targets"("target_role_id");

-- CreateIndex
CREATE INDEX "announcement_targets_target_grade_id_idx" ON "announcement_targets"("target_grade_id");

-- CreateIndex
CREATE INDEX "announcement_targets_target_class_section_id_idx" ON "announcement_targets"("target_class_section_id");

-- CreateIndex
CREATE INDEX "announcements_school_id_idx" ON "announcements"("school_id");

-- CreateIndex
CREATE INDEX "announcements_published_by_idx" ON "announcements"("published_by");

-- CreateIndex
CREATE INDEX "audit_logs_school_id_idx" ON "audit_logs"("school_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "class_sections_school_id_idx" ON "class_sections"("school_id");

-- CreateIndex
CREATE INDEX "class_sections_academic_year_id_idx" ON "class_sections"("academic_year_id");

-- CreateIndex
CREATE INDEX "class_sections_grade_id_idx" ON "class_sections"("grade_id");

-- CreateIndex
CREATE INDEX "class_sections_homeroom_teacher_id_idx" ON "class_sections"("homeroom_teacher_id");

-- CreateIndex
CREATE INDEX "class_subject_requirements_school_id_idx" ON "class_subject_requirements"("school_id");

-- CreateIndex
CREATE INDEX "class_subject_requirements_academic_year_id_idx" ON "class_subject_requirements"("academic_year_id");

-- CreateIndex
CREATE INDEX "class_subject_requirements_class_section_id_idx" ON "class_subject_requirements"("class_section_id");

-- CreateIndex
CREATE INDEX "class_subject_requirements_subject_id_idx" ON "class_subject_requirements"("subject_id");

-- CreateIndex
CREATE INDEX "departments_school_id_idx" ON "departments"("school_id");

-- CreateIndex
CREATE INDEX "departments_head_teacher_id_idx" ON "departments"("head_teacher_id");

-- CreateIndex
CREATE INDEX "exam_subjects_school_id_idx" ON "exam_subjects"("school_id");

-- CreateIndex
CREATE INDEX "exam_subjects_exam_id_idx" ON "exam_subjects"("exam_id");

-- CreateIndex
CREATE INDEX "exam_subjects_subject_id_idx" ON "exam_subjects"("subject_id");

-- CreateIndex
CREATE INDEX "exam_subjects_grade_id_idx" ON "exam_subjects"("grade_id");

-- CreateIndex
CREATE INDEX "exams_school_id_idx" ON "exams"("school_id");

-- CreateIndex
CREATE INDEX "exams_academic_year_id_idx" ON "exams"("academic_year_id");

-- CreateIndex
CREATE INDEX "exams_term_id_idx" ON "exams"("term_id");

-- CreateIndex
CREATE INDEX "exams_grading_scale_id_idx" ON "exams"("grading_scale_id");

-- CreateIndex
CREATE INDEX "fee_categories_school_id_idx" ON "fee_categories"("school_id");

-- CreateIndex
CREATE INDEX "fee_discounts_school_id_idx" ON "fee_discounts"("school_id");

-- CreateIndex
CREATE INDEX "fee_discounts_student_id_idx" ON "fee_discounts"("student_id");

-- CreateIndex
CREATE INDEX "fee_discounts_fee_structure_id_idx" ON "fee_discounts"("fee_structure_id");

-- CreateIndex
CREATE INDEX "fee_discounts_approved_by_idx" ON "fee_discounts"("approved_by");

-- CreateIndex
CREATE INDEX "fee_invoice_items_school_id_idx" ON "fee_invoice_items"("school_id");

-- CreateIndex
CREATE INDEX "fee_invoice_items_invoice_id_idx" ON "fee_invoice_items"("invoice_id");

-- CreateIndex
CREATE INDEX "fee_invoice_items_fee_structure_id_idx" ON "fee_invoice_items"("fee_structure_id");

-- CreateIndex
CREATE INDEX "fee_invoices_school_id_idx" ON "fee_invoices"("school_id");

-- CreateIndex
CREATE INDEX "fee_invoices_student_id_idx" ON "fee_invoices"("student_id");

-- CreateIndex
CREATE INDEX "fee_payments_school_id_idx" ON "fee_payments"("school_id");

-- CreateIndex
CREATE INDEX "fee_payments_invoice_id_idx" ON "fee_payments"("invoice_id");

-- CreateIndex
CREATE INDEX "fee_payments_received_by_idx" ON "fee_payments"("received_by");

-- CreateIndex
CREATE INDEX "fee_structures_school_id_idx" ON "fee_structures"("school_id");

-- CreateIndex
CREATE INDEX "fee_structures_academic_year_id_idx" ON "fee_structures"("academic_year_id");

-- CreateIndex
CREATE INDEX "fee_structures_grade_id_idx" ON "fee_structures"("grade_id");

-- CreateIndex
CREATE INDEX "fee_structures_fee_category_id_idx" ON "fee_structures"("fee_category_id");

-- CreateIndex
CREATE INDEX "grades_school_id_idx" ON "grades"("school_id");

-- CreateIndex
CREATE INDEX "grading_scale_levels_grading_scale_id_idx" ON "grading_scale_levels"("grading_scale_id");

-- CreateIndex
CREATE INDEX "grading_scales_school_id_idx" ON "grading_scales"("school_id");

-- CreateIndex
CREATE INDEX "guardians_school_id_deleted_at_idx" ON "guardians"("school_id", "deleted_at");

-- CreateIndex
CREATE INDEX "lessons_school_id_idx" ON "lessons"("school_id");

-- CreateIndex
CREATE INDEX "lessons_academic_year_id_idx" ON "lessons"("academic_year_id");

-- CreateIndex
CREATE INDEX "lessons_term_id_idx" ON "lessons"("term_id");

-- CreateIndex
CREATE INDEX "lessons_class_section_id_idx" ON "lessons"("class_section_id");

-- CreateIndex
CREATE INDEX "lessons_subject_id_idx" ON "lessons"("subject_id");

-- CreateIndex
CREATE INDEX "lessons_teacher_id_idx" ON "lessons"("teacher_id");

-- CreateIndex
CREATE INDEX "lessons_room_id_idx" ON "lessons"("room_id");

-- CreateIndex
CREATE INDEX "lessons_time_slot_id_idx" ON "lessons"("time_slot_id");

-- CreateIndex
CREATE INDEX "notifications_school_id_idx" ON "notifications"("school_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "period_sets_school_id_idx" ON "period_sets"("school_id");

-- CreateIndex
CREATE INDEX "period_sets_academic_year_id_idx" ON "period_sets"("academic_year_id");

-- CreateIndex
CREATE INDEX "periods_school_id_idx" ON "periods"("school_id");

-- CreateIndex
CREATE INDEX "periods_period_set_id_idx" ON "periods"("period_set_id");

-- CreateIndex
CREATE INDEX "report_card_snapshots_school_id_idx" ON "report_card_snapshots"("school_id");

-- CreateIndex
CREATE INDEX "report_card_snapshots_student_id_idx" ON "report_card_snapshots"("student_id");

-- CreateIndex
CREATE INDEX "report_card_snapshots_academic_year_id_idx" ON "report_card_snapshots"("academic_year_id");

-- CreateIndex
CREATE INDEX "report_card_snapshots_term_id_idx" ON "report_card_snapshots"("term_id");

-- CreateIndex
CREATE INDEX "report_card_snapshots_class_section_id_idx" ON "report_card_snapshots"("class_section_id");

-- CreateIndex
CREATE INDEX "report_card_snapshots_generated_by_idx" ON "report_card_snapshots"("generated_by");

-- CreateIndex
CREATE INDEX "role_permissions_role_id_idx" ON "role_permissions"("role_id");

-- CreateIndex
CREATE INDEX "role_permissions_permission_id_idx" ON "role_permissions"("permission_id");

-- CreateIndex
CREATE INDEX "roles_school_id_idx" ON "roles"("school_id");

-- CreateIndex
CREATE INDEX "room_subject_suitability_school_id_idx" ON "room_subject_suitability"("school_id");

-- CreateIndex
CREATE INDEX "room_subject_suitability_room_id_idx" ON "room_subject_suitability"("room_id");

-- CreateIndex
CREATE INDEX "room_subject_suitability_subject_id_idx" ON "room_subject_suitability"("subject_id");

-- CreateIndex
CREATE INDEX "rooms_school_id_idx" ON "rooms"("school_id");

-- CreateIndex
CREATE INDEX "school_working_days_school_id_idx" ON "school_working_days"("school_id");

-- CreateIndex
CREATE INDEX "school_working_days_period_set_id_idx" ON "school_working_days"("period_set_id");

-- CreateIndex
CREATE INDEX "school_working_days_day_of_week_idx" ON "school_working_days"("day_of_week");

-- CreateIndex
CREATE INDEX "student_attendance_school_id_idx" ON "student_attendance"("school_id");

-- CreateIndex
CREATE INDEX "student_attendance_student_id_idx" ON "student_attendance"("student_id");

-- CreateIndex
CREATE INDEX "student_attendance_lesson_id_idx" ON "student_attendance"("lesson_id");

-- CreateIndex
CREATE INDEX "student_attendance_recorded_by_idx" ON "student_attendance"("recorded_by");

-- CreateIndex
CREATE INDEX "student_enrollments_student_id_idx" ON "student_enrollments"("student_id");

-- CreateIndex
CREATE INDEX "student_enrollments_class_section_id_idx" ON "student_enrollments"("class_section_id");

-- CreateIndex
CREATE INDEX "student_enrollments_academic_year_id_idx" ON "student_enrollments"("academic_year_id");

-- CreateIndex
CREATE INDEX "student_grades_school_id_idx" ON "student_grades"("school_id");

-- CreateIndex
CREATE INDEX "student_grades_exam_subject_id_idx" ON "student_grades"("exam_subject_id");

-- CreateIndex
CREATE INDEX "student_grades_graded_by_idx" ON "student_grades"("graded_by");

-- CreateIndex
CREATE INDEX "student_guardians_school_id_idx" ON "student_guardians"("school_id");

-- CreateIndex
CREATE INDEX "student_guardians_student_id_idx" ON "student_guardians"("student_id");

-- CreateIndex
CREATE INDEX "student_guardians_guardian_id_idx" ON "student_guardians"("guardian_id");

-- CreateIndex
CREATE INDEX "subject_grades_school_id_idx" ON "subject_grades"("school_id");

-- CreateIndex
CREATE INDEX "subject_grades_subject_id_idx" ON "subject_grades"("subject_id");

-- CreateIndex
CREATE INDEX "subject_grades_grade_id_idx" ON "subject_grades"("grade_id");

-- CreateIndex
CREATE INDEX "subjects_school_id_idx" ON "subjects"("school_id");

-- CreateIndex
CREATE INDEX "substitutions_school_id_idx" ON "substitutions"("school_id");

-- CreateIndex
CREATE INDEX "substitutions_lesson_id_idx" ON "substitutions"("lesson_id");

-- CreateIndex
CREATE INDEX "substitutions_original_teacher_id_idx" ON "substitutions"("original_teacher_id");

-- CreateIndex
CREATE INDEX "substitutions_substitute_teacher_id_idx" ON "substitutions"("substitute_teacher_id");

-- CreateIndex
CREATE INDEX "substitutions_approved_by_idx" ON "substitutions"("approved_by");

-- CreateIndex
CREATE INDEX "teacher_attendance_school_id_idx" ON "teacher_attendance"("school_id");

-- CreateIndex
CREATE INDEX "teacher_attendance_teacher_id_idx" ON "teacher_attendance"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_availability_school_id_idx" ON "teacher_availability"("school_id");

-- CreateIndex
CREATE INDEX "teacher_availability_teacher_id_idx" ON "teacher_availability"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_availability_period_id_idx" ON "teacher_availability"("period_id");

-- CreateIndex
CREATE INDEX "teacher_leaves_school_id_idx" ON "teacher_leaves"("school_id");

-- CreateIndex
CREATE INDEX "teacher_leaves_teacher_id_idx" ON "teacher_leaves"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_leaves_approved_by_idx" ON "teacher_leaves"("approved_by");

-- CreateIndex
CREATE INDEX "teacher_subjects_school_id_idx" ON "teacher_subjects"("school_id");

-- CreateIndex
CREATE INDEX "teacher_subjects_teacher_id_idx" ON "teacher_subjects"("teacher_id");

-- CreateIndex
CREATE INDEX "teacher_subjects_subject_id_idx" ON "teacher_subjects"("subject_id");

-- CreateIndex
CREATE INDEX "teachers_school_id_deleted_at_idx" ON "teachers"("school_id", "deleted_at");

-- CreateIndex
CREATE INDEX "teachers_school_id_idx" ON "teachers"("school_id");

-- CreateIndex
CREATE INDEX "teachers_department_id_idx" ON "teachers"("department_id");

-- CreateIndex
CREATE INDEX "terms_school_id_idx" ON "terms"("school_id");

-- CreateIndex
CREATE INDEX "terms_academic_year_id_idx" ON "terms"("academic_year_id");

-- CreateIndex
CREATE INDEX "time_slots_school_id_idx" ON "time_slots"("school_id");

-- CreateIndex
CREATE INDEX "time_slots_period_id_idx" ON "time_slots"("period_id");

-- CreateIndex
CREATE INDEX "time_slots_day_of_week_idx" ON "time_slots"("day_of_week");

-- CreateIndex
CREATE INDEX "user_roles_user_id_idx" ON "user_roles"("user_id");

-- CreateIndex
CREATE INDEX "user_roles_role_id_idx" ON "user_roles"("role_id");

-- CreateIndex
CREATE INDEX "user_roles_school_id_idx" ON "user_roles"("school_id");

-- CreateIndex
CREATE INDEX "users_school_id_idx" ON "users"("school_id");

-- CreateIndex
CREATE INDEX "users_teacher_id_idx" ON "users"("teacher_id");

-- CreateIndex
CREATE INDEX "users_student_id_idx" ON "users"("student_id");

-- CreateIndex
CREATE INDEX "users_guardian_id_idx" ON "users"("guardian_id");
