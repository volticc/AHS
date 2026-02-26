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

  // Exclude API routes from the maintenance check to prevent infinite loops.
  if (!pathname.startsWith('/api/')) {
    try {
      const settingsUrl = `${req.nextUrl.origin}/api/admin/settings`;
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
  }

  const token = req.cookies.get('auth-token')?.value;

  // API route protection
  const isApiWrite = pathname.startsWith('/api/') && req.method !== 'GET';
  const isPublicApi = ['/api/auth/login', '/api/auth/register', '/api/admin/settings'].includes(pathname);

  if (isApiWrite && !isPublicApi) {
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
  }

  // Page protection
  const protectedPages = ['/admin', '/dashboard'];
  if (protectedPages.some(p => pathname.startsWith(p))) {
    const verifiedToken = token ? await verifyToken(token) : null;
    if (!verifiedToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    // Role-based permission checks
    if (pathname.startsWith('/admin')) {
      const { payload } = verifiedToken;
      if (pathname.startsWith('/admin/users') && !payload.permissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
}
