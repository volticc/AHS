import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import { config } from '@/lib/config'; // Import the validated config

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Fetch the user's role and permissions safely
    const role = await db.collection('roles').findOne({ _id: new ObjectId(user.roleId) });
    let permissionNames: string[] = [];

    if (role && role.permissions && role.permissions.length > 0) {
      const permissions = await db.collection('permissions').find({ _id: { $in: role.permissions } }).toArray();
      permissionNames = permissions.map(p => p.name);
    }

    // Create the JWT - JWT_SECRET is now guaranteed to be a string.
    const token = jwt.sign(
      {
        userId: user._id,
        role: role ? role.name : 'User', // Default to 'User' if role is somehow missing
        permissions: permissionNames,
      },
      config.JWT_SECRET, // Use the validated secret
      { expiresIn: '1d' }
    );

    const cookie = serialize('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== 'development',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24,
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
