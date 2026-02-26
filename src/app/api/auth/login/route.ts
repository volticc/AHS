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

    // Anti-fragile check for user and password format
    if (!user || typeof user.password !== 'string' || !user.password.startsWith('$2a')) {
      // Log this potential data integrity issue without crashing
      if (user) {
        console.warn('Authentication attempt for user with malformed password hash:', user._id);
      }
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Hyper-resilient role and permission fetching
    let roleName = 'User';
    let permissionNames: string[] = [];

    if (user.roleId && ObjectId.isValid(user.roleId)) {
      try {
        const role = await db.collection('roles').findOne({ _id: new ObjectId(user.roleId) });
        if (role) {
          roleName = role.name || 'User';
          if (role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0) {
            const validPermissionIds = role.permissions.filter(id => ObjectId.isValid(id));
            if (validPermissionIds.length > 0) {
              const permissions = await db.collection('permissions').find({ _id: { $in: validPermissionIds } }).toArray();
              permissionNames = permissions.map(p => p.name).filter(Boolean);
            }
          }
        }
      } catch (roleError) {
        console.error('Non-fatal error fetching role/permissions for user:', user._id, roleError);
      }
    }

    if (!user._id) {
      console.error('CRITICAL: User in database has no _id:', user);
      return NextResponse.json({ message: 'A critical error occurred with your account.' }, { status: 500 });
    }

    const token = jwt.sign(
      { userId: user._id.toString(), role: roleName, permissions: permissionNames },
      config.JWT_SECRET,
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
    const errorDetails = error instanceof Error ? { message: error.message, stack: error.stack } : { message: 'Unknown error' };
    console.error('CRITICAL LOGIN FAILURE:', JSON.stringify(errorDetails, null, 2));
    return NextResponse.json({ message: 'An internal server error occurred. The issue has been logged.' }, { status: 500 });
  }
}
