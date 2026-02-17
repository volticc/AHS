import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// Define the structure of a Ticket
interface Ticket {
  userId: ObjectId;
  subject: string;
  category: string;
  message: string;
  status: 'Open' | 'In Progress' | 'Waiting on User' | 'Resolved' | 'Closed';
  createdAt: Date;
  updatedAt: Date;
  conversation: { author: string; message: string; timestamp: Date }[];
}

// POST: Create a new ticket
export async function POST(req: NextRequest) {
  // Note: In a real app, you'd get the userId from the JWT session
  // For now, we'll pass it in the body for simplicity.
  try {
    const { userId, subject, category, message } = await req.json();

    if (!userId || !subject || !category || !message) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const newTicket: Ticket = {
      userId: new ObjectId(userId),
      subject,
      category,
      message,
      status: 'Open',
      createdAt: new Date(),
      updatedAt: new Date(),
      conversation: [
        {
          author: 'user', // or fetch user's name
          message,
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

// GET: Fetch all tickets (for admin)
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const tickets = await db.collection('tickets').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(tickets, { status: 200 });

  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
