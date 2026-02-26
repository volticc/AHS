import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Check for maintenance mode first
  // This needs to be an absolute URL for the fetch to work in middleware
  const settingsUrl = `${req.nextUrl.origin}/api/admin/settings`;
  try {
    const settingsRes = await fetch(settingsUrl);
    const settings = await settingsRes.json();

    if (settings.maintenanceMode && !pathname.startsWith('/admin') && !pathname.startsWith('/login') && !pathname.startsWith('/maintenance')) {
      return NextResponse.redirect(new URL('/maintenance', req.url));
    }
  } catch (error) {
    console.error('Could not fetch site settings in middleware:', error);
    // If settings can't be fetched, proceed as normal rather than locking everyone out
  }

  // Define protected routes
  const protectedRoutes = ['/admin', '/dashboard'];

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const cookie = req.cookies.get('auth-token');

    if (!cookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      const secret = new TextEncoder().encode(JWT_SECRET);
      const { payload } = await jwtVerify(cookie.value, secret);

      // Example of a permission check. You can expand this.
      // For instance, to access '/admin/users', you might check for 'manage_users' permission.
      if (pathname.startsWith('/admin/users') && !payload.permissions.includes('manage_users')) {
        return NextResponse.redirect(new URL('/unauthorized', req.url));
      }

      // If verification is successful, continue to the requested page
      return NextResponse.next();
    } catch (err) {
      // If token is invalid, redirect to login
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
