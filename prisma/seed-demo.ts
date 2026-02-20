import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.ts';
import { hashPassword } from '../src/shared/utils/password.ts';

const DATABASE_URL = process.env['DATABASE_URL'];
if (!DATABASE_URL) {
  console.error('DATABASE_URL is required');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}

function pickN<T>(arr: readonly T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, n);
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pad(n: number, len: number): string {
  return String(n).padStart(len, '0');
}

function dateVal(y: number, m: number, d: number): Date {
  return new Date(Date.UTC(y, m - 1, d));
}

function timeVal(h: number, m: number): Date {
  return new Date(`1970-01-01T${pad(h, 2)}:${pad(m, 2)}:00.000Z`);
}

// ---------------------------------------------------------------------------
// Name & data pools
// ---------------------------------------------------------------------------

const MALE_NAMES = [
  'Ahmed', 'Mohammed', 'Omar', 'Ali', 'Hassan', 'Ibrahim', 'Khalid',
  'Youssef', 'Fahad', 'Tariq', 'Sami', 'Nasser', 'Faisal', 'Abdullah',
  'Majed', 'Sultan', 'Rashed', 'Waleed', 'Hamad', 'Saeed', 'Bandar',
  'Turki', 'Naif', 'Badr', 'Mansour', 'Abdulrahman', 'Saleh', 'Othman',
  'Adel', 'Zaid', 'Younis', 'Haitham', 'Muath', 'Anas', 'Bilal',
  'Mohannad', 'Aws', 'Ammar', 'Tamer', 'Mazen',
] as const;

const FEMALE_NAMES = [
  'Fatima', 'Aisha', 'Maryam', 'Sara', 'Nora', 'Huda', 'Lina', 'Dana',
  'Reem', 'Layla', 'Amira', 'Hana', 'Yasmin', 'Salma', 'Nouf', 'Maha',
  'Dina', 'Rana', 'Lubna', 'Asma', 'Ghada', 'Abeer', 'Wafa', 'Dalal',
  'Hajar', 'Joud', 'Lama', 'Razan', 'Shahad', 'Weaam',
] as const;

const LAST_NAMES = [
  'Al-Rashid', 'Al-Saud', 'Al-Faisal', 'Al-Harbi', 'Al-Ghamdi',
  'Al-Shehri', 'Al-Dosari', 'Al-Qahtani', 'Al-Otaibi', 'Al-Mutairi',
  'Al-Zahrani', 'Al-Maliki', 'Al-Khaldi', 'Al-Bishi', 'Al-Juhani',
  'Al-Sulaiman', 'Al-Tamimi', 'Al-Anazi', 'Al-Shamrani', 'Al-Asiri',
  'Al-Balawi', 'Al-Yami', 'Al-Hajri', 'Al-Dossary', 'Al-Thubaiti',
  'Al-Enazi', 'Al-Shahrani', 'Al-Ruwaili', 'Al-Amri', 'Al-Qurashi',
] as const;

const SUBJECTS_DATA = [
  { name: 'Mathematics', code: 'MATH', isLab: false, isElective: false },
  { name: 'Arabic Language', code: 'ARAB', isLab: false, isElective: false },
  { name: 'English Language', code: 'ENG', isLab: false, isElective: false },
  { name: 'Islamic Studies', code: 'ISL', isLab: false, isElective: false },
  { name: 'Science', code: 'SCI', isLab: false, isElective: false },
  { name: 'Physics', code: 'PHY', isLab: true, isElective: false },
  { name: 'Chemistry', code: 'CHM', isLab: true, isElective: false },
  { name: 'Biology', code: 'BIO', isLab: true, isElective: false },
  { name: 'Computer Science', code: 'CS', isLab: true, isElective: false },
  { name: 'History', code: 'HIST', isLab: false, isElective: false },
  { name: 'Geography', code: 'GEO', isLab: false, isElective: false },
  { name: 'Physical Education', code: 'PE', isLab: false, isElective: false },
] as const;

const DEPARTMENT_NAMES = [
  'Mathematics', 'Sciences', 'Languages', 'Islamic Studies',
  'Social Studies', 'Physical Education',
] as const;

const SPECIALIZATIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Arabic',
  'English', 'Islamic Studies', 'Computer Science', 'History',
  'Geography', 'Physical Education',
] as const;

const QUALIFICATIONS = [
  "Bachelor's in Education", "Master's in Education",
  "Bachelor's in Science", "Master's in Science",
  "Teaching Certificate",
] as const;

const NATIONALITIES = [
  'Saudi', 'Egyptian', 'Jordanian', 'Syrian', 'Palestinian',
  'Sudanese', 'Pakistani',
] as const;

const BLOOD_TYPES = [
  'A_POS', 'A_NEG', 'B_POS', 'B_NEG', 'AB_POS', 'AB_NEG', 'O_POS', 'O_NEG',
] as const;

const OCCUPATIONS = [
  'Engineer', 'Doctor', 'Teacher', 'Businessman', 'Accountant',
  'Lawyer', 'Government Employee', 'IT Professional', 'Pharmacist',
  'Manager', 'Architect', 'Military',
] as const;

const GRADE_NAMES = [
  'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6',
  'Grade 7', 'Grade 8', 'Grade 9', 'Grade 10', 'Grade 11', 'Grade 12',
] as const;

const FEE_CATEGORY_NAMES = [
  'Tuition Fee', 'Registration Fee', 'Lab Fee', 'Activity Fee', 'Transport Fee',
] as const;

const ANNOUNCEMENT_TITLES = [
  'School Opening Ceremony', 'Parent-Teacher Meeting Schedule',
  'Mid-Term Exam Timetable Released', 'Annual Sports Day',
  'Winter Break Announcement', 'New Library Resources Available',
  'Science Fair Registration Open', 'End of Year Celebration',
  'School Uniform Policy Update', 'Ramadan Schedule Changes',
] as const;

const EVENT_TYPES = ['holiday', 'exam_period', 'meeting', 'activity', 'ceremony', 'other'] as const;

// ---------------------------------------------------------------------------
// Main seed function
// ---------------------------------------------------------------------------

async function main() {
  console.log('Starting demo data seed...\n');

  // ---- Prerequisites ----
  const school = await prisma.school.findFirst({ where: { code: 'al-noor' } });
  if (!school) {
    console.error('Base seed must run first: npm run db:seed');
    process.exit(1);
  }

  const existingStudents = await prisma.student.count({ where: { schoolId: school.id } });
  const alNoorAlreadySeeded = existingStudents > 0;

  const adminUser = await prisma.user.findFirst({ where: { email: 'admin@alnoor.edu.sa' } });
  if (!adminUser) {
    console.error('Admin user not found. Run base seed first.');
    process.exit(1);
  }

  const roles = await prisma.role.findMany({ where: { schoolId: null } });
  const roleMap = new Map(roles.map((r) => [r.name, r.id]));

  const sid = school.id; // shorthand for schoolId
  const demoHash = await hashPassword('Demo123!');

  if (alNoorAlreadySeeded) {
    console.log('Al Noor demo data already exists, skipping to additional schools...\n');
  }

  if (!alNoorAlreadySeeded) {
  // =======================================================================
  // PHASE 2: ACADEMIC STRUCTURE
  // =======================================================================
  console.log('Phase 2: Academic structure...');

  // -- Academic Years --
  const [ay2024] = await prisma.academicYear.createManyAndReturn({
    data: [
      { schoolId: sid, name: '2024-2025', startDate: dateVal(2024, 9, 1), endDate: dateVal(2025, 6, 30), isActive: false },
      { schoolId: sid, name: '2025-2026', startDate: dateVal(2025, 9, 1), endDate: dateVal(2026, 6, 30), isActive: true },
    ],
  });
  const ay2025Id = (await prisma.academicYear.findFirst({ where: { schoolId: sid, name: '2025-2026' } }))!.id;
  const ay2024Id = ay2024!.id;
  console.log('  2 academic years created');

  // -- Terms --
  const termsData = [
    { schoolId: sid, academicYearId: ay2024Id, name: 'Term 1', startDate: dateVal(2024, 9, 1), endDate: dateVal(2024, 12, 19), orderIndex: 1 },
    { schoolId: sid, academicYearId: ay2024Id, name: 'Term 2', startDate: dateVal(2025, 1, 5), endDate: dateVal(2025, 3, 27), orderIndex: 2 },
    { schoolId: sid, academicYearId: ay2024Id, name: 'Term 3', startDate: dateVal(2025, 4, 6), endDate: dateVal(2025, 6, 30), orderIndex: 3 },
    { schoolId: sid, academicYearId: ay2025Id, name: 'Term 1', startDate: dateVal(2025, 9, 1), endDate: dateVal(2025, 12, 18), orderIndex: 1 },
    { schoolId: sid, academicYearId: ay2025Id, name: 'Term 2', startDate: dateVal(2026, 1, 4), endDate: dateVal(2026, 3, 26), orderIndex: 2 },
    { schoolId: sid, academicYearId: ay2025Id, name: 'Term 3', startDate: dateVal(2026, 4, 5), endDate: dateVal(2026, 6, 30), orderIndex: 3 },
  ];
  const terms = await prisma.term.createManyAndReturn({ data: termsData });
  const currentTerms = terms.filter((t) => t.academicYearId === ay2025Id);
  console.log(`  ${terms.length} terms created`);

  // -- Departments --
  const departments = await prisma.department.createManyAndReturn({
    data: DEPARTMENT_NAMES.map((name) => ({ schoolId: sid, name })),
  });
  console.log(`  ${departments.length} departments created`);

  // -- Grades --
  const grades = await prisma.grade.createManyAndReturn({
    data: GRADE_NAMES.map((name, i) => ({ schoolId: sid, name, levelOrder: i + 1 })),
  });
  console.log(`  ${grades.length} grades created`);

  // -- Subjects --
  const subjects = await prisma.subject.createManyAndReturn({
    data: SUBJECTS_DATA.map((s) => ({ schoolId: sid, ...s })),
  });
  console.log(`  ${subjects.length} subjects created`);

  // -- Subject-Grade mappings (all subjects available for all grades) --
  const sgData: Array<{ schoolId: string; subjectId: string; gradeId: string }> = [];
  for (const grade of grades) {
    for (const subj of subjects) {
      sgData.push({ schoolId: sid, subjectId: subj.id, gradeId: grade.id });
    }
  }
  await prisma.subjectGrade.createMany({ data: sgData });
  console.log(`  ${sgData.length} subject-grade mappings created`);

  // =======================================================================
  // PHASE 3: PEOPLE
  // =======================================================================
  console.log('Phase 3: People...');

  // -- Teachers (20) --
  const teachersData = Array.from({ length: 20 }, (_, i) => {
    const gender = i < 12 ? 'male' : 'female';
    const firstName = gender === 'male' ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    return {
      schoolId: sid,
      departmentId: departments[i % departments.length]!.id,
      teacherCode: `TCH-${pad(i + 1, 3)}`,
      firstName,
      lastName: pick(LAST_NAMES),
      gender: gender as 'male' | 'female',
      nationalId: `10${pad(randInt(10000000, 99999999), 8)}`,
      phone: `+9665${pad(randInt(10000000, 99999999), 8)}`,
      email: `teacher${pad(i + 1, 3)}@alnoor.edu.sa`,
      specialization: pick(SPECIALIZATIONS),
      qualification: pick(QUALIFICATIONS),
      hireDate: dateVal(randInt(2018, 2024), randInt(1, 12), randInt(1, 28)),
      status: 'active' as const,
    };
  });
  const teachers = await prisma.teacher.createManyAndReturn({ data: teachersData });
  console.log(`  ${teachers.length} teachers created`);

  // -- Update departments with head teachers --
  for (let i = 0; i < departments.length; i++) {
    await prisma.department.update({
      where: { id: departments[i]!.id },
      data: { headTeacherId: teachers[i]!.id },
    });
  }

  // -- Teacher-Subject mappings (each teacher teaches 2-3 subjects) --
  const tsData: Array<{ schoolId: string; teacherId: string; subjectId: string }> = [];
  for (const teacher of teachers) {
    const numSubjects = randInt(2, 3);
    const teacherSubjects = pickN(subjects, numSubjects);
    for (const subj of teacherSubjects) {
      tsData.push({ schoolId: sid, teacherId: teacher.id, subjectId: subj.id });
    }
  }
  await prisma.teacherSubject.createMany({ data: tsData, skipDuplicates: true });
  console.log(`  ${tsData.length} teacher-subject mappings created`);

  // -- Class Sections (2 per grade for current year = 24) --
  const sectionNames = ['A', 'B'];
  const csData: Array<{
    schoolId: string; academicYearId: string; gradeId: string;
    name: string; capacity: number; homeroomTeacherId: string;
  }> = [];
  let teacherIdx = 0;
  for (const grade of grades) {
    for (const secName of sectionNames) {
      csData.push({
        schoolId: sid,
        academicYearId: ay2025Id,
        gradeId: grade.id,
        name: secName,
        capacity: 30,
        homeroomTeacherId: teachers[teacherIdx % teachers.length]!.id,
      });
      teacherIdx++;
    }
  }
  const classSections = await prisma.classSection.createManyAndReturn({ data: csData });
  console.log(`  ${classSections.length} class sections created`);

  // -- Students (120) --
  const studentsData = Array.from({ length: 120 }, (_, i) => {
    const gender = i % 2 === 0 ? 'male' : 'female';
    const firstName = gender === 'male' ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    const dob = dateVal(randInt(2006, 2018), randInt(1, 12), randInt(1, 28));
    return {
      schoolId: sid,
      studentCode: `STU-${pad(i + 1, 4)}`,
      firstName,
      lastName: pick(LAST_NAMES),
      dateOfBirth: dob,
      gender: gender as 'male' | 'female',
      nationalId: `11${pad(randInt(10000000, 99999999), 8)}`,
      nationality: pick(NATIONALITIES),
      religion: 'Islam',
      bloodType: pick(BLOOD_TYPES) as any,
      phone: i > 80 ? `+9665${pad(randInt(10000000, 99999999), 8)}` : null,
      email: `student${pad(i + 1, 4)}@alnoor.edu.sa`,
      admissionDate: dateVal(randInt(2020, 2025), 9, 1),
      status: 'active' as const,
    };
  });
  const students = await prisma.student.createManyAndReturn({ data: studentsData });
  console.log(`  ${students.length} students created`);

  // -- Guardians (60) --
  const guardiansData = Array.from({ length: 60 }, (_, i) => {
    const gender = i % 3 === 0 ? 'female' : 'male';
    const firstName = gender === 'male' ? pick(MALE_NAMES) : pick(FEMALE_NAMES);
    return {
      schoolId: sid,
      firstName,
      lastName: pick(LAST_NAMES),
      phone: `+9665${pad(randInt(10000000, 99999999), 8)}`,
      email: `guardian${pad(i + 1, 3)}@example.com`,
      nationalId: `12${pad(randInt(10000000, 99999999), 8)}`,
      occupation: pick(OCCUPATIONS),
      address: `${randInt(1, 500)} ${pick(['King Fahd Rd', 'Olaya St', 'Tahlia St', 'Prince Sultan Rd', 'Al-Uruba Rd'])}, Riyadh`,
    };
  });
  const guardians = await prisma.guardian.createManyAndReturn({ data: guardiansData });
  console.log(`  ${guardians.length} guardians created`);

  // -- Student-Guardian links (each student gets 1-2 guardians) --
  const relTypes = ['father', 'mother', 'uncle', 'aunt', 'grandparent'] as const;
  const sgLinks: Array<{
    schoolId: string; studentId: string; guardianId: string;
    relationshipType: (typeof relTypes)[number]; isPrimary: boolean; isEmergencyContact: boolean;
  }> = [];
  const usedPairs = new Set<string>();
  for (let i = 0; i < students.length; i++) {
    const student = students[i]!;
    const primaryGuardian = guardians[i % guardians.length]!;
    const pairKey1 = `${student.id}-${primaryGuardian.id}`;
    if (!usedPairs.has(pairKey1)) {
      usedPairs.add(pairKey1);
      sgLinks.push({
        schoolId: sid, studentId: student.id, guardianId: primaryGuardian.id,
        relationshipType: 'father', isPrimary: true, isEmergencyContact: true,
      });
    }
    // Add a second guardian for ~60% of students
    if (i % 5 !== 0) {
      const secondGuardian = guardians[(i + 30) % guardians.length]!;
      const pairKey2 = `${student.id}-${secondGuardian.id}`;
      if (!usedPairs.has(pairKey2)) {
        usedPairs.add(pairKey2);
        sgLinks.push({
          schoolId: sid, studentId: student.id, guardianId: secondGuardian.id,
          relationshipType: 'mother', isPrimary: false, isEmergencyContact: true,
        });
      }
    }
  }
  await prisma.studentGuardian.createMany({ data: sgLinks, skipDuplicates: true });
  console.log(`  ${sgLinks.length} student-guardian links created`);

  // -- User accounts for teachers --
  const teacherUsers = await prisma.user.createManyAndReturn({
    data: teachers.map((t) => ({
      schoolId: sid,
      email: `u.teacher${t.teacherCode.replace('TCH-', '')}@alnoor.edu.sa`,
      passwordHash: demoHash,
      teacherId: t.id,
      isActive: true,
    })),
  });
  // Assign teacher role
  const teacherRoleId = roleMap.get('teacher')!;
  await prisma.userRole.createMany({
    data: teacherUsers.map((u) => ({ userId: u.id, roleId: teacherRoleId, schoolId: sid })),
  });
  console.log(`  ${teacherUsers.length} teacher user accounts created`);

  // -- User accounts for first 20 students --
  const studentUsersToCreate = students.slice(0, 20);
  const studentUsers = await prisma.user.createManyAndReturn({
    data: studentUsersToCreate.map((s) => ({
      schoolId: sid,
      email: `u.student${s.studentCode.replace('STU-', '')}@alnoor.edu.sa`,
      passwordHash: demoHash,
      studentId: s.id,
      isActive: true,
    })),
  });
  const studentRoleId = roleMap.get('student')!;
  await prisma.userRole.createMany({
    data: studentUsers.map((u) => ({ userId: u.id, roleId: studentRoleId, schoolId: sid })),
  });
  console.log(`  ${studentUsers.length} student user accounts created`);

  // -- User accounts for first 15 guardians --
  const guardianUsersToCreate = guardians.slice(0, 15);
  const guardianUsers = await prisma.user.createManyAndReturn({
    data: guardianUsersToCreate.map((g) => ({
      schoolId: sid,
      email: `u.guardian${pad(guardians.indexOf(g) + 1, 3)}@alnoor.edu.sa`,
      passwordHash: demoHash,
      guardianId: g.id,
      isActive: true,
    })),
  });
  const guardianRoleId = roleMap.get('guardian')!;
  await prisma.userRole.createMany({
    data: guardianUsers.map((u) => ({ userId: u.id, roleId: guardianRoleId, schoolId: sid })),
  });
  console.log(`  ${guardianUsers.length} guardian user accounts created`);

  // -- Enrollments (all 120 students into current year class sections) --
  const enrollData = students.map((s, i) => ({
    schoolId: sid,
    studentId: s.id,
    classSectionId: classSections[i % classSections.length]!.id,
    academicYearId: ay2025Id,
    enrolledAt: dateVal(2025, 9, 1),
    status: 'active' as const,
  }));
  await prisma.studentEnrollment.createMany({ data: enrollData });
  console.log(`  ${enrollData.length} student enrollments created`);

  // -- Class-Subject Requirements --
  const csrData: Array<{
    schoolId: string; academicYearId: string; classSectionId: string;
    subjectId: string; weeklyLessonsRequired: number;
  }> = [];
  for (const cs of classSections) {
    for (const subj of subjects) {
      csrData.push({
        schoolId: sid,
        academicYearId: ay2025Id,
        classSectionId: cs.id,
        subjectId: subj.id,
        weeklyLessonsRequired: subj.code === 'MATH' || subj.code === 'ARAB' ? 5 : subj.code === 'PE' ? 2 : 3,
      });
    }
  }
  await prisma.classSubjectRequirement.createMany({ data: csrData });
  console.log(`  ${csrData.length} class-subject requirements created`);

  // =======================================================================
  // PHASE 4: TIME & SPACE
  // =======================================================================
  console.log('Phase 4: Time & space...');

  // -- Period Set --
  const periodSet = await prisma.periodSet.create({
    data: { schoolId: sid, academicYearId: ay2025Id, name: 'Default' },
  });

  // -- Working Days (Sunday=0 to Thursday=4 for Saudi) --
  const workingDays = [0, 1, 2, 3, 4]; // Sun-Thu
  await prisma.schoolWorkingDay.createMany({
    data: [0, 1, 2, 3, 4, 5, 6].map((d) => ({
      schoolId: sid, periodSetId: periodSet.id, dayOfWeek: d,
      isActive: workingDays.includes(d),
    })),
  });
  console.log('  Working days configured (Sun-Thu)');

  // -- Periods (8 periods: 6 teaching + 2 breaks) --
  const periodsDef = [
    { name: 'Period 1', start: [7, 30], end: [8, 15], order: 1, isBreak: false },
    { name: 'Period 2', start: [8, 20], end: [9, 5], order: 2, isBreak: false },
    { name: 'Period 3', start: [9, 10], end: [9, 55], order: 3, isBreak: false },
    { name: 'Break 1', start: [9, 55], end: [10, 15], order: 4, isBreak: true },
    { name: 'Period 4', start: [10, 15], end: [11, 0], order: 5, isBreak: false },
    { name: 'Period 5', start: [11, 5], end: [11, 50], order: 6, isBreak: false },
    { name: 'Break 2', start: [11, 50], end: [12, 20], order: 7, isBreak: true },
    { name: 'Period 6', start: [12, 20], end: [13, 5], order: 8, isBreak: false },
  ];
  const periods = await prisma.period.createManyAndReturn({
    data: periodsDef.map((p) => ({
      schoolId: sid, periodSetId: periodSet.id, name: p.name,
      startTime: timeVal(p.start[0]!, p.start[1]!),
      endTime: timeVal(p.end[0]!, p.end[1]!),
      orderIndex: p.order, isBreak: p.isBreak,
    })),
  });
  const teachingPeriods = periods.filter((p) => !p.isBreak);
  console.log(`  ${periods.length} periods created (${teachingPeriods.length} teaching)`);

  // -- Time Slots (5 working days × 6 teaching periods = 30) --
  const tsSlotData: Array<{ schoolId: string; dayOfWeek: number; periodId: string }> = [];
  for (const day of workingDays) {
    for (const period of teachingPeriods) {
      tsSlotData.push({ schoolId: sid, dayOfWeek: day, periodId: period.id });
    }
  }
  const timeSlots = await prisma.timeSlot.createManyAndReturn({ data: tsSlotData });
  console.log(`  ${timeSlots.length} time slots created`);

  // -- Rooms --
  const roomsDef = [
    { name: 'Room 101', building: 'Main', floor: '1', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 102', building: 'Main', floor: '1', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 103', building: 'Main', floor: '1', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 201', building: 'Main', floor: '2', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 202', building: 'Main', floor: '2', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 203', building: 'Main', floor: '2', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 301', building: 'Main', floor: '3', capacity: 30, roomType: 'classroom' as const },
    { name: 'Room 302', building: 'Main', floor: '3', capacity: 30, roomType: 'classroom' as const },
    { name: 'Physics Lab', building: 'Science', floor: '1', capacity: 25, roomType: 'lab' as const },
    { name: 'Chemistry Lab', building: 'Science', floor: '1', capacity: 25, roomType: 'lab' as const },
    { name: 'Computer Lab', building: 'Science', floor: '2', capacity: 30, roomType: 'lab' as const },
    { name: 'Main Hall', building: 'Main', floor: 'G', capacity: 200, roomType: 'hall' as const },
    { name: 'Library', building: 'Main', floor: 'G', capacity: 50, roomType: 'library' as const },
    { name: 'Gymnasium', building: 'Sports', floor: 'G', capacity: 100, roomType: 'gym' as const },
  ];
  const rooms = await prisma.room.createManyAndReturn({
    data: roomsDef.map((r) => ({ schoolId: sid, ...r })),
  });
  const classrooms = rooms.filter((r) => r.roomType === 'classroom' || r.roomType === 'lab');
  console.log(`  ${rooms.length} rooms created`);

  // -- Room-Subject suitability (labs for lab subjects, classrooms for all) --
  const rssData: Array<{ schoolId: string; roomId: string; subjectId: string }> = [];
  for (const room of rooms) {
    if (room.roomType === 'lab') {
      const labSubjects = subjects.filter((s) => s.isLab);
      for (const subj of labSubjects) {
        rssData.push({ schoolId: sid, roomId: room.id, subjectId: subj.id });
      }
    } else if (room.roomType === 'classroom') {
      for (const subj of subjects) {
        rssData.push({ schoolId: sid, roomId: room.id, subjectId: subj.id });
      }
    }
  }
  await prisma.roomSubjectSuitability.createMany({ data: rssData, skipDuplicates: true });
  console.log(`  ${rssData.length} room-subject suitability entries created`);

  // =======================================================================
  // PHASE 5: SCHEDULING
  // =======================================================================
  console.log('Phase 5: Scheduling...');

  const currentTerm1 = currentTerms.find((t) => t.orderIndex === 1)!;

  // -- Lessons: assign a subset of class-section × subject × timeslot --
  // For each class section, create ~6 lessons (one per teaching period on one day)
  const lessonsData: Array<{
    schoolId: string; academicYearId: string; termId: string;
    classSectionId: string; subjectId: string; teacherId: string;
    roomId: string; timeSlotId: string; status: 'scheduled';
  }> = [];
  const usedSlots = new Set<string>(); // track teacher+timeSlot and room+timeSlot

  for (const cs of classSections) {
    // Each section gets lessons for each working day
    for (const day of workingDays) {
      const daySlots = timeSlots.filter((ts) => ts.dayOfWeek === day);
      for (let si = 0; si < daySlots.length && si < subjects.length; si++) {
        const slot = daySlots[si]!;
        const subj = subjects[si % subjects.length]!;
        const teacher = teachers[si % teachers.length]!;
        const room = classrooms[si % classrooms.length]!;

        const teacherSlotKey = `${teacher.id}-${slot.id}`;
        const roomSlotKey = `${room.id}-${slot.id}`;

        // Skip if teacher or room already booked at this slot
        if (usedSlots.has(teacherSlotKey) || usedSlots.has(roomSlotKey)) continue;
        usedSlots.add(teacherSlotKey);
        usedSlots.add(roomSlotKey);

        lessonsData.push({
          schoolId: sid, academicYearId: ay2025Id, termId: currentTerm1.id,
          classSectionId: cs.id, subjectId: subj.id, teacherId: teacher.id,
          roomId: room.id, timeSlotId: slot.id, status: 'scheduled',
        });
      }
    }
  }
  const lessons = await prisma.lesson.createManyAndReturn({ data: lessonsData });
  console.log(`  ${lessons.length} lessons created`);

  // -- A few substitutions --
  const subsData = [];
  for (let i = 0; i < 5 && i < lessons.length; i++) {
    const lesson = lessons[i]!;
    const subTeacher = teachers.find((t) => t.id !== lesson.teacherId) ?? teachers[0]!;
    subsData.push({
      schoolId: sid, lessonId: lesson.id,
      originalTeacherId: lesson.teacherId, substituteTeacherId: subTeacher.id,
      date: dateVal(2025, 10, 15 + i), reason: pick(['Sick leave', 'Personal leave', 'Training']),
      approvedBy: adminUser.id,
    });
  }
  await prisma.substitution.createMany({ data: subsData });
  console.log(`  ${subsData.length} substitutions created`);

  // =======================================================================
  // PHASE 6: AVAILABILITY, LEAVES & ATTENDANCE
  // =======================================================================
  console.log('Phase 6: Attendance & leaves...');

  // -- Teacher Availability --
  const taData: Array<{
    schoolId: string; teacherId: string; dayOfWeek: number;
    periodId: string; isAvailable: boolean;
  }> = [];
  for (const teacher of teachers) {
    for (const day of workingDays) {
      for (const period of teachingPeriods) {
        taData.push({
          schoolId: sid, teacherId: teacher.id, dayOfWeek: day,
          periodId: period.id, isAvailable: Math.random() > 0.1, // 90% available
        });
      }
    }
  }
  await prisma.teacherAvailability.createMany({ data: taData });
  console.log(`  ${taData.length} teacher availability entries created`);

  // -- Teacher Leaves --
  const leaveTypes = ['sick', 'personal', 'annual'] as const;
  const leaveStatuses = ['pending', 'approved', 'rejected'] as const;
  const leavesData = Array.from({ length: 12 }, (_, i) => {
    const teacher = teachers[i % teachers.length]!;
    const startDay = randInt(1, 20);
    const status = pick(leaveStatuses);
    return {
      schoolId: sid, teacherId: teacher.id,
      leaveType: pick(leaveTypes) as any,
      dateFrom: dateVal(2025, 10 + Math.floor(i / 4), startDay),
      dateTo: dateVal(2025, 10 + Math.floor(i / 4), startDay + randInt(1, 3)),
      reason: pick(['Medical appointment', 'Family emergency', 'Personal matter', 'Annual vacation']),
      status: status as any,
      approvedBy: status !== 'pending' ? adminUser.id : null,
      approvedAt: status === 'approved' ? dateVal(2025, 10, startDay - 1) : null,
    };
  });
  await prisma.teacherLeave.createMany({ data: leavesData });
  console.log(`  ${leavesData.length} teacher leaves created`);

  // -- Teacher Attendance (20 school days for all teachers) --
  const teacherAttData: Array<{
    schoolId: string; teacherId: string; date: Date;
    checkIn: Date | null; checkOut: Date | null; status: 'present' | 'absent' | 'late' | 'on_leave';
  }> = [];
  const schoolDays: Date[] = [];
  let dayCount = 0;
  let currentDate = new Date(2025, 8, 1); // Sep 1, 2025
  while (dayCount < 20) {
    const dow = currentDate.getUTCDay();
    if (dow >= 0 && dow <= 4) { // Sun-Thu
      schoolDays.push(new Date(currentDate));
      dayCount++;
    }
    currentDate = new Date(currentDate.getTime() + 86400000);
  }

  for (const teacher of teachers) {
    for (const day of schoolDays) {
      const rand = Math.random();
      let status: 'present' | 'absent' | 'late' | 'on_leave';
      if (rand < 0.85) status = 'present';
      else if (rand < 0.92) status = 'late';
      else if (rand < 0.97) status = 'absent';
      else status = 'on_leave';

      teacherAttData.push({
        schoolId: sid, teacherId: teacher.id, date: day,
        checkIn: status === 'absent' ? null : timeVal(status === 'late' ? 8 : 7, randInt(15, 45)),
        checkOut: status === 'absent' ? null : timeVal(13, randInt(5, 30)),
        status,
      });
    }
  }
  await prisma.teacherAttendance.createMany({ data: teacherAttData });
  console.log(`  ${teacherAttData.length} teacher attendance records created`);

  // -- Student Attendance (first 10 school days for all students) --
  const attStatuses = ['present', 'absent', 'late', 'excused'] as const;
  const studentAttData: Array<{
    schoolId: string; studentId: string; classSectionId: string;
    date: Date; status: (typeof attStatuses)[number]; recordedBy: string;
    notes: string | null;
  }> = [];
  const attDays = schoolDays.slice(0, 10);
  for (const student of students) {
    const enrollment = enrollData.find((e) => e.studentId === student.id)!;
    for (const day of attDays) {
      const rand = Math.random();
      let status: (typeof attStatuses)[number];
      if (rand < 0.88) status = 'present';
      else if (rand < 0.94) status = 'late';
      else if (rand < 0.98) status = 'absent';
      else status = 'excused';

      const recorder = teacherUsers[Math.floor(Math.random() * teacherUsers.length)]!;
      studentAttData.push({
        schoolId: sid, studentId: student.id,
        classSectionId: enrollment.classSectionId,
        date: day, status, recordedBy: recorder.id,
        notes: status === 'excused' ? 'Medical excuse provided' : null,
      });
    }
  }
  await prisma.studentAttendance.createMany({ data: studentAttData });
  console.log(`  ${studentAttData.length} student attendance records created`);

  // =======================================================================
  // PHASE 7: ASSESSMENT
  // =======================================================================
  console.log('Phase 7: Assessment...');

  // -- Grading Scale --
  const gradingScale = await prisma.gradingScale.create({
    data: { schoolId: sid, name: 'Standard Scale' },
  });
  const gsLevels = [
    { letter: 'A+', minScore: 95, maxScore: 100, gpaPoints: 4.00, order: 1 },
    { letter: 'A', minScore: 90, maxScore: 94.99, gpaPoints: 3.75, order: 2 },
    { letter: 'B+', minScore: 85, maxScore: 89.99, gpaPoints: 3.50, order: 3 },
    { letter: 'B', minScore: 80, maxScore: 84.99, gpaPoints: 3.00, order: 4 },
    { letter: 'C+', minScore: 75, maxScore: 79.99, gpaPoints: 2.50, order: 5 },
    { letter: 'C', minScore: 70, maxScore: 74.99, gpaPoints: 2.00, order: 6 },
    { letter: 'D+', minScore: 65, maxScore: 69.99, gpaPoints: 1.50, order: 7 },
    { letter: 'D', minScore: 60, maxScore: 64.99, gpaPoints: 1.00, order: 8 },
    { letter: 'F', minScore: 0, maxScore: 59.99, gpaPoints: 0.00, order: 9 },
  ];
  await prisma.gradingScaleLevel.createMany({
    data: gsLevels.map((l) => ({
      gradingScaleId: gradingScale.id, letter: l.letter,
      minScore: l.minScore, maxScore: l.maxScore,
      gpaPoints: l.gpaPoints, orderIndex: l.order,
    })),
  });
  console.log('  Grading scale with 9 levels created');

  // -- Exams --
  const examTypes = ['quiz', 'midterm', 'final', 'assignment'] as const;
  const examsData = [
    { name: 'Quiz 1', examType: 'quiz' as const, weight: 10, termIdx: 0, startOff: 20, endOff: 21 },
    { name: 'Midterm Exam', examType: 'midterm' as const, weight: 30, termIdx: 0, startOff: 45, endOff: 50 },
    { name: 'Quiz 2', examType: 'quiz' as const, weight: 10, termIdx: 0, startOff: 70, endOff: 71 },
    { name: 'Final Exam Term 1', examType: 'final' as const, weight: 50, termIdx: 0, startOff: 95, endOff: 105 },
  ];

  const exams = await prisma.exam.createManyAndReturn({
    data: examsData.map((e) => {
      const term = currentTerms[e.termIdx]!;
      const startMs = term.startDate.getTime() + e.startOff * 86400000;
      const endMs = term.startDate.getTime() + e.endOff * 86400000;
      return {
        schoolId: sid, academicYearId: ay2025Id, termId: term.id,
        gradingScaleId: gradingScale.id, name: e.name, examType: e.examType,
        weight: e.weight, startDate: new Date(startMs), endDate: new Date(endMs),
      };
    }),
  });
  console.log(`  ${exams.length} exams created`);

  // -- Exam Subjects (for each exam, add 4 subjects for 3 grades) --
  const examSubjectsData: Array<{
    schoolId: string; examId: string; subjectId: string; gradeId: string;
    maxScore: number; passScore: number; examDate: Date | null;
  }> = [];
  const coreSubjects = subjects.slice(0, 5); // MATH, ARAB, ENG, ISL, SCI
  const examGrades = grades.slice(6, 9); // Grade 7-9
  for (const exam of exams) {
    for (const subj of coreSubjects) {
      for (const grade of examGrades) {
        examSubjectsData.push({
          schoolId: sid, examId: exam.id, subjectId: subj.id, gradeId: grade.id,
          maxScore: 100, passScore: 60,
          examDate: exam.startDate ? new Date(exam.startDate.getTime() + randInt(0, 3) * 86400000) : null,
        });
      }
    }
  }
  const examSubjects = await prisma.examSubject.createManyAndReturn({ data: examSubjectsData });
  console.log(`  ${examSubjects.length} exam-subject entries created`);

  // -- Student Grades (for students enrolled in grades 7-9 × exam subjects) --
  const gradableStudents = students.filter((_, i) => {
    const cs = classSections[i % classSections.length]!;
    return examGrades.some((g) => g.id === cs.gradeId);
  });

  const studentGradesData: Array<{
    schoolId: string; studentId: string; examSubjectId: string;
    score: number; gradeLetter: string; gradedBy: string; gradedAt: Date;
    notes: string | null;
  }> = [];

  function getLetterGrade(score: number): string {
    if (score >= 95) return 'A+';
    if (score >= 90) return 'A';
    if (score >= 85) return 'B+';
    if (score >= 80) return 'B';
    if (score >= 75) return 'C+';
    if (score >= 70) return 'C';
    if (score >= 65) return 'D+';
    if (score >= 60) return 'D';
    return 'F';
  }

  const usedStudentExamSubject = new Set<string>();
  for (const student of gradableStudents.slice(0, 40)) {
    // Find which grade this student's class section belongs to
    const enrollment = enrollData.find((e) => e.studentId === student.id)!;
    const cs = classSections.find((c) => c.id === enrollment.classSectionId)!;

    // Get exam subjects for this student's grade
    const relevantExamSubjects = examSubjects.filter((es) => es.gradeId === cs.gradeId);
    for (const es of relevantExamSubjects) {
      const key = `${student.id}-${es.id}`;
      if (usedStudentExamSubject.has(key)) continue;
      usedStudentExamSubject.add(key);

      const score = randInt(45, 100);
      const grader = teacherUsers[Math.floor(Math.random() * teacherUsers.length)]!;
      studentGradesData.push({
        schoolId: sid, studentId: student.id, examSubjectId: es.id,
        score, gradeLetter: getLetterGrade(score),
        gradedBy: grader.id, gradedAt: new Date(),
        notes: score < 60 ? 'Needs improvement' : null,
      });
    }
  }
  await prisma.studentGrade.createMany({ data: studentGradesData, skipDuplicates: true });
  console.log(`  ${studentGradesData.length} student grades created`);

  // -- Report Card Snapshots (for 20 students in Term 1) --
  const rcStudents = gradableStudents.slice(0, 20);
  const rcData = rcStudents.map((student, i) => {
    const enrollment = enrollData.find((e) => e.studentId === student.id)!;
    const gpa = (Math.random() * 2 + 2).toFixed(2); // 2.00-4.00
    const pct = (Math.random() * 30 + 65).toFixed(2); // 65-95%
    return {
      schoolId: sid, studentId: student.id, academicYearId: ay2025Id,
      termId: currentTerm1.id, classSectionId: enrollment.classSectionId,
      snapshotData: {
        subjects: coreSubjects.map((s) => ({
          name: s.name, score: randInt(60, 100), grade: getLetterGrade(randInt(60, 100)),
        })),
      },
      overallGpa: parseFloat(gpa), overallPercentage: parseFloat(pct),
      rankInClass: i + 1,
      teacherRemarks: pick([
        'Excellent performance', 'Good effort, keep it up',
        'Shows improvement', 'Needs more focus on weak areas',
        'Outstanding academic achievement',
      ]),
      generatedBy: adminUser.id, generatedAt: new Date(),
    };
  });
  await prisma.reportCardSnapshot.createMany({ data: rcData });
  console.log(`  ${rcData.length} report card snapshots created`);

  // =======================================================================
  // PHASE 8: FINANCE
  // =======================================================================
  console.log('Phase 8: Finance...');

  // -- Fee Categories --
  const feeCategories = await prisma.feeCategory.createManyAndReturn({
    data: FEE_CATEGORY_NAMES.map((name) => ({ schoolId: sid, name })),
  });
  console.log(`  ${feeCategories.length} fee categories created`);

  // -- Fee Structures (for each grade × first 3 categories) --
  const feeStructuresData: Array<{
    schoolId: string; academicYearId: string; gradeId: string;
    feeCategoryId: string; name: string; amount: number;
    dueDate: Date; isRecurring: boolean; recurrence: 'term' | null;
  }> = [];
  const amounts: Record<string, number> = {
    'Tuition Fee': 5000, 'Registration Fee': 1000, 'Lab Fee': 500,
    'Activity Fee': 300, 'Transport Fee': 2000,
  };
  for (const grade of grades) {
    for (const cat of feeCategories) {
      feeStructuresData.push({
        schoolId: sid, academicYearId: ay2025Id, gradeId: grade.id,
        feeCategoryId: cat.id, name: `${cat.name} - ${grade.name}`,
        amount: amounts[cat.name] ?? 500,
        dueDate: dateVal(2025, 9, 15),
        isRecurring: cat.name === 'Tuition Fee',
        recurrence: cat.name === 'Tuition Fee' ? 'term' : null,
      });
    }
  }
  const feeStructures = await prisma.feeStructure.createManyAndReturn({ data: feeStructuresData });
  console.log(`  ${feeStructures.length} fee structures created`);

  // -- Fee Discounts (10% discount for 10 students) --
  const discountStudents = students.slice(0, 10);
  const discountsData = discountStudents.map((student) => {
    const enrollment = enrollData.find((e) => e.studentId === student.id)!;
    const cs = classSections.find((c) => c.id === enrollment.classSectionId)!;
    const tuitionStructure = feeStructures.find(
      (fs) => fs.gradeId === cs.gradeId && fs.name.includes('Tuition'),
    );
    return {
      schoolId: sid, studentId: student.id,
      feeStructureId: tuitionStructure?.id ?? feeStructures[0]!.id,
      discountType: 'percentage' as const, amount: 10,
      reason: pick(['Sibling discount', 'Merit scholarship', 'Staff child', 'Financial hardship']),
      approvedBy: adminUser.id,
    };
  });
  await prisma.feeDiscount.createMany({ data: discountsData, skipDuplicates: true });
  console.log(`  ${discountsData.length} fee discounts created`);

  // -- Fee Invoices (1 per student, with items) --
  const invoicesData: Array<{
    schoolId: string; studentId: string; invoiceNumber: string;
    totalAmount: number; discountAmount: number; netAmount: number;
    status: 'draft' | 'issued' | 'partially_paid' | 'paid' | 'overdue';
    issuedAt: Date | null; dueDate: Date;
  }> = [];
  const invoiceItemsToCreate: Array<{
    schoolId: string; invoiceNumber: string;
    feeStructureId: string; description: string;
    quantity: number; unitAmount: number; totalAmount: number;
  }> = [];

  for (let i = 0; i < students.length; i++) {
    const student = students[i]!;
    const enrollment = enrollData.find((e) => e.studentId === student.id)!;
    const cs = classSections.find((c) => c.id === enrollment.classSectionId)!;

    // Get fee structures for this student's grade
    const gradeStructures = feeStructures.filter((fs) => fs.gradeId === cs.gradeId).slice(0, 3);
    const total = gradeStructures.reduce((sum, fs) => sum + Number(fs.amount), 0);
    const hasDiscount = discountStudents.some((ds) => ds.id === student.id);
    const discount = hasDiscount ? total * 0.1 : 0;
    const net = total - discount;

    const rand = Math.random();
    let status: 'issued' | 'paid' | 'partially_paid' | 'overdue';
    if (rand < 0.4) status = 'paid';
    else if (rand < 0.65) status = 'partially_paid';
    else if (rand < 0.85) status = 'issued';
    else status = 'overdue';

    const invNum = `INV-2025-${pad(i + 1, 5)}`;
    invoicesData.push({
      schoolId: sid, studentId: student.id, invoiceNumber: invNum,
      totalAmount: total, discountAmount: discount, netAmount: net,
      status, issuedAt: dateVal(2025, 9, 15), dueDate: dateVal(2025, 10, 15),
    });

    for (const fs of gradeStructures) {
      invoiceItemsToCreate.push({
        schoolId: sid, invoiceNumber: invNum,
        feeStructureId: fs.id, description: fs.name,
        quantity: 1, unitAmount: Number(fs.amount), totalAmount: Number(fs.amount),
      });
    }
  }

  const invoices = await prisma.feeInvoice.createManyAndReturn({ data: invoicesData });
  console.log(`  ${invoices.length} fee invoices created`);

  // Create invoice items (need invoice IDs)
  const invoiceMap = new Map(invoices.map((inv) => [inv.invoiceNumber, inv.id]));
  const itemsData = invoiceItemsToCreate.map((item) => ({
    schoolId: sid, invoiceId: invoiceMap.get(item.invoiceNumber)!,
    feeStructureId: item.feeStructureId, description: item.description,
    quantity: item.quantity, unitAmount: item.unitAmount, totalAmount: item.totalAmount,
  }));
  await prisma.feeInvoiceItem.createMany({ data: itemsData });
  console.log(`  ${itemsData.length} invoice items created`);

  // -- Fee Payments (for paid & partially_paid invoices) --
  const paymentMethods = ['cash', 'bank_transfer', 'card', 'online'] as const;
  const paymentsData: Array<{
    schoolId: string; invoiceId: string; amountPaid: number;
    paymentDate: Date; paymentMethod: (typeof paymentMethods)[number];
    referenceNumber: string; receivedBy: string; notes: string | null;
  }> = [];
  for (const inv of invoices) {
    if (inv.status === 'paid') {
      paymentsData.push({
        schoolId: sid, invoiceId: inv.id, amountPaid: Number(inv.netAmount),
        paymentDate: dateVal(2025, 10, randInt(1, 14)),
        paymentMethod: pick(paymentMethods),
        referenceNumber: `PAY-${pad(paymentsData.length + 1, 6)}`,
        receivedBy: adminUser.id, notes: null,
      });
    } else if (inv.status === 'partially_paid') {
      const partial = Math.round(Number(inv.netAmount) * 0.5);
      paymentsData.push({
        schoolId: sid, invoiceId: inv.id, amountPaid: partial,
        paymentDate: dateVal(2025, 10, randInt(1, 14)),
        paymentMethod: pick(paymentMethods),
        referenceNumber: `PAY-${pad(paymentsData.length + 1, 6)}`,
        receivedBy: adminUser.id, notes: 'Partial payment',
      });
    }
  }
  await prisma.feePayment.createMany({ data: paymentsData });
  console.log(`  ${paymentsData.length} fee payments created`);

  // =======================================================================
  // PHASE 9: COMMUNICATION
  // =======================================================================
  console.log('Phase 9: Communication...');

  // -- Announcements --
  const announcementsData = ANNOUNCEMENT_TITLES.map((title, i) => ({
    schoolId: sid, title, body: `This is the full content of the announcement: ${title}. Please read carefully and take note of all relevant details.`,
    publishedBy: adminUser.id,
    publishedAt: i < 7 ? dateVal(2025, 9, randInt(1, 28)) : null,
    isDraft: i >= 7,
  }));
  const announcements = await prisma.announcement.createManyAndReturn({ data: announcementsData });

  // Announcement targets
  const atData: Array<{
    announcementId: string; targetType: 'all' | 'role' | 'grade';
    targetRoleId: string | null; targetGradeId: string | null;
    targetClassSectionId: string | null;
  }> = [];
  for (const ann of announcements) {
    if (Math.random() < 0.5) {
      atData.push({
        announcementId: ann.id, targetType: 'all',
        targetRoleId: null, targetGradeId: null, targetClassSectionId: null,
      });
    } else {
      atData.push({
        announcementId: ann.id, targetType: 'grade',
        targetRoleId: null, targetGradeId: pick(grades).id, targetClassSectionId: null,
      });
    }
  }
  await prisma.announcementTarget.createMany({ data: atData });
  console.log(`  ${announcements.length} announcements created`);

  // -- Notifications --
  const allUserIds = [adminUser.id, ...teacherUsers.map((u) => u.id), ...studentUsers.map((u) => u.id)];
  const notifData = Array.from({ length: 50 }, (_, i) => ({
    schoolId: sid, userId: pick(allUserIds),
    title: pick(['New assignment posted', 'Grade updated', 'Fee reminder', 'Schedule change', 'New announcement']),
    body: 'Please check the relevant section for more details.',
    channel: pick(['in_app', 'email']) as any,
    isRead: Math.random() < 0.6,
    readAt: Math.random() < 0.6 ? new Date() : null,
    sentAt: new Date(Date.now() - randInt(1, 30) * 86400000),
  }));
  await prisma.notification.createMany({ data: notifData });
  console.log(`  ${notifData.length} notifications created`);

  // -- Academic Events --
  const eventsData = [
    { title: 'Saudi National Day', eventType: 'holiday' as const, start: dateVal(2025, 9, 23), end: dateVal(2025, 9, 23), closed: true },
    { title: 'Midterm Exams', eventType: 'exam_period' as const, start: dateVal(2025, 10, 20), end: dateVal(2025, 10, 30), closed: false },
    { title: 'Parent-Teacher Conference', eventType: 'meeting' as const, start: dateVal(2025, 11, 5), end: dateVal(2025, 11, 5), closed: false },
    { title: 'Winter Break', eventType: 'holiday' as const, start: dateVal(2025, 12, 19), end: dateVal(2026, 1, 3), closed: true },
    { title: 'Science Fair', eventType: 'activity' as const, start: dateVal(2026, 2, 10), end: dateVal(2026, 2, 12), closed: false },
    { title: 'Sports Day', eventType: 'activity' as const, start: dateVal(2026, 3, 5), end: dateVal(2026, 3, 5), closed: false },
    { title: 'Final Exams', eventType: 'exam_period' as const, start: dateVal(2026, 6, 1), end: dateVal(2026, 6, 15), closed: false },
    { title: 'Graduation Ceremony', eventType: 'ceremony' as const, start: dateVal(2026, 6, 25), end: dateVal(2026, 6, 25), closed: false },
    { title: 'Ramadan Break', eventType: 'holiday' as const, start: dateVal(2026, 2, 18), end: dateVal(2026, 3, 1), closed: true },
    { title: 'Eid Al-Fitr', eventType: 'holiday' as const, start: dateVal(2026, 3, 2), end: dateVal(2026, 3, 8), closed: true },
  ];
  await prisma.academicEvent.createMany({
    data: eventsData.map((e) => ({
      schoolId: sid, academicYearId: ay2025Id, title: e.title,
      description: `${e.title} - important school event`,
      eventType: e.eventType, startDate: e.start, endDate: e.end,
      isSchoolClosed: e.closed,
    })),
  });
  console.log(`  ${eventsData.length} academic events created`);

  } // end if (!alNoorAlreadySeeded)

  // =======================================================================
  // SECOND SCHOOL (lighter data)
  // =======================================================================
  console.log('\nPhase: Second school (Riyadh Modern School)...');

  const existingSchool2 = await prisma.school.findFirst({ where: { code: 'riyadh-modern' } });
  if (existingSchool2) {
    console.log('  Riyadh Modern School already exists, skipping.');
  }

  const school2 = existingSchool2 ?? await prisma.school.create({
    data: {
      name: 'Riyadh Modern School', code: 'riyadh-modern',
      timezone: 'Asia/Riyadh', defaultLocale: 'ar', currency: 'SAR',
      country: 'Saudi Arabia', city: 'Riyadh', address: '456 Prince Turki Rd',
      phone: '+966509876543', email: 'info@riyadhmodern.edu.sa',
      subscriptionPlan: 'basic', status: 'active',
    },
  });
  const sid2 = school2.id;
  const schoolAdminRoleId = roleMap.get('school_admin')!;

  if (!existingSchool2) {
  // School 2 admin
  const school2Admin = await prisma.user.create({
    data: {
      schoolId: sid2, email: 'admin@riyadhmodern.edu.sa',
      passwordHash: demoHash, isActive: true,
    },
  });
  await prisma.userRole.create({
    data: { userId: school2Admin.id, roleId: schoolAdminRoleId, schoolId: sid2 },
  });

  // School 2 academic year + terms
  const s2ay = await prisma.academicYear.create({
    data: { schoolId: sid2, name: '2025-2026', startDate: dateVal(2025, 9, 1), endDate: dateVal(2026, 6, 30), isActive: true },
  });
  const s2terms = await prisma.term.createManyAndReturn({
    data: [
      { schoolId: sid2, academicYearId: s2ay.id, name: 'Term 1', startDate: dateVal(2025, 9, 1), endDate: dateVal(2025, 12, 18), orderIndex: 1 },
      { schoolId: sid2, academicYearId: s2ay.id, name: 'Term 2', startDate: dateVal(2026, 1, 4), endDate: dateVal(2026, 3, 26), orderIndex: 2 },
      { schoolId: sid2, academicYearId: s2ay.id, name: 'Term 3', startDate: dateVal(2026, 4, 5), endDate: dateVal(2026, 6, 30), orderIndex: 3 },
    ],
  });

  // School 2 departments
  const s2depts = await prisma.department.createManyAndReturn({
    data: ['Mathematics', 'Sciences', 'Languages'].map((name) => ({ schoolId: sid2, name })),
  });

  // School 2 grades (1-6 only)
  const s2grades = await prisma.grade.createManyAndReturn({
    data: GRADE_NAMES.slice(0, 6).map((name, i) => ({ schoolId: sid2, name, levelOrder: i + 1 })),
  });

  // School 2 subjects (6 core)
  const s2subjects = await prisma.subject.createManyAndReturn({
    data: SUBJECTS_DATA.slice(0, 6).map((s) => ({ schoolId: sid2, ...s })),
  });

  // School 2 subject-grade mappings
  const s2sgData: Array<{ schoolId: string; subjectId: string; gradeId: string }> = [];
  for (const grade of s2grades) {
    for (const subj of s2subjects) {
      s2sgData.push({ schoolId: sid2, subjectId: subj.id, gradeId: grade.id });
    }
  }
  await prisma.subjectGrade.createMany({ data: s2sgData });

  // School 2 teachers (10)
  const s2teachers = await prisma.teacher.createManyAndReturn({
    data: Array.from({ length: 10 }, (_, i) => ({
      schoolId: sid2,
      departmentId: s2depts[i % s2depts.length]!.id,
      teacherCode: `TCH-${pad(i + 1, 3)}`,
      firstName: pick(i < 6 ? MALE_NAMES : FEMALE_NAMES),
      lastName: pick(LAST_NAMES),
      gender: (i < 6 ? 'male' : 'female') as 'male' | 'female',
      phone: `+9665${pad(randInt(10000000, 99999999), 8)}`,
      email: `teacher${pad(i + 1, 3)}@riyadhmodern.edu.sa`,
      specialization: pick(SPECIALIZATIONS),
      qualification: pick(QUALIFICATIONS),
      hireDate: dateVal(randInt(2019, 2024), randInt(1, 12), randInt(1, 28)),
      status: 'active' as const,
    })),
  });

  // School 2 class sections (1 per grade = 6)
  const s2sections = await prisma.classSection.createManyAndReturn({
    data: s2grades.map((grade, i) => ({
      schoolId: sid2, academicYearId: s2ay.id, gradeId: grade.id,
      name: 'A', capacity: 25,
      homeroomTeacherId: s2teachers[i % s2teachers.length]!.id,
    })),
  });

  // School 2 students (50)
  const s2students = await prisma.student.createManyAndReturn({
    data: Array.from({ length: 50 }, (_, i) => ({
      schoolId: sid2,
      studentCode: `STU-${pad(i + 1, 4)}`,
      firstName: pick(i % 2 === 0 ? MALE_NAMES : FEMALE_NAMES),
      lastName: pick(LAST_NAMES),
      dateOfBirth: dateVal(randInt(2012, 2019), randInt(1, 12), randInt(1, 28)),
      gender: (i % 2 === 0 ? 'male' : 'female') as 'male' | 'female',
      nationality: pick(NATIONALITIES),
      admissionDate: dateVal(2025, 9, 1),
      status: 'active' as const,
    })),
  });

  // School 2 enrollments
  await prisma.studentEnrollment.createMany({
    data: s2students.map((s, i) => ({
      schoolId: sid2, studentId: s.id,
      classSectionId: s2sections[i % s2sections.length]!.id,
      academicYearId: s2ay.id, enrolledAt: dateVal(2025, 9, 1), status: 'active' as const,
    })),
  });

  // School 2 guardians (25)
  const s2guardians = await prisma.guardian.createManyAndReturn({
    data: Array.from({ length: 25 }, (_, i) => ({
      schoolId: sid2,
      firstName: pick(i % 3 === 0 ? FEMALE_NAMES : MALE_NAMES),
      lastName: pick(LAST_NAMES),
      phone: `+9665${pad(randInt(10000000, 99999999), 8)}`,
      email: `guardian${pad(i + 1, 3)}@riyadhmodern.example.com`,
      occupation: pick(OCCUPATIONS),
    })),
  });

  // School 2 student-guardian links
  const s2sgLinks = s2students.map((student, i) => ({
    schoolId: sid2, studentId: student.id,
    guardianId: s2guardians[i % s2guardians.length]!.id,
    relationshipType: 'father' as const, isPrimary: true, isEmergencyContact: true,
  }));
  await prisma.studentGuardian.createMany({ data: s2sgLinks, skipDuplicates: true });

  // School 2 rooms (4)
  await prisma.room.createMany({
    data: [
      { schoolId: sid2, name: 'Room A1', building: 'Main', floor: '1', capacity: 25, roomType: 'classroom' as const },
      { schoolId: sid2, name: 'Room A2', building: 'Main', floor: '1', capacity: 25, roomType: 'classroom' as const },
      { schoolId: sid2, name: 'Room B1', building: 'Main', floor: '2', capacity: 25, roomType: 'classroom' as const },
      { schoolId: sid2, name: 'Science Lab', building: 'Main', floor: '2', capacity: 20, roomType: 'lab' as const },
    ],
  });

  // School 2 fee categories & structures
  const s2feeCats = await prisma.feeCategory.createManyAndReturn({
    data: ['Tuition Fee', 'Registration Fee', 'Activity Fee'].map((name) => ({ schoolId: sid2, name })),
  });
  await prisma.feeStructure.createMany({
    data: s2grades.flatMap((grade) =>
      s2feeCats.map((cat) => ({
        schoolId: sid2, academicYearId: s2ay.id, gradeId: grade.id,
        feeCategoryId: cat.id, name: `${cat.name} - ${grade.name}`,
        amount: cat.name === 'Tuition Fee' ? 3000 : cat.name === 'Registration Fee' ? 500 : 200,
        dueDate: dateVal(2025, 9, 15), isRecurring: false,
      })),
    ),
  });

  console.log('  Second school seeded (50 students, 10 teachers, 25 guardians)');
  } // end if (!existingSchool2)

  // =======================================================================
  // THIRD SCHOOL
  // =======================================================================
  console.log('\nPhase: Third school (Jeddah International School)...');

  const existingSchool3 = await prisma.school.findFirst({ where: { code: 'jeddah-intl' } });
  if (existingSchool3) {
    console.log('  Jeddah International School already exists, skipping.');
  }

  const school3 = existingSchool3 ?? await prisma.school.create({
    data: {
      name: 'Jeddah International School', code: 'jeddah-intl',
      timezone: 'Asia/Riyadh', defaultLocale: 'en', currency: 'SAR',
      country: 'Saudi Arabia', city: 'Jeddah', address: '789 Corniche Rd',
      phone: '+966521234567', email: 'info@jeddahintl.edu.sa',
      subscriptionPlan: 'enterprise', status: 'active',
    },
  });
  const sid3 = school3.id;

  if (!existingSchool3) {
  // School 3 admin
  const school3Admin = await prisma.user.create({
    data: {
      schoolId: sid3, email: 'admin@jeddahintl.edu.sa',
      passwordHash: demoHash, isActive: true,
    },
  });
  await prisma.userRole.create({
    data: { userId: school3Admin.id, roleId: schoolAdminRoleId, schoolId: sid3 },
  });

  // School 3 academic year
  const s3ay = await prisma.academicYear.create({
    data: { schoolId: sid3, name: '2025-2026', startDate: dateVal(2025, 9, 1), endDate: dateVal(2026, 6, 30), isActive: true },
  });
  await prisma.term.createMany({
    data: [
      { schoolId: sid3, academicYearId: s3ay.id, name: 'Semester 1', startDate: dateVal(2025, 9, 1), endDate: dateVal(2026, 1, 15), orderIndex: 1 },
      { schoolId: sid3, academicYearId: s3ay.id, name: 'Semester 2', startDate: dateVal(2026, 1, 25), endDate: dateVal(2026, 6, 15), orderIndex: 2 },
    ],
  });

  // School 3 grades, teachers, students (minimal)
  const s3grades = await prisma.grade.createManyAndReturn({
    data: ['KG1', 'KG2', 'Grade 1', 'Grade 2', 'Grade 3'].map((name, i) => ({
      schoolId: sid3, name, levelOrder: i + 1,
    })),
  });
  const s3subjects = await prisma.subject.createManyAndReturn({
    data: SUBJECTS_DATA.slice(0, 4).map((s) => ({ schoolId: sid3, ...s })),
  });
  const s3teachers = await prisma.teacher.createManyAndReturn({
    data: Array.from({ length: 8 }, (_, i) => ({
      schoolId: sid3,
      teacherCode: `TCH-${pad(i + 1, 3)}`,
      firstName: pick(i < 4 ? MALE_NAMES : FEMALE_NAMES),
      lastName: pick(LAST_NAMES),
      gender: (i < 4 ? 'male' : 'female') as 'male' | 'female',
      email: `teacher${pad(i + 1, 3)}@jeddahintl.edu.sa`,
      hireDate: dateVal(randInt(2020, 2024), randInt(1, 12), randInt(1, 28)),
      status: 'active' as const,
    })),
  });
  const s3sections = await prisma.classSection.createManyAndReturn({
    data: s3grades.map((grade, i) => ({
      schoolId: sid3, academicYearId: s3ay.id, gradeId: grade.id,
      name: 'A', capacity: 20,
      homeroomTeacherId: s3teachers[i % s3teachers.length]!.id,
    })),
  });
  const s3students = await prisma.student.createManyAndReturn({
    data: Array.from({ length: 30 }, (_, i) => ({
      schoolId: sid3,
      studentCode: `STU-${pad(i + 1, 4)}`,
      firstName: pick(i % 2 === 0 ? MALE_NAMES : FEMALE_NAMES),
      lastName: pick(LAST_NAMES),
      dateOfBirth: dateVal(randInt(2016, 2021), randInt(1, 12), randInt(1, 28)),
      gender: (i % 2 === 0 ? 'male' : 'female') as 'male' | 'female',
      admissionDate: dateVal(2025, 9, 1),
      status: 'active' as const,
    })),
  });
  await prisma.studentEnrollment.createMany({
    data: s3students.map((s, i) => ({
      schoolId: sid3, studentId: s.id,
      classSectionId: s3sections[i % s3sections.length]!.id,
      academicYearId: s3ay.id, enrolledAt: dateVal(2025, 9, 1), status: 'active' as const,
    })),
  });

  console.log('  Third school seeded (30 students, 8 teachers)');
  } // end if (!existingSchool3)

  // =======================================================================
  // SUMMARY
  // =======================================================================
  const totalStudents = await prisma.student.count();
  const totalTeachers = await prisma.teacher.count();
  const totalUsers = await prisma.user.count();
  const totalLessons = await prisma.lesson.count();
  const totalAttendance = await prisma.studentAttendance.count();
  const totalInvoices = await prisma.feeInvoice.count();

  console.log('\n========================================');
  console.log('Demo data seed completed!');
  console.log('========================================');
  const totalSchools = await prisma.school.count();
  console.log(`  Schools:           ${totalSchools}`);
  console.log(`  Users:             ${totalUsers}`);
  console.log(`  Teachers:          ${totalTeachers}`);
  console.log(`  Students:          ${totalStudents}`);
  console.log(`  Lessons:           ${totalLessons}`);
  console.log(`  Attendance recs:   ${totalAttendance}`);
  console.log(`  Fee invoices:      ${totalInvoices}`);
  console.log('========================================');
  console.log('\nDemo credentials (all schools):');
  console.log('  Password for all demo accounts: Demo123!');
  console.log('  Teacher emails: u.teacher001@alnoor.edu.sa ... u.teacher020@alnoor.edu.sa');
  console.log('  Student emails: u.student0001@alnoor.edu.sa ... u.student0020@alnoor.edu.sa');
  console.log('  Guardian emails: u.guardian001@alnoor.edu.sa ... u.guardian015@alnoor.edu.sa');
  console.log('  School 2 admin: admin@riyadhmodern.edu.sa');
  console.log('  School 3 admin: admin@jeddahintl.edu.sa');
}

main()
  .catch((e) => {
    console.error('Demo seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
