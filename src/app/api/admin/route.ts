import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

// Helper to convert snake_case DB keys to camelCase JSON keys
function toCamelCase(row: any) {
  if (!row) return row;
  const newRow: any = {};
  for (const key of Object.keys(row)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newRow[camelKey] = row[key];
  }
  return newRow;
}

export async function GET() {
  try {
    // 1. Ensure kpi_groups table exists and is seeded (since we added it for edit classifications)
    await query(`
      CREATE TABLE IF NOT EXISTS kpi_groups (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        weight INTEGER NOT NULL
      )
    `);

    const groupCheck = await query(`SELECT COUNT(*) FROM kpi_groups`);
    if (parseInt(groupCheck.rows[0].count) === 0) {
      await query(`
        INSERT INTO kpi_groups (id, name, weight) VALUES
        ('operations', 'Nhóm KPI theo mô tả CV (Operations)', 50),
        ('academic_support', 'Hoạt động hỗ trợ học tập', 20),
        ('student_results', 'Kết quả học tập và Kỷ luật của sinh viên', 10),
        ('other_activities', 'Các hoạt động khác', 10),
        ('labor_discipline', 'Kỷ luật lao động', 10)
      `);
    }

    // Ensure lecturer_id exists in courses table
    await query(`
      ALTER TABLE courses ADD COLUMN IF NOT EXISTS lecturer_id VARCHAR(50) REFERENCES users(id) ON DELETE SET NULL
    `);

    // 2. Query all tables
    const usersRes = await query(`SELECT * FROM users ORDER BY name ASC`);
    const programsRes = await query(`SELECT * FROM programs ORDER BY name ASC`);
    const coursesRes = await query(`SELECT * FROM courses ORDER BY name ASC`);
    const kpiDefsRes = await query(`SELECT * FROM kpi_definitions ORDER BY group_id ASC, stt ASC`);
    const kpiGroupsRes = await query(`SELECT * FROM kpi_groups ORDER BY id ASC`);
    const kpiSnapshotsRes = await query(`SELECT * FROM kpi_snapshots`);
    
    // Map database snake_case rows to frontend camelCase objects
    const users = usersRes.rows.map(toCamelCase);
    const programs = programsRes.rows.map(toCamelCase);
    const courses = coursesRes.rows.map(toCamelCase);
    const kpiDefinitions = kpiDefsRes.rows.map(toCamelCase);
    const kpiGroups = kpiGroupsRes.rows.map(toCamelCase);
    const kpiSnapshots = kpiSnapshotsRes.rows.map(toCamelCase);

    return NextResponse.json({
      success: true,
      users,
      programs,
      courses,
      kpiDefinitions,
      kpiGroups,
      kpiSnapshots
    });
  } catch (error: any) {
    console.error('❌ API Admin GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: 'No action specified' }, { status: 400 });
    }

    switch (action) {
      // ================= USER CRUD =================
      case 'createUser': {
        const { id, name, email, role, roles, managerId, avatarUrl, active, position, assignedPrograms, assignedCourses, kpiTargets } = body.data;
        await query(
          `INSERT INTO users (id, name, email, role, roles, manager_id, avatar_url, active, position)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [id, name, email, role, roles, managerId || null, avatarUrl || '', active !== false, position || '']
        );

        // Assign Programs
        if (assignedPrograms && Array.isArray(assignedPrograms)) {
          for (const progId of assignedPrograms) {
            await query(`UPDATE programs SET manager_id = $1 WHERE id = $2`, [id, progId]);
          }
        }

        // Assign Courses
        if (assignedCourses && Array.isArray(assignedCourses)) {
          for (const courseId of assignedCourses) {
            await query(`UPDATE courses SET lecturer_id = $1 WHERE id = $2`, [id, courseId]);
          }
        }

        // Upsert KPI Targets
        if (kpiTargets && typeof kpiTargets === 'object') {
          const period = '2026-Q1';
          for (const [kpiId, targetVal] of Object.entries(kpiTargets)) {
            const snapshotId = `${id}_${kpiId}_${period}`;
            await query(`
              INSERT INTO kpi_snapshots (id, user_id, kpi_definition_id, period, score, target_value, actual_value, raw_numerator, raw_denominator)
              VALUES ($1, $2, $3, $4, 0.0, $5, 0.0, 0.0, 0.0)
              ON CONFLICT (id) 
              DO UPDATE SET target_value = EXCLUDED.target_value
            `, [snapshotId, id, kpiId, period, Number(targetVal) || 0]);
          }
        }

        return NextResponse.json({ success: true, message: 'User created successfully' });
      }

      case 'updateUser': {
        const { id, name, email, role, roles, managerId, avatarUrl, active, position, assignedPrograms, assignedCourses, kpiTargets } = body.data;
        await query(
          `UPDATE users 
           SET name = $2, email = $3, role = $4, roles = $5, manager_id = $6, avatar_url = $7, active = $8, position = $9
           WHERE id = $1`,
          [id, name, email, role, roles, managerId || null, avatarUrl || '', active, position || '']
        );

        // Reset all programs managed by this user, then assign new ones
        await query(`UPDATE programs SET manager_id = NULL WHERE manager_id = $1`, [id]);
        if (assignedPrograms && Array.isArray(assignedPrograms)) {
          for (const progId of assignedPrograms) {
            await query(`UPDATE programs SET manager_id = $1 WHERE id = $2`, [id, progId]);
          }
        }

        // Reset all courses taught by this user, then assign new ones
        await query(`UPDATE courses SET lecturer_id = NULL WHERE lecturer_id = $1`, [id]);
        if (assignedCourses && Array.isArray(assignedCourses)) {
          for (const courseId of assignedCourses) {
            await query(`UPDATE courses SET lecturer_id = $1 WHERE id = $2`, [id, courseId]);
          }
        }

        // Upsert KPI Targets
        if (kpiTargets && typeof kpiTargets === 'object') {
          const period = '2026-Q1';
          for (const [kpiId, targetVal] of Object.entries(kpiTargets)) {
            const snapshotId = `${id}_${kpiId}_${period}`;
            await query(`
              INSERT INTO kpi_snapshots (id, user_id, kpi_definition_id, period, score, target_value, actual_value, raw_numerator, raw_denominator)
              VALUES ($1, $2, $3, $4, 0.0, $5, 0.0, 0.0, 0.0)
              ON CONFLICT (id) 
              DO UPDATE SET target_value = EXCLUDED.target_value
            `, [snapshotId, id, kpiId, period, Number(targetVal) || 0]);
          }
        }

        return NextResponse.json({ success: true, message: 'User updated successfully' });
      }

      case 'deleteUser': {
        const { id } = body.data;
        // In case of foreign constraints, delete cascading is handled in schema,
        // but let's delete references if needed, or simply let CASCADE do the job.
        await query(`DELETE FROM users WHERE id = $1`, [id]);
        return NextResponse.json({ success: true, message: 'User deleted successfully' });
      }

      // ================= PROGRAM CRUD =================
      case 'createProgram': {
        const { id, name, type, status, shortName, managerId, secondaryManagerId } = body.data;
        await query(
          `INSERT INTO programs (id, name, type, status, short_name, manager_id, secondary_manager_id)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [id, name, type, status || 'active', shortName, managerId, secondaryManagerId || null]
        );
        return NextResponse.json({ success: true, message: 'Program created successfully' });
      }

      case 'updateProgram': {
        const { id, name, type, status, shortName, managerId, secondaryManagerId } = body.data;
        await query(
          `UPDATE programs 
           SET name = $2, type = $3, status = $4, short_name = $5, manager_id = $6, secondary_manager_id = $7
           WHERE id = $1`,
          [id, name, type, status, shortName, managerId, secondaryManagerId || null]
        );
        return NextResponse.json({ success: true, message: 'Program updated successfully' });
      }

      case 'deleteProgram': {
        const { id } = body.data;
        await query(`DELETE FROM programs WHERE id = $1`, [id]);
        return NextResponse.json({ success: true, message: 'Program deleted successfully' });
      }

      // ================= COURSE CRUD =================
      case 'createCourse': {
        const { id, programId, name, cohort, numLecturers, numStudents, attendanceRate, attendanceTarget, passRate, submitRate, passTarget } = body.data;
        await query(
          `INSERT INTO courses (id, program_id, name, cohort, num_lecturers, num_students, attendance_rate, attendance_target, pass_rate, submit_rate, pass_target)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [id, programId, name, cohort, numLecturers || 1, numStudents || 0, attendanceRate || 1.0, attendanceTarget || 0.95, passRate || 1.0, submitRate || 1.0, passTarget || 0.95]
        );
        return NextResponse.json({ success: true, message: 'Course created successfully' });
      }

      case 'updateCourse': {
        const { id, programId, name, cohort, numLecturers, numStudents, attendanceRate, attendanceTarget, passRate, submitRate, passTarget } = body.data;
        await query(
          `UPDATE courses 
           SET program_id = $2, name = $3, cohort = $4, num_lecturers = $5, num_students = $6, attendance_rate = $7, attendance_target = $8, pass_rate = $9, submit_rate = $10, pass_target = $11
           WHERE id = $1`,
          [id, programId, name, cohort, numLecturers, numStudents, attendanceRate, attendanceTarget, passRate, submitRate, passTarget]
        );
        return NextResponse.json({ success: true, message: 'Course updated successfully' });
      }

      case 'deleteCourse': {
        const { id } = body.data;
        await query(`DELETE FROM courses WHERE id = $1`, [id]);
        return NextResponse.json({ success: true, message: 'Course deleted successfully' });
      }

      // ================= CLASSIFICATIONS & CRITERIA CRUD =================
      case 'updateKPIGroup': {
        const { id, name, weight } = body.data;
        await query(
          `UPDATE kpi_groups SET name = $2, weight = $3 WHERE id = $1`,
          [id, name, weight]
        );
        return NextResponse.json({ success: true, message: 'KPI Group updated successfully' });
      }

      case 'createKPIDefinition': {
        const { id, groupId, stt, name, shortName, description, criteria, unit, weight } = body.data;
        await query(
          `INSERT INTO kpi_definitions (id, group_id, stt, name, short_name, description, criteria, unit, weight)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [id, groupId, stt, name, shortName, description || '', criteria || '', unit, weight]
        );
        return NextResponse.json({ success: true, message: 'KPI Definition created successfully' });
      }

      case 'updateKPIDefinition': {
        const { id, groupId, stt, name, shortName, description, criteria, unit, weight } = body.data;
        await query(
          `UPDATE kpi_definitions 
           SET group_id = $2, stt = $3, name = $4, short_name = $5, description = $6, criteria = $7, unit = $8, weight = $9
           WHERE id = $1`,
          [id, groupId, stt, name, shortName, description, criteria, unit, weight]
        );
        return NextResponse.json({ success: true, message: 'KPI Definition updated successfully' });
      }

      case 'deleteKPIDefinition': {
        const { id } = body.data;
        await query(`DELETE FROM kpi_definitions WHERE id = $1`, [id]);
        return NextResponse.json({ success: true, message: 'KPI Definition deleted successfully' });
      }

      default:
        return NextResponse.json({ success: false, error: `Unhandled action: ${action}` }, { status: 400 });
    }
  } catch (error: any) {
    console.error('❌ API Admin POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
