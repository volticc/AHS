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

    const user = await db.collection('users').findOne({ email });
    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }

    // Defensively get role and permissions
    let roleName = 'User'; // Default role
    let permissionNames: string[] = [];

    if (user.roleId) {
      try {
        const role = await db.collection('roles').findOne({ _id: new ObjectId(user.roleId) });
        if (role) {
          roleName = role.name;
          if (role.permissions && Array.isArray(role.permissions) && role.permissions.length > 0) {
            const permissions = await db.collection('permissions').find({ _id: { $in: role.permissions } }).toArray();
            permissionNames = permissions.map(p => p.name);
          }
        }
      } catch (roleError) {
        console.error('Error fetching user role or permissions:', roleError);
        // Non-fatal: proceed with default role and no permissions
      }
    }

    const token = jwt.sign(
      {
        userId: user._id,
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
