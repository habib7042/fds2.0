import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  try {
    const { accountNumber } = await params

    if (!accountNumber || accountNumber.length !== 4) {
      return NextResponse.json(
        { error: "Invalid account number" },
        { status: 400 }
      )
    }

    const member = await db.member.findUnique({
      where: { accountNumber },
      include: {
        contributions: {
          orderBy: {
            paymentDate: "desc"
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Member lookup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}