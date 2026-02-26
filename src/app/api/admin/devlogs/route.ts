import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET: Fetch all dev logs
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const devlogs = await db.collection('devlogs').find({ archived: { $ne: true } }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(devlogs, { status: 200 });
  } catch (error) {
    console.error('Error fetching dev logs:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new dev log
export async function POST(req: NextRequest) {
  try {
    const { title, content, category } = await req.json();

    if (!title || !content || !category) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newDevLog = {
      title,
      content,
      category, // e.g., 'Update', 'Announcement', 'Behind the Scenes'
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      revisions: [], // For version history
    };

    const result = await db.collection('devlogs').insertOne(newDevLog);

    return NextResponse.json({ message: 'Dev log created successfully', devLogId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Error creating dev log:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
