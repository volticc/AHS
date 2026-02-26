import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { config } from '@/lib/config';
import clientPromise from '@/lib/mongodb';

// Define strict payload shapes
interface JWTPayload {
  userId: string;
  role: string;
  permissions: string[];
}

// Define the shape of the settings document, specifying _id is a string
interface SiteSettings {
  _id: string;
  maintenanceMode: boolean;
}

async function isMaintenanceModeEnabled(): Promise<boolean> {
  try {
    const client = await clientPromise;
    const db = client.db();
    // This generic tells the driver to expect a string _id, fixing the build error.
    const settings = await db.collection<SiteSettings>('site_settings').findOne({ _id: 'global_settings' });
    return settings?.maintenanceMode || false;
  } catch (error) {
    console.error('Middleware failed to connect to DB for maintenance check:', error);
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

  if (await isMaintenanceModeEnabled()) {
    if (!pathname.startsWith('/admin') && !pathname.startsWith('/login') && !pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', req.url));
    }
  }

  const token = req.cookies.get('auth-token')?.value;
  const isApiWrite = pathname.startsWith('/api/') && req.method !== 'GET';
  const isPublicApi = ['/api/auth/login', '/api/auth/register'].includes(pathname);

  if (isApiWrite && !isPublicApi) {
    if (!token || !(await verifyToken(token))) {
      return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
    }
  }

  const protectedPages = ['/admin', '/dashboard'];
  if (protectedPages.some(p => pathname.startsWith(p))) {
    const verifiedToken = token ? await verifyToken(token) : null;
    if (!verifiedToken) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    if (pathname.startsWith('/admin')) {
      const { payload } = verifiedToken;
      if (pathname.startsWith('/admin/users') && !payload.permissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }
    }
  }

  return NextResponse.next();
}
