const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const client = new Client({
  connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('✅ Connected to Supabase PostgreSQL');

  // 1. Ensure all definitions exist in kpi_definitions
  const defs = [
    { id: 'op1', groupId: 'operations', stt: 1, name: 'Quản lý nội dung giảng dạy (SoW, Outline)', shortName: 'Nội dung GD', unit: '%', weight: 10 },
    { id: 'op2', groupId: 'operations', stt: 2, name: 'Quản lý tài liệu môn học đúng hạn', shortName: 'Tài liệu MH', unit: '%', weight: 10 },
    { id: 'op3', groupId: 'operations', stt: 3, name: 'Quản lý tài liệu liên quan GV (HĐ, thanh toán)', shortName: 'Tài liệu GV', unit: '%', weight: 10 },
    { id: 'op4', groupId: 'operations', stt: 4, name: 'Vận hành Lớp học (TKB, Moodle, accounts, enroll)', shortName: 'Vận hành lớp', unit: '%', weight: 10 },
    { id: 'op5_op', groupId: 'operations', stt: 5, name: 'Quản lý điểm và quá trình đánh giá SV', shortName: 'Quản lý điểm', unit: '%', weight: 10 },
    { id: 'op5_as', groupId: 'academic_support', stt: 6, name: 'Hoạt động ngoại khóa học tập', shortName: 'Ngoại khóa học tập', unit: '%', weight: 20 },
    { id: 'op6', groupId: 'operations', stt: 7, name: 'Rà soát kết quả học tập & hồ sơ hoàn thành', shortName: 'Rà soát KQHT', unit: '%', weight: 10 },
    { id: 'op7', groupId: 'operations', stt: 8, name: 'Báo cáo rà soát Turnitin theo yêu cầu', shortName: 'Turnitin', unit: '%', weight: 10 },
    { id: 'op8', groupId: 'operations', stt: 9, name: 'Xử lý phản hồi của SV & GV', shortName: 'Phản hồi SV/GV', unit: '%', weight: 10 },
    { id: 'op9', groupId: 'operations', stt: 10, name: 'Module report và gửi feedback của SV cho GV', shortName: 'Module report', unit: '%', weight: 10 },
    { id: 'op10', groupId: 'operations', stt: 11, name: 'Quản lý tiến trình học tập của SV', shortName: 'Tiến trình SV', unit: '%', weight: 10 },
    { id: 'other11', groupId: 'other_activities', stt: 12, name: 'Tuyển sinh', shortName: 'Tuyển sinh', unit: '%', weight: 4 },
    { id: 'other12', groupId: 'other_activities', stt: 13, name: 'Hỗ trợ SV du học & exchange', shortName: 'Du học/Exchange', unit: '%', weight: 3 },
    { id: 'other13', groupId: 'other_activities', stt: 14, name: 'Hoạt động khác do Viện tổ chức', shortName: 'Hoạt động khác', unit: '%', weight: 3 }
  ];

  for (const d of defs) {
    await client.query(`
      INSERT INTO kpi_definitions (id, group_id, stt, name, short_name, description, criteria, unit, weight)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (id) DO UPDATE 
      SET group_id = $2, stt = $3, name = $4, short_name = $5, unit = $8, weight = $9
    `, [d.id, d.groupId, d.stt, d.name, d.shortName, d.name, d.name, d.unit, d.weight]);
  }
  console.log('✅ Synchronized all 14 KPI definitions into DB.');

  // 2. Create submissions table if not exists
  await client.query(`
    CREATE TABLE IF NOT EXISTS submissions (
      user_id VARCHAR(50) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      period VARCHAR(100) NOT NULL,
      status VARCHAR(50) NOT NULL,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, period)
    )
  `);

  const initialStatuses = [
    { userId: 'u11', period: 'Kỳ 2 2025-2026', status: 'open' },
    { userId: 'u6', period: 'Kỳ 2 2025-2026', status: 'open' },
    { userId: 'u10', period: 'Kỳ 2 2025-2026', status: 'open' },
    { userId: 'u5', period: 'Kỳ 2 2025-2026', status: 'approved' },
    { userId: 'u2', period: 'Kỳ 2 2025-2026', status: 'approved' },
    { userId: 'u7', period: 'Kỳ 2 2025-2026', status: 'approved' },
    { userId: 'u4', period: 'Kỳ 2 2025-2026', status: 'approved' },
    { userId: 'u8', period: 'Kỳ 2 2025-2026', status: 'approved' },
  ];

  for (const s of initialStatuses) {
    await client.query(`
      INSERT INTO submissions (user_id, period, status, updated_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, period) DO UPDATE SET status = $3, updated_at = NOW()
    `, [s.userId, s.period, s.status]);
  }
  console.log('✅ Synchronized submissions table into DB.');

  // 3. Extract and sync all 112 snapshots from mock-data
  const fs = require('fs');
  const fileContent = fs.readFileSync('src/lib/mock-data.ts', 'utf8');
  const start = fileContent.indexOf('const initialKpiSnapshots: KPISnapshot[] = [');
  const end = fileContent.indexOf('export let kpiSnapshots: KPISnapshot[] =');
  const rawArray = fileContent.substring(start + 'const initialKpiSnapshots: KPISnapshot[] = '.length, end).trim().replace(/;$/, '');
  
  const snaps = eval(rawArray);
  console.log('Total snapshots to sync:', snaps.length);

  for (const ks of snaps) {
    await client.query(`
      INSERT INTO kpi_snapshots (id, user_id, kpi_definition_id, period, score, target_value, actual_value, raw_numerator, raw_denominator, calculated_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      ON CONFLICT (id) DO UPDATE SET
        score = $5,
        target_value = $6,
        actual_value = $7,
        raw_numerator = $8,
        raw_denominator = $9,
        calculated_at = $10
    `, [ks.id, ks.userId, ks.kpiDefinitionId, ks.period, ks.score, ks.targetValue, ks.actualValue, ks.rawNumerator, ks.rawDenominator, ks.calculatedAt]);
  }
  console.log('✅ Successfully inserted/updated all 112 snapshots in Supabase PostgreSQL!');

  const countRes = await client.query("SELECT COUNT(*) FROM kpi_snapshots WHERE period = 'Kỳ 2 2025-2026'");
  console.log('Postgres kpi_snapshots count for Kỳ 2 2025-2026:', countRes.rows[0].count);

  await client.end();
}

run().catch(console.error);
