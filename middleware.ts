import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect /assessment — must have participant session
  if (pathname.startsWith('/assessment')) {
    const email = req.cookies.get('p_email')?.value;
    if (!email) return NextResponse.redirect(new URL('/', req.url));
  }

  // Protect /admin/dashboard — must have admin session
  if (pathname.startsWith('/admin/dashboard')) {
    const admin = req.cookies.get('admin_session')?.value;
    if (admin !== process.env.ADMIN_PASSWORD) {
      return NextResponse.redirect(new URL('/admin', req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/assessment/:path*', '/admin/dashboard/:path*'],
};
