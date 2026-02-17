import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload;
  } catch (err) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL('/login/user', req.url));
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return NextResponse.redirect(new URL('/login/user', req.url));
    }

    // If accessing admin routes, user must have admin role
    if (pathname.startsWith('/admin') && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', req.url)); // Or a dedicated 'access-denied' page
    }

    // If accessing user dashboard, any valid token is fine
    if (pathname.startsWith('/dashboard')) {
      // No extra check needed here, already verified token exists
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
