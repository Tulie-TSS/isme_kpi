import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();
  try {
    const res = await query('SELECT 1 as alive');
    return NextResponse.json({
      status: 'ok',
      supabase: 'active',
      dbResponse: res?.rows?.[0] || null,
      timestamp,
      message: 'Supabase database pinged successfully to prevent pause'
    });
  } catch (error: any) {
    return NextResponse.json({
      status: 'warning',
      supabase: 'unreachable_or_paused',
      error: error?.message || String(error),
      timestamp,
      hint: 'If paused, unpause in Supabase dashboard. Otherwise verify DATABASE_URL or DIRECT_URL.'
    }, { status: 200 });
  }
}
