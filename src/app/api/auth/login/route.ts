import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { serialize } from 'cookie';
import { ObjectId } from 'mongodb';
import { config } from '@/lib/config';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ message: 'Email and password are required' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    const user = await db.collection('users').findOne({ email: email.toLowerCase() });

    // Defensive check for user and password existence
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Hyper-resilient role and permission fetching
    let roleName = 'User'; // A safe, sensible default
    let permissionNames: string[] = [];

    if (user.roleId && ObjectId.isValid(user.roleId)) {
      try {
        const role = await db.collection('roles').findOne({ _id: new ObjectId(user.roleId) });
        if (role) {
          roleName = role.name || 'User'; // Fallback if name field is missing
          if (role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0) {
            const validPermissionIds = role.permissions.filter(id => ObjectId.isValid(id));
            if (validPermissionIds.length > 0) {
              const permissions = await db.collection('permissions').find({ _id: { $in: validPermissionIds } }).toArray();
              permissionNames = permissions.map(p => p.name).filter(Boolean); // Ensure no null/undefined names
            }
          }
        }
      } catch (roleError) {
        console.error('Non-fatal error fetching role/permissions for user:', user._id, roleError);
        // The login is not blocked; the user will just have default permissions.
      }
    }

    // Anti-fragile user ID handling
    if (!user._id) {
      console.error('CRITICAL: User in database has no _id:', user);
      return NextResponse.json({ message: 'A critical error occurred with your account.' }, { status: 500 });
    }
    const userIdString = user._id.toString();

    const token = jwt.sign(
      {
        userId: userIdString,
        role: roleName,
        permissions: permissionNames,
      },
      config.JWT_SECRET,
      { expiresIn: '1d' }
    );

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
    console.error('CRITICAL LOGIN FAILURE:', {
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : 'No stack available',
      timestamp: new Date().toISOString()
    });
    return NextResponse.json({ message: 'An internal server error occurred. The issue has been logged.' }, { status: 500 });
  }
}
