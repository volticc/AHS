import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// This represents a single message in the conversation thread
interface ConversationEntry {
  authorId: ObjectId; // or string for 'user' vs admin ID
  authorName: string;
  authorRole: string; // e.g., 'User', 'Admin', 'Dev Lead'
  message: string;
  isInternalNote: boolean;
  timestamp: Date;
}

// This represents the entire ticket
interface Ticket {
  userId: ObjectId;
  subject: string;
  category: string;
  status: 'Open' | 'In Progress' | 'Waiting on User' | 'Resolved' | 'Closed';
  assignedTo?: ObjectId; // ID of the admin it's assigned to
  createdAt: Date;
  updatedAt: Date;
  conversation: ConversationEntry[];
}

// GET: Fetch all tickets (for admin view)
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    // This can be enhanced with pagination later
    const tickets = await db.collection('tickets').find({}).sort({ updatedAt: -1 }).toArray();
    return NextResponse.json(tickets, { status: 200 });
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new ticket (from user side)
export async function POST(req: NextRequest) {
  try {
    // In a real scenario, userId would come from the authenticated session
    const { userId, subject, category, message } = await req.json();

    if (!userId || !subject || !category || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newTicket: Omit<Ticket, '_id'> = {
      userId: new ObjectId(userId),
      subject,
      category,
      status: 'Open',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversation: [
        {
          authorId: new ObjectId(userId),
          authorName: 'User', // This would be fetched from the user's profile
          authorRole: 'User',
          message,
          isInternalNote: false,
          timestamp: new Date(),
        },
      ],
    };

    const result = await db.collection('tickets').insertOne(newTicket);
    return NextResponse.json({ message: 'Ticket created successfully', ticketId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Error creating ticket:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
