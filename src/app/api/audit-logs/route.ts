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
    const res = await query(`
      SELECT id, timestamp, user_id, user_name, action, ip_address, user_agent, details, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 500
    `);

    const logs = res.rows.map(toCamelCase);

    return NextResponse.json({
      success: true,
      logs
    });
  } catch (err: any) {
    console.error('Error fetching audit logs:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Extract real client IP from headers
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || '127.0.0.1';
    const clientUserAgent = req.headers.get('user-agent') || 'Browser Client';

    const logsToInsert = Array.isArray(body.logs) ? body.logs : [body];

    for (const item of logsToInsert) {
      if (!item.action) continue;
      const id = item.id || `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      const timestamp = item.timestamp || new Date().toISOString().replace('T', ' ').substring(0, 19);
      const userId = item.userId || 'u0';
      const userName = item.userName || 'Hệ thống';
      const action = item.action;
      const ipAddress = item.ipAddress && item.ipAddress !== '127.0.0.1' ? item.ipAddress : realIp;
      const userAgent = item.userAgent && item.userAgent !== 'Server Environment' ? item.userAgent : clientUserAgent;
      const details = item.details || '';

      await query(
        `INSERT INTO audit_logs (id, timestamp, user_id, user_name, action, ip_address, user_agent, details)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO UPDATE 
         SET details = EXCLUDED.details,
             ip_address = EXCLUDED.ip_address,
             user_agent = EXCLUDED.user_agent`,
        [id, timestamp, userId, userName, action, ipAddress, userAgent, details]
      );
    }

    return NextResponse.json({ success: true, count: logsToInsert.length });
  } catch (err: any) {
    console.error('Error saving audit log:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
