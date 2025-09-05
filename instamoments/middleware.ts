import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response object
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Only check authentication for protected routes to avoid interfering with client-side auth
  const protectedRoutes = [
    '/dashboard',
    '/create-event',
    '/settings',
    '/profile',
    '/complete-profile',
  ];

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  );

  // Skip auth check for non-protected routes
  if (!isProtectedRoute) {
    return response;
  }

  // Create Supabase client only when needed
  const supabase = await createClient();

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Define auth routes (should redirect if already authenticated)
  const authRoutes = ['/signin', '/signup', '/reset-password'];

  // Check if the current path is an auth route
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  // Handle protected routes
  if (isProtectedRoute && !user) {
    const signInUrl = new URL('/signin', request.url);
    signInUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Handle auth routes (redirect if already authenticated)
  if (isAuthRoute && user) {
    // Check if user has a complete profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      // Redirect to complete profile if no profile exists
      return NextResponse.redirect(new URL('/complete-profile', request.url));
    }

    // Redirect to dashboard if already authenticated
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Handle gallery routes (public but may need special handling)
  if (pathname.startsWith('/gallery/')) {
    // Gallery routes are public, no authentication required
    return response;
  }

  // Handle API routes
  if (pathname.startsWith('/api/')) {
    // API routes are handled separately
    return response;
  }

  // Handle auth callback
  if (pathname.startsWith('/auth/callback')) {
    return response;
  }

  // For all other routes, continue
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
