import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET: Fetch all suggestions
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const suggestions = await db.collection('suggestions').find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(suggestions, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new suggestion
export async function POST(req: NextRequest) {
  try {
    const { title, description, authorId } = await req.json(); // authorId from session
    if (!title || !description || !authorId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newSuggestion = {
      title,
      description,
      authorId: new ObjectId(authorId),
      upvotes: 0,
      status: 'New', // New, Under Review, Approved, In Development, Declined
      isStudioPick: false,
      createdAt: new Date(),
    };

    const result = await db.collection('suggestions').insertOne(newSuggestion);
    return NextResponse.json({ message: 'Suggestion submitted!', suggestionId: result.insertedId }, { status: 201 });

  } catch (error) {
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
