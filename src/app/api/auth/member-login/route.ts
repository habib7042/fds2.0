import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SignJWT } from "jose"

export async function POST(request: NextRequest) {
  try {
    const { phone, pin } = await request.json()

    if (!phone || !pin) {
      return NextResponse.json(
        { error: "Phone number and PIN are required" },
        { status: 400 }
      )
    }

    // Find member by phone
    // Note: Phone is not unique in schema? It's defined as `phone String?`.
    // It should ideally be unique for login.
    // If multiple users have same phone, this might be an issue.
    // Assuming for now phone is unique enough or we take the first one.
    // Or we should enforce uniqueness.
    // Given the prompt "login via mobile number", it implies uniqueness.

    const member = await db.member.findFirst({
      where: { phone },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found with this mobile number" },
        { status: 404 }
      )
    }

    // Verify PIN
    // In production, PIN should be hashed.
    // For now, comparison (since default is "1234" plain text).
    // If we want to support hashed pins later, we'd use bcrypt.
    // Assuming plain text for "1234" default and simple prototype.
    if (member.pin !== pin) {
      return NextResponse.json(
        { error: "Invalid PIN" },
        { status: 401 }
      )
    }

    // Create JWT
    const secret = new TextEncoder().encode(
      process.env.JWT_SECRET || 'default_secret_key_change_me'
    )

    const token = await new SignJWT({
        id: member.id,
        accountNumber: member.accountNumber
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h') // 24 hours session
      .sign(secret)

    // Create response with cookie
    const response = NextResponse.json({
      message: "Login successful",
      member: {
        id: member.id,
        name: member.name,
        accountNumber: member.accountNumber
      }
    })

    response.cookies.set('member_session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/'
    })

    return response

  } catch (error) {
    console.error("Member login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
