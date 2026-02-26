import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logAudit } from '@/lib/auditLog';

// GET: Fetch a single project
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const project = await db.collection('projects').findOne({ _id: new ObjectId(params.id) });
    if (!project) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return NextResponse.json(project, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a project
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { title, description, status, actorId } = await req.json();
    if (!title || !description || !status || !actorId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    await db.collection('projects').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { title, description, status, updatedAt: new Date() } }
    );

    await logAudit(actorId, 'edit_project', { projectId: params.id, newTitle: title });

    return NextResponse.json({ message: 'Project updated successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Soft-delete a project
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { actorId } = await req.json();
    if (!actorId) {
      return NextResponse.json({ message: 'Actor ID is required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const result = await db.collection('projects').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { archived: true, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Project not found' }, { status: 404 });
    }

    await logAudit(actorId, 'archive_project', { projectId: params.id });

    return NextResponse.json({ message: 'Project archived successfully' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
