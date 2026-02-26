import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import { ObjectId } from 'mongodb';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    // Add password complexity validation
    if (password.length < 8) {
      return NextResponse.json({ message: 'Password must be at least 8 characters long' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'User with this email already exists' }, { status: 409 });
    }

    // Find the default 'User' role
    const userRole = await db.collection('roles').findOne({ name: 'User' });
    if (!userRole) {
      // This is a critical setup issue. The 'User' role should always exist.
      console.error("Default 'User' role not found. Please seed the database.");
      return NextResponse.json({ message: 'An unexpected error occurred during registration.' }, { status: 500 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await db.collection('users').insertOne({
      email,
      password: hashedPassword,
      roleId: new ObjectId(userRole._id),
      createdAt: new Date(),
    });

    return NextResponse.json({ message: 'User created successfully', userId: result.insertedId }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
