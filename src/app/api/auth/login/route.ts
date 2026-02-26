import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';

// Validate critical environment variables at the module level.
// This makes it impossible for the app to run without the secret, and satisfies TypeScript.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined. The application cannot start.');
  throw new Error('JWT_SECRET is not defined in the environment variables');
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Find the user by email
    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch the user's role and permissions
    const role = await db.collection('roles').findOne({ _id: new ObjectId(user.roleId) });
    if (!role) {
      return NextResponse.json({ message: 'User role not found' }, { status: 500 });
    }

    const permissions = await db.collection('permissions').find({ _id: { $in: role.permissions } }).toArray();
    const permissionNames = permissions.map(p => p.name);

    // Create the JWT - JWT_SECRET is now guaranteed to be a string.
    const token = jwt.sign(
      {
        userId: user._id,
        role: role.name,
        permissions: permissionNames,
      },
      JWT_SECRET,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    // Set the JWT in a secure, HTTP-only cookie
    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 1 day
      path: '/',
    });

    const response = NextResponse.json({ message: 'Login successful' }, { status: 200 });
    response.headers.set('Set-Cookie', cookie);

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
