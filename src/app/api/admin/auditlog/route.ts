import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET: Fetch all audit logs
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    // Fetch latest 100 logs, newest first
    const logs = await db.collection('audit_logs').find({}).sort({ timestamp: -1 }).limit(100).toArray();
    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
