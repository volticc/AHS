import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

// Define the strict shape of the JWT payload
interface JWTPayload {
  userId: string;
  role: string;
  permissions: string[];
}

// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for maintenance mode first
  const settingsUrl = `${req.nextUrl.origin}/api/admin/settings`;
  try {
    const settingsRes = await fetch(settingsUrl);
    if (settingsRes.ok) {
      const settings = await settingsRes.json();
      if (settings.maintenanceMode && !pathname.startsWith('/admin') && !pathname.startsWith('/login') && !pathname.startsWith('/maintenance')) {
        return NextResponse.redirect(new URL('/maintenance', req.url));
      }
    }
  } catch (error) {
    console.error('Could not fetch site settings in middleware:', error);
  }

  // Define protected routes
  const protectedRoutes = ['/admin', '/dashboard'];

  if (protectedRoutes.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(config.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret) as { payload: JWTPayload };

      // Example of a permission check. You can expand this.
      // For instance, to access '/admin/users', you might check for 'manage_users' permission.
      if (pathname.startsWith('/admin/users') && !payload.permissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      return NextResponse.next();
    } catch (err) {
      console.error('JWT verification error:', err);
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}
