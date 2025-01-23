import { NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

export function middleware(req) {
  const token = req.cookies.get('auth_token');

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  try {
    verify(token, JWT_SECRET);
    return NextResponse.next();
  } catch (err) {
    console.error('Token inválido:', err);
    return NextResponse.redirect(new URL('/login', req.url));
  }
}

export const config = {
  matcher: ['/dashboard/:path*']
};
