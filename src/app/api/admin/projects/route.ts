import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

// GET: Fetch all projects
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const projects = await db.collection('projects').find({ archived: { $ne: true } }).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(projects, { status: 200 });
  } catch (error) {
    console.error('Error fetching projects:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new project
export async function POST(req: NextRequest) {
  try {
    const { title, description, status } = await req.json();

    if (!title || !description || !status) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newProject = {
      title,
      description,
      status, // e.g., 'In Development', 'Live', 'On Hold'
      media: [], // Placeholder for images/videos
      roadmap: [], // Placeholder for roadmap items
      changelog: [], // Placeholder for changelog entries
      archived: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('projects').insertOne(newProject);

    return NextResponse.json({ message: 'Project created successfully', projectId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Error creating project:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
