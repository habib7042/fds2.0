import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { accountNumber, phone } = await request.json()

    if (!accountNumber || !phone) {
      return NextResponse.json(
        { error: "Account number and mobile number are required" },
        { status: 400 }
      )
    }

    const member = await db.member.findUnique({
      where: { accountNumber },
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Verify phone number (simple string match for now, could be enhanced with normalization)
    if (member.phone !== phone) {
      return NextResponse.json(
        { error: "Mobile number does not match our records" },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: "Login successful",
      member: {
        id: member.id,
        name: member.name,
        accountNumber: member.accountNumber
      }
    })
  } catch (error) {
    console.error("Member login error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
