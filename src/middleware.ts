import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';

interface JWTPayload {
  userId: string;
  role: string;
  permissions: string[];
}

async function verifyToken(token: string): Promise<{ payload: JWTPayload } | null> {
  try {
    const secret = new TextEncoder().encode(config.JWT_SECRET);
    return await jwtVerify(token, secret) as { payload: JWTPayload };
  } catch (err) {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('auth-token')?.value;

  // 1. Maintenance Mode Check (no change)
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

  // 2. Protect API "write" actions for unauthenticated users
  const isApiWrite = pathname.startsWith('/api/') && req.method !== 'GET';
  const isPublicApi = pathname === '/api/auth/login';

  if (isApiWrite && !isPublicApi) {
    if (!token) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
    const verifiedToken = await verifyToken(token);
    if (!verifiedToken) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
  }

  // 3. Protect front-end pages
  const protectedPages = ['/admin', '/dashboard'];
  if (protectedPages.some(p => pathname.startsWith(p))) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    const verifiedToken = await verifyToken(token);
    if (!verifiedToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // 4. Role-based permission checks for admin pages
    if (pathname.startsWith('/admin')) {
      const { payload } = verifiedToken;
      if (pathname.startsWith('/admin/users') && !payload.permissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
      // Add other specific admin permission checks here
    }
  }

  return NextResponse.next();
}
