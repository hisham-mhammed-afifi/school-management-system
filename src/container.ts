import { prisma } from './shared/database.ts';

// School
import { SchoolRepository } from './modules/school/school.repository.ts';
import { SchoolService } from './modules/school/school.service.ts';
import { SchoolController } from './modules/school/school.controller.ts';

// Auth
import { AuthService } from './modules/auth/auth.service.ts';
import { AuthController } from './modules/auth/auth.controller.ts';

// User
import { UserRepository } from './modules/user/user.repository.ts';
import { UserService } from './modules/user/user.service.ts';
import { UserController } from './modules/user/user.controller.ts';

// Role
import { RoleRepository } from './modules/role/role.repository.ts';
import { RoleService } from './modules/role/role.service.ts';
import { RoleController } from './modules/role/role.controller.ts';

// Academic Year
import { AcademicYearRepository } from './modules/academic-year/academic-year.repository.ts';
import { AcademicYearService } from './modules/academic-year/academic-year.service.ts';
import { AcademicYearController } from './modules/academic-year/academic-year.controller.ts';

// Term
import { TermRepository } from './modules/term/term.repository.ts';
import { TermService } from './modules/term/term.service.ts';
import { TermController } from './modules/term/term.controller.ts';

// Department
import { DepartmentRepository } from './modules/department/department.repository.ts';
import { DepartmentService } from './modules/department/department.service.ts';
import { DepartmentController } from './modules/department/department.controller.ts';

// Grade
import { GradeRepository } from './modules/grade/grade.repository.ts';
import { GradeService } from './modules/grade/grade.service.ts';
import { GradeController } from './modules/grade/grade.controller.ts';

// Subject
import { SubjectRepository } from './modules/subject/subject.repository.ts';
import { SubjectService } from './modules/subject/subject.service.ts';
import { SubjectController } from './modules/subject/subject.controller.ts';

// Class Section
import { ClassSectionRepository } from './modules/class-section/class-section.repository.ts';
import { ClassSectionService } from './modules/class-section/class-section.service.ts';
import { ClassSectionController } from './modules/class-section/class-section.controller.ts';

// Requirement
import { RequirementRepository } from './modules/requirement/requirement.repository.ts';
import { RequirementService } from './modules/requirement/requirement.service.ts';
import { RequirementController } from './modules/requirement/requirement.controller.ts';

// Student
import { StudentRepository } from './modules/student/student.repository.ts';
import { StudentService } from './modules/student/student.service.ts';
import { StudentController } from './modules/student/student.controller.ts';

// Guardian
import { GuardianRepository } from './modules/guardian/guardian.repository.ts';
import { GuardianService } from './modules/guardian/guardian.service.ts';
import { GuardianController } from './modules/guardian/guardian.controller.ts';

// Student-Guardian
import { StudentGuardianRepository } from './modules/student-guardian/student-guardian.repository.ts';
import { StudentGuardianService } from './modules/student-guardian/student-guardian.service.ts';
import { StudentGuardianController } from './modules/student-guardian/student-guardian.controller.ts';

// Enrollment
import { EnrollmentRepository } from './modules/enrollment/enrollment.repository.ts';
import { EnrollmentService } from './modules/enrollment/enrollment.service.ts';
import { EnrollmentController } from './modules/enrollment/enrollment.controller.ts';

// Teacher
import { TeacherRepository } from './modules/teacher/teacher.repository.ts';
import { TeacherService } from './modules/teacher/teacher.service.ts';
import { TeacherController } from './modules/teacher/teacher.controller.ts';

// Period Set
import { PeriodSetRepository } from './modules/period-set/period-set.repository.ts';
import { PeriodSetService } from './modules/period-set/period-set.service.ts';
import { PeriodSetController } from './modules/period-set/period-set.controller.ts';

// Working Day
import { WorkingDayRepository } from './modules/working-day/working-day.repository.ts';
import { WorkingDayService } from './modules/working-day/working-day.service.ts';
import { WorkingDayController } from './modules/working-day/working-day.controller.ts';

// Period
import { PeriodRepository } from './modules/period/period.repository.ts';
import { PeriodService } from './modules/period/period.service.ts';
import { PeriodController } from './modules/period/period.controller.ts';

// Time Slot
import { TimeSlotRepository } from './modules/time-slot/time-slot.repository.ts';
import { TimeSlotService } from './modules/time-slot/time-slot.service.ts';
import { TimeSlotController } from './modules/time-slot/time-slot.controller.ts';

// Room
import { RoomRepository } from './modules/room/room.repository.ts';
import { RoomService } from './modules/room/room.service.ts';
import { RoomController } from './modules/room/room.controller.ts';

export function createContainer() {
  // Phase 1
  const schoolRepo = new SchoolRepository(prisma);
  const schoolService = new SchoolService(schoolRepo);
  const schoolController = new SchoolController(schoolService);

  const authService = new AuthService(prisma);
  const authController = new AuthController(authService);

  const userRepo = new UserRepository(prisma);
  const userService = new UserService(userRepo);
  const userController = new UserController(userService);

  const roleRepo = new RoleRepository(prisma);
  const roleService = new RoleService(roleRepo);
  const roleController = new RoleController(roleService);

  // Phase 2
  const academicYearRepo = new AcademicYearRepository(prisma);
  const academicYearService = new AcademicYearService(academicYearRepo);
  const academicYearController = new AcademicYearController(academicYearService);

  const termRepo = new TermRepository(prisma);
  const termService = new TermService(termRepo, academicYearRepo);
  const termController = new TermController(termService);

  const departmentRepo = new DepartmentRepository(prisma);
  const departmentService = new DepartmentService(departmentRepo);
  const departmentController = new DepartmentController(departmentService);

  const gradeRepo = new GradeRepository(prisma);
  const gradeService = new GradeService(gradeRepo);
  const gradeController = new GradeController(gradeService);

  const subjectRepo = new SubjectRepository(prisma);
  const subjectService = new SubjectService(subjectRepo);
  const subjectController = new SubjectController(subjectService);

  const classSectionRepo = new ClassSectionRepository(prisma);
  const classSectionService = new ClassSectionService(classSectionRepo);
  const classSectionController = new ClassSectionController(classSectionService);

  const requirementRepo = new RequirementRepository(prisma);
  const requirementService = new RequirementService(requirementRepo, classSectionRepo);
  const requirementController = new RequirementController(requirementService);

  // Phase 3
  const studentRepo = new StudentRepository(prisma);
  const studentService = new StudentService(studentRepo);
  const studentController = new StudentController(studentService);

  const guardianRepo = new GuardianRepository(prisma);
  const guardianService = new GuardianService(guardianRepo);
  const guardianController = new GuardianController(guardianService);

  const studentGuardianRepo = new StudentGuardianRepository(prisma);
  const studentGuardianService = new StudentGuardianService(studentGuardianRepo);
  const studentGuardianController = new StudentGuardianController(studentGuardianService);

  const enrollmentRepo = new EnrollmentRepository(prisma);
  const enrollmentService = new EnrollmentService(enrollmentRepo);
  const enrollmentController = new EnrollmentController(enrollmentService);

  const teacherRepo = new TeacherRepository(prisma);
  const teacherService = new TeacherService(teacherRepo);
  const teacherController = new TeacherController(teacherService);

  // Phase 4
  const periodSetRepo = new PeriodSetRepository(prisma);
  const periodSetService = new PeriodSetService(periodSetRepo);
  const periodSetController = new PeriodSetController(periodSetService);

  const workingDayRepo = new WorkingDayRepository(prisma);
  const workingDayService = new WorkingDayService(workingDayRepo, periodSetRepo);
  const workingDayController = new WorkingDayController(workingDayService);

  const periodRepo = new PeriodRepository(prisma);
  const periodService = new PeriodService(periodRepo, periodSetRepo);
  const periodController = new PeriodController(periodService);

  const timeSlotRepo = new TimeSlotRepository(prisma);
  const timeSlotService = new TimeSlotService(timeSlotRepo, periodSetRepo);
  const timeSlotController = new TimeSlotController(timeSlotService);

  const roomRepo = new RoomRepository(prisma);
  const roomService = new RoomService(roomRepo);
  const roomController = new RoomController(roomService);

  return {
    prisma,
    controllers: {
      schoolController,
      authController,
      userController,
      roleController,
      academicYearController,
      termController,
      departmentController,
      gradeController,
      subjectController,
      classSectionController,
      requirementController,
      studentController,
      guardianController,
      studentGuardianController,
      enrollmentController,
      teacherController,
      periodSetController,
      workingDayController,
      periodController,
      timeSlotController,
      roomController,
    },
  } as const;
}
