import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logAudit } from '@/lib/auditLog';

// Define the strict shape of a DevLog document
interface DevLog {
  title: string;
  content: string;
  category: string;
  archived: boolean;
  createdAt: Date;
  updatedAt: Date;
  revisions: {
    content: string;
    updatedAt: Date;
    updatedBy: ObjectId;
  }[];
}

// GET: Fetch a single dev log
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const devlog = await db.collection<DevLog>('devlogs').findOne({ _id: new ObjectId(params.id) });
    if (!devlog) {
      return NextResponse.json({ message: 'Dev log not found' }, { status: 404 });
    }
    return NextResponse.json(devlog, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a dev log
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, content, category, actorId } = await req.json();
    if (!title || !content || !category || !actorId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const devlogsCollection = db.collection<DevLog>('devlogs');

    const originalLog = await devlogsCollection.findOne({ _id: new ObjectId(params.id) });
    if (!originalLog) {
      return NextResponse.json({ message: 'Dev log not found' }, { status: 404 });
    }

    const revision = {
      content: originalLog.content,
      updatedAt: originalLog.updatedAt,
      updatedBy: new ObjectId(actorId),
    };

    const result = await devlogsCollection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: { title, content, category, updatedAt: new Date() },
        $push: {
          revisions: {
            $each: [revision],
            $slice: -10, // Keep last 10 revisions
          },
        },
      }
    );

    await logAudit(actorId, 'edit_dev_log', { devLogId: params.id, newTitle: title });

    return NextResponse.json({ message: 'Dev log updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error updating dev log:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Soft-delete a dev log
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { actorId } = await req.json();
    if (!actorId) {
      return NextResponse.json({ message: 'Actor ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('devlogs').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { archived: true, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Dev log not found' }, { status: 404 });
    }

    await logAudit(actorId, 'archive_dev_log', { devLogId: params.id });

    return NextResponse.json({ message: 'Dev log archived successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error archiving dev log:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
