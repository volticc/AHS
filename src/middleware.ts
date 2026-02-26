import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';
import clientPromise from '@/lib/mongodb'; // Import the DB client directly

interface JWTPayload {
  userId: string;
  role: string;
  permissions: string[];
}

// This is the correct, robust way to check maintenance mode without causing timeouts.
async function isMaintenanceModeEnabled(): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db();
    const settings = await db.collection('site_settings').findOne({ _id: 'global_settings' });
    return settings?.maintenanceMode || false;
  } catch (error) {
    console.error('Middleware failed to connect to DB for maintenance check:', error);
    // Fail open: If the database is down, don't lock users out of the site.
    return false;
  }
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

  // 1. Maintenance Mode Check (Now reads directly from DB)
  if (await isMaintenanceModeEnabled()) {
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/login') && !pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', req.url));
    }
  }

  const token = req.cookies.get('auth-token')?.value;

  // 2. Protect API "write" actions
  const isApiWrite = pathname.startsWith('/api/') && req.method !== 'GET';
  const isPublicApi = ['/api/auth/login', '/api/auth/register'].includes(pathname);

  if (isApiWrite && !isPublicApi) {
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
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

    // 4. Role-based permission checks
    if (pathname.startsWith('/admin')) {
      const { payload } = verifiedToken;
      if (pathname.startsWith('/admin/users') && !payload.permissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
}
