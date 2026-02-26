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
    if (!user || !user.password) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Hyper-defensive role and permission fetching
    let roleName = 'User'; // Safe default
    let permissionNames: string[] = [];

    if (user.roleId && ObjectId.isValid(user.roleId)) {
      try {
        const role = await db.collection('roles').findOne({ _id: new ObjectId(user.roleId) });
        if (role) {
          roleName = role.name || 'User'; // Fallback if name is missing
          if (role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0) {
            const validPermissionIds = role.permissions.filter(id => ObjectId.isValid(id));
            const permissions = await db.collection('permissions').find({ _id: { $in: validPermissionIds } }).toArray();
            permissionNames = permissions.map(p => p.name).filter(Boolean); // Ensure no null/undefined names
          }
        }
      } catch (roleError) {
        console.error('Non-fatal error fetching role/permissions:', roleError);
        // If this block fails, the user still gets logged in with default safe values.
      }
    }

    const token = jwt.sign(
      {
        userId: user._id.toHexString(),
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
    console.error('Critical login error:', error);
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
