import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

import { logAudit } from '@/lib/auditLog';

// GET: Fetch all users with their role names
export async function GET(req: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const users = await db.collection('users').aggregate([
      {
        $lookup: {
          from: 'roles',
          localField: 'roleId',
          foreignField: '_id',
          as: 'roleInfo'
        }
      },
      {
        $unwind: '$roleInfo'
      },
      {
        $project: {
          password: 0, // Don't send password hashes
          'roleInfo.permissions': 0 // Don't send permissions in this list view
        }
      }
    ]).toArray();

    return NextResponse.json(users, { status: 200 });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new user
export async function POST(req: NextRequest) {
  try {
    // In a real app, this would come from the JWT of the logged-in admin
    const { actorId, email, password, roleId } = await req.json();

    if (!actorId || !email || !password || !roleId) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Check if role exists
    const role = await db.collection('roles').findOne({ _id: new ObjectId(roleId) });
    if (!role) {
      return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      roleId: new ObjectId(roleId),
      createdAt: new Date(),
    });

    // Log the action
    await logAudit(actorId, 'create_user', { createdEmail: email, assignedRole: role.name }, result.insertedId.toHexString());

    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
