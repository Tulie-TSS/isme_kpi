import { Client } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env.local file
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;

if (!connectionString) {
  console.error("❌ DATABASE_URL or DIRECT_URL is missing in environment variables!");
  process.exit(1);
}

const client = new Client({
  connectionString,
  ssl: { rejectUnauthorized: false }
});

async function main() {
  console.log("🔄 Connecting to Supabase database...");
  await client.connect();
  console.log("✅ Connected successfully!");

  console.log("🧹 Dropping existing tables if resetting...");
  // Drop table order matters due to foreign key constraints!
  const dropTables = [
    'course_edit_requests',
    'kpi_edit_requests',
    'manager_questions',
    'tasks',
    'courses',
    'programs',
    'kpi_snapshots',
    'other_activities',
    'labor_disciplines',
    'reviews',
    'review_cycles',
    'kpi_definitions',
    'users'
  ];
  
  for (const table of dropTables) {
    await client.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
  }
  console.log("✅ Cleaned old database tables!");

  console.log("🛠 Creating database tables...");

  // 1. Users
  await client.query(`
    CREATE TABLE users (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      role VARCHAR(50) NOT NULL,
      roles TEXT[] NOT NULL,
      manager_id VARCHAR(50) REFERENCES users(id),
      avatar_url TEXT,
      active BOOLEAN DEFAULT TRUE,
      position VARCHAR(100)
    )
  `);

  // 2. Programs
  await client.query(`
    CREATE TABLE programs (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      type VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'active',
      short_name VARCHAR(50) NOT NULL,
      manager_id VARCHAR(50) REFERENCES users(id),
      secondary_manager_id VARCHAR(50) REFERENCES users(id)
    )
  `);

  // 3. Courses (Môn học)
  await client.query(`
    CREATE TABLE courses (
      id VARCHAR(50) PRIMARY KEY,
      program_id VARCHAR(50) NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      cohort VARCHAR(100) NOT NULL,
      num_lecturers INTEGER NOT NULL DEFAULT 1,
      num_students INTEGER NOT NULL DEFAULT 0,
      attendance_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0,
      attendance_target NUMERIC(5,4) NOT NULL DEFAULT 0.95,
      pass_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0,
      submit_rate NUMERIC(5,4) NOT NULL DEFAULT 0.0,
      pass_target NUMERIC(5,4) NOT NULL DEFAULT 0.95
    )
  `);

  // 4. KPI Definitions (Tiêu chí KPI)
  await client.query(`
    CREATE TABLE kpi_definitions (
      id VARCHAR(50) PRIMARY KEY,
      group_id VARCHAR(50) NOT NULL,
      stt INTEGER NOT NULL,
      name VARCHAR(255) NOT NULL,
      short_name VARCHAR(100) NOT NULL,
      description TEXT,
      criteria TEXT,
      unit VARCHAR(50) NOT NULL,
      weight INTEGER NOT NULL
    )
  `);

  // 5. KPI Snapshots
  await client.query(`
    CREATE TABLE kpi_snapshots (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kpi_definition_id VARCHAR(50) NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
      period VARCHAR(100) NOT NULL,
      score NUMERIC(6,2) NOT NULL DEFAULT 0.0,
      target_value NUMERIC(10,2) NOT NULL DEFAULT 0.0,
      actual_value NUMERIC(10,2) NOT NULL DEFAULT 0.0,
      raw_numerator NUMERIC(10,2) NOT NULL DEFAULT 0.0,
      raw_denominator NUMERIC(10,2) NOT NULL DEFAULT 0.0,
      manager_score NUMERIC(6,2),
      leader_score NUMERIC(6,2),
      calculated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 6. Other Activities
  await client.query(`
    CREATE TABLE other_activities (
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(100) NOT NULL,
      admission BOOLEAN NOT NULL DEFAULT FALSE,
      study_abroad BOOLEAN NOT NULL DEFAULT FALSE,
      exchange BOOLEAN NOT NULL DEFAULT FALSE,
      other_institute BOOLEAN NOT NULL DEFAULT FALSE,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, period)
    )
  `);

  // 7. Labor Disciplines
  await client.query(`
    CREATE TABLE labor_disciplines (
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(100) NOT NULL,
      score NUMERIC(6,2) NOT NULL DEFAULT 100.0,
      note TEXT,
      updated_by VARCHAR(50) REFERENCES users(id),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, period)
    )
  `);

  // 8. Review Cycles
  await client.query(`
    CREATE TABLE review_cycles (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      review_deadline DATE NOT NULL,
      status VARCHAR(50) NOT NULL
    )
  `);

  // 9. Reviews
  await client.query(`
    CREATE TABLE reviews (
      id VARCHAR(50) PRIMARY KEY,
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      cycle_id VARCHAR(50) NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,
      self_note TEXT,
      manager_note TEXT,
      adjusted_score NUMERIC(6,2),
      adjustment_reason TEXT,
      submitted_at TIMESTAMP WITH TIME ZONE,
      reviewed_at TIMESTAMP WITH TIME ZONE
    )
  `);

  // 10. KPI Edit Requests
  await client.query(`
    CREATE TABLE kpi_edit_requests (
      id VARCHAR(50) PRIMARY KEY,
      snapshot_id VARCHAR(50) NOT NULL REFERENCES kpi_snapshots(id) ON DELETE CASCADE,
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      kpi_definition_id VARCHAR(50) NOT NULL REFERENCES kpi_definitions(id) ON DELETE CASCADE,
      period VARCHAR(100) NOT NULL,
      old_score NUMERIC(6,2) NOT NULL,
      old_actual_value NUMERIC(10,2) NOT NULL,
      old_numerator NUMERIC(10,2) NOT NULL,
      old_denominator NUMERIC(10,2) NOT NULL,
      new_score NUMERIC(6,2) NOT NULL,
      new_actual_value NUMERIC(10,2) NOT NULL,
      new_numerator NUMERIC(10,2) NOT NULL,
      new_denominator NUMERIC(10,2) NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      reviewed_by VARCHAR(50) REFERENCES users(id),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      review_note TEXT
    )
  `);

  // 11. Course Edit Requests
  await client.query(`
    CREATE TABLE course_edit_requests (
      id VARCHAR(50) PRIMARY KEY,
      course_id VARCHAR(50) NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      field VARCHAR(100) NOT NULL,
      field_label VARCHAR(100) NOT NULL,
      old_value NUMERIC(10,4) NOT NULL,
      new_value NUMERIC(10,4) NOT NULL,
      reason TEXT NOT NULL,
      status VARCHAR(50) DEFAULT 'pending',
      requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      reviewed_by VARCHAR(50) REFERENCES users(id),
      reviewed_at TIMESTAMP WITH TIME ZONE,
      review_note TEXT
    )
  `);

  // 12. Manager Questions
  await client.query(`
    CREATE TABLE manager_questions (
      id VARCHAR(50) PRIMARY KEY,
      from_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      to_user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      subject VARCHAR(255) NOT NULL,
      question TEXT NOT NULL,
      context TEXT,
      context_type VARCHAR(50) NOT NULL,
      context_id VARCHAR(50) NOT NULL,
      status VARCHAR(50) DEFAULT 'open',
      created_at DATE NOT NULL,
      answer TEXT,
      answered_at DATE,
      manager_reply TEXT,
      replied_at DATE
    )
  `);

  // 13. Tasks
  await client.query(`
    CREATE TABLE tasks (
      id VARCHAR(50) PRIMARY KEY,
      owner_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      program_id VARCHAR(50) REFERENCES programs(id) ON DELETE SET NULL,
      title VARCHAR(255) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'TODO',
      due_date DATE NOT NULL,
      priority VARCHAR(50) NOT NULL DEFAULT 'medium',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `);

  console.log("✅ Database tables created successfully!");

  console.log("🌱 Seeding initial mock data from application code...");

  // Import mock data directly (since we're running in tsx, we can import them)
  const { users: mockUsers, programs: mockPrograms, courses: mockCourses, kpiDefinitions: mockKpiDefinitions, kpiSnapshots: mockKpiSnapshots, otherActivityRecords: mockOtherActivities, laborDisciplineRecords: mockLaborDisciplines, reviewCycles: mockReviewCycles, reviews: mockReviews, getManagerQuestions } = require('./mock-data');
  const { tasks: mockTasks } = require('./mock-tasks');

  // Insert Users
  console.log(`Inserting ${mockUsers.length} users...`);
  for (const u of mockUsers) {
    await client.query(
      `INSERT INTO users (id, name, email, role, roles, manager_id, avatar_url, active, position) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [u.id, u.name, u.email, u.role, u.roles, u.managerId, u.avatarUrl, u.active, u.position]
    );
  }

  // Insert Programs
  console.log(`Inserting ${mockPrograms.length} programs...`);
  for (const p of mockPrograms) {
    await client.query(
      `INSERT INTO programs (id, name, type, status, short_name, manager_id, secondary_manager_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [p.id, p.name, p.type, p.status || 'active', p.shortName, p.managerId, p.secondaryManagerId || null]
    );
  }

  // Insert Courses
  console.log(`Inserting ${mockCourses.length} courses...`);
  for (const c of mockCourses) {
    await client.query(
      `INSERT INTO courses (id, program_id, name, cohort, num_lecturers, num_students, attendance_rate, attendance_target, pass_rate, submit_rate, pass_target) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [c.id, c.programId, c.name, c.cohort, c.numLecturers, c.numStudents, c.attendanceRate, c.attendanceTarget, c.passRate, c.submitRate, c.passTarget]
    );
  }

  // Insert KPI Definitions
  console.log(`Inserting ${mockKpiDefinitions.length} KPI definitions...`);
  for (const k of mockKpiDefinitions) {
    await client.query(
      `INSERT INTO kpi_definitions (id, group_id, stt, name, short_name, description, criteria, unit, weight) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [k.id, k.groupId, k.stt, k.name, k.shortName, k.description || '', k.criteria || '', k.unit, k.weight]
    );
  }

  // Insert KPI Snapshots
  console.log(`Inserting ${mockKpiSnapshots.length} KPI snapshots...`);
  for (const ks of mockKpiSnapshots) {
    await client.query(
      `INSERT INTO kpi_snapshots (id, user_id, kpi_definition_id, period, score, target_value, actual_value, raw_numerator, raw_denominator, calculated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [ks.id, ks.userId, ks.kpiDefinitionId, ks.period, ks.score, ks.targetValue, ks.actualValue, ks.rawNumerator, ks.rawDenominator, ks.calculatedAt]
    );
  }

  // Insert Other Activities
  console.log(`Inserting ${mockOtherActivities.length} other activity records...`);
  for (const oa of mockOtherActivities) {
    await client.query(
      `INSERT INTO other_activities (user_id, period, admission, study_abroad, exchange, other_institute, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [oa.userId, oa.period, oa.admission, oa.studyAbroad, oa.exchange, oa.otherInstitute, oa.updatedAt]
    );
  }

  // Insert Labor Disciplines
  console.log(`Inserting ${mockLaborDisciplines.length} labor discipline records...`);
  for (const ld of mockLaborDisciplines) {
    await client.query(
      `INSERT INTO labor_disciplines (user_id, period, score, note, updated_by, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ld.userId, ld.period, ld.score, ld.note, ld.updatedBy, ld.updatedAt]
    );
  }

  // Insert Review Cycles
  console.log(`Inserting ${mockReviewCycles.length} review cycles...`);
  for (const rc of mockReviewCycles) {
    await client.query(
      `INSERT INTO review_cycles (id, name, start_date, end_date, review_deadline, status) 
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [rc.id, rc.name, rc.startDate, rc.endDate, rc.reviewDeadline, rc.status]
    );
  }

  // Insert Reviews
  console.log(`Inserting ${mockReviews.length} reviews...`);
  for (const r of mockReviews) {
    await client.query(
      `INSERT INTO reviews (id, user_id, cycle_id, self_note, manager_note, adjusted_score, adjustment_reason, submitted_at, reviewed_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [r.id, r.userId, r.cycleId, r.selfNote, r.managerNote, r.adjustedScore || null, r.adjustmentReason || '', r.submittedAt ? new Date(r.submittedAt) : null, r.reviewedAt ? new Date(r.reviewedAt) : null]
    );
  }

  // Insert Manager Questions
  const mockQuestions = getManagerQuestions();
  console.log(`Inserting ${mockQuestions.length} manager questions...`);
  for (const q of mockQuestions) {
    await client.query(
      `INSERT INTO manager_questions (id, from_user_id, to_user_id, subject, question, context, context_type, context_id, status, created_at, answer, answered_at, manager_reply, replied_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
      [q.id, q.fromUserId, q.toUserId, q.subject, q.question, q.context, q.contextType, q.contextId, q.status, q.createdAt, q.answer || '', q.answeredAt ? new Date(q.answeredAt) : null, q.managerReply || '', q.repliedAt ? new Date(q.repliedAt) : null]
    );
  }

  // Insert Tasks
  console.log(`Inserting ${mockTasks.length} tasks...`);
  for (const t of mockTasks) {
    await client.query(
      `INSERT INTO tasks (id, owner_id, program_id, title, status, due_date, priority, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [t.id, t.ownerId, t.programId, t.title, t.status, t.dueDate, t.priority, t.createdAt]
    );
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
  })
  .finally(async () => {
    await client.end();
    console.log("👋 Connection closed.");
  });
