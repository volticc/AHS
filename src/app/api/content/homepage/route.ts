import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

const CONTENT_ID = 'homepage_content';

// GET: Fetch homepage content
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const content = await db.collection('site_content').findOne({ _id: CONTENT_ID });

    if (!content) {
      // If no content exists, return default values
      return NextResponse.json({ headline: 'Welcome', subtext: 'Default content' }, { status: 200 });
    }

    return NextResponse.json(content, { status: 200 });

  } catch (error) {
    console.error('Error fetching homepage content:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Update homepage content
export async function POST(req: NextRequest) {
  try {
    const { headline, subtext } = await req.json();

    if (!headline || !subtext) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection('site_content').updateOne(
      { _id: CONTENT_ID },
      { $set: { headline, subtext, updatedAt: new Date() } },
      { upsert: true } // Creates the document if it doesn't exist
    );

    return NextResponse.json({ message: 'Homepage content updated successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error updating homepage content:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
