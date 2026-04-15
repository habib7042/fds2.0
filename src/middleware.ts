import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  // Check for Member routes
  if (request.nextUrl.pathname.startsWith('/member')) {
    const token = request.cookies.get('member_session')?.value

    if (!token) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    try {
      const secret = new TextEncoder().encode(
        process.env.JWT_SECRET || 'default_secret_key_change_me'
      )
      const { payload } = await jwtVerify(token, secret)

      // Optional: Check if the path matches the account number in the token
      // payload.accountNumber
      const pathParts = request.nextUrl.pathname.split('/')
      // /member/0001 -> ['', 'member', '0001']
      if (pathParts.length >= 3) {
         const routeAccount = pathParts[2]
         if (routeAccount !== payload.accountNumber) {
            // Trying to access another member's page
            return NextResponse.redirect(new URL(`/member/${payload.accountNumber}`, request.url))
         }
      }

      return NextResponse.next()
    } catch (err) {
      // Invalid token
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/member/:path*',
}
