import { query } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

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
    const snapsRes = await query(`
      SELECT id, user_id, kpi_definition_id, period, score::float, target_value::float, 
             actual_value::float, raw_numerator::float, raw_denominator::float, 
             leader_score::float, calculated_at 
      FROM kpi_snapshots
    `);

    let subsRes;
    try {
      subsRes = await query(`SELECT user_id, period, status FROM submissions`);
    } catch {
      subsRes = { rows: [] };
    }

    const snapshots = snapsRes.rows.map(r => {
      const c = toCamelCase(r);
      const score = c.score != null ? Number(c.score) : 100;
      const leaderScore = c.leaderScore != null ? Number(c.leaderScore) : score;
      return {
        ...c,
        score,
        leaderScore
      };
    });
    const submissions: Record<string, string> = {};
    subsRes.rows.forEach(r => {
      submissions[`${r.user_id}_${r.period}`] = r.status;
    });

    return NextResponse.json({
      success: true,
      snapshots,
      submissions
    });
  } catch (err: any) {
    console.error('Error fetching KPI data:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'updateSnapshots') {
      const { updatesList } = body;
      if (Array.isArray(updatesList)) {
        for (const item of updatesList) {
          const { id, updates } = item;
          const score = updates.score !== undefined ? updates.score : updates.leaderScore;
          const leaderScore = updates.leaderScore !== undefined ? updates.leaderScore : updates.score;
          
          await query(`
            UPDATE kpi_snapshots 
            SET score = COALESCE($2, score),
                leader_score = COALESCE($3, leader_score),
                actual_value = COALESCE($4, actual_value),
                target_value = COALESCE($5, target_value)
            WHERE id = $1
          `, [id, score, leaderScore, updates.actualValue, updates.targetValue]);
        }
      }
      return NextResponse.json({ success: true, message: 'Snapshots updated in DB' });
    }

    if (action === 'setSubmissionStatus') {
      const { userId, period, status } = body;
      await query(`
        CREATE TABLE IF NOT EXISTS submissions (
          user_id VARCHAR(50) NOT NULL,
          period VARCHAR(100) NOT NULL,
          status VARCHAR(50) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (user_id, period)
        )
      `);
      await query(`
        INSERT INTO submissions (user_id, period, status, updated_at)
        VALUES ($1, $2, $3, NOW())
        ON CONFLICT (user_id, period) DO UPDATE SET status = $3, updated_at = NOW()
      `, [userId, period, status]);
      return NextResponse.json({ success: true, message: 'Submission status updated in DB' });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    console.error('Error updating KPI DB:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
