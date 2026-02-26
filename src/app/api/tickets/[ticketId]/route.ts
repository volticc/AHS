import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { logAudit } from '@/lib/auditLog';

// Define the strict shape of the data structures
interface ConversationEntry {
  authorId: ObjectId;
  authorName: string;
  authorRole: string;
  message: string;
  isInternalNote: boolean;
  timestamp: Date;
}

interface Ticket {
  _id: ObjectId;
  userId: ObjectId;
  subject: string;
  category: string;
  status: string;
  assignedTo?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
  conversation: ConversationEntry[];
}

// GET: Fetch a single ticket by its ID
export async function GET(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const { ticketId } = params;
    const client = await clientPromise;
    const db = client.db();
    const ticketsCollection = db.collection<Ticket>('tickets');

    const ticket = await ticketsCollection.findOne({ _id: new ObjectId(ticketId) });

    if (!ticket) {
      return NextResponse.json({ message: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json(ticket, { status: 200 });
  } catch (error) {
    console.error(`Error fetching ticket ${params.ticketId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add a new reply to a ticket
export async function POST(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const { ticketId } = params;
    const { authorId, authorName, authorRole, message, isInternalNote } = await req.json();

    if (!authorId || !authorName || !authorRole || !message) {
      return NextResponse.json({ message: 'Missing required fields for reply' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const ticketsCollection = db.collection<Ticket>('tickets');

    const newConversationEntry: ConversationEntry = {
      authorId: new ObjectId(authorId),
      authorName,
      authorRole,
      message,
      isInternalNote: isInternalNote || false,
      timestamp: new Date(),
    };

    const result = await ticketsCollection.updateOne(
      { _id: new ObjectId(ticketId) },
      {
        $push: { conversation: newConversationEntry },
        $set: { updatedAt: new Date() },
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Ticket not found or not modified' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Reply added successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error adding reply to ticket ${params.ticketId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Update a ticket's status or assignment
export async function PUT(req: NextRequest, { params }: { params: { ticketId: string } }) {
  try {
    const { ticketId } = params;
    const { status, assignedTo } = await req.json();

    if (!status && !assignedTo) {
      return NextResponse.json({ message: 'No update field provided (status or assignedTo)' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const ticketsCollection = db.collection<Ticket>('tickets');

    const updateFields: Partial<Pick<Ticket, 'status' | 'assignedTo' | 'updatedAt'>> & { updatedAt: Date } = {
      updatedAt: new Date(),
    };

    if (status) {
      updateFields.status = status;
    }

    if (assignedTo) {
      updateFields.assignedTo = new ObjectId(assignedTo);
    }

    const result = await ticketsCollection.updateOne(
      { _id: new ObjectId(ticketId) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Ticket not found or not modified' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Ticket updated successfully' }, { status: 200 });
  } catch (error) {
    console.error(`Error updating ticket ${params.ticketId}:`, error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
