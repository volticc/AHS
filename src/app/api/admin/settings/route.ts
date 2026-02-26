import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { logAudit } from '@/lib/auditLog';

// Define the strict shape of the SiteSettings document
interface SiteSettings {
  _id: string;
  maintenanceMode: boolean;
}

const SETTINGS_ID = 'global_settings';

// GET: Fetch site settings
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection<SiteSettings>('site_settings').findOne({ _id: SETTINGS_ID });

    if (!settings) {
      // If no settings exist, return default values
      return NextResponse.json({ maintenanceMode: false }, { status: 200 });
    }

    return NextResponse.json(settings, { status: 200 });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Update site settings (like maintenance mode)
export async function POST(req: NextRequest) {
  try {
    const { maintenanceMode, actorId } = await req.json();

    if (typeof maintenanceMode !== 'boolean' || !actorId) {
      return NextResponse.json({ message: 'Invalid request body' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection<SiteSettings>('site_settings').updateOne(
      { _id: SETTINGS_ID },
      { $set: { maintenanceMode } },
      { upsert: true }
    );

    // Log this important action
    await logAudit(actorId, 'toggle_maintenance_mode', { enabled: maintenanceMode });

    return NextResponse.json({ message: 'Settings updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
