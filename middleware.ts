import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Sirf /api/extract wale requests par rules lagane ke liye
  if (request.nextUrl.pathname.startsWith('/api/extract')) {
    
    // Agar request METHOD 'OPTIONS' hai (CORS preflight request), toh direct 200 OK response bhejo
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};