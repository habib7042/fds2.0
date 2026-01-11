import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const members = await db.member.findMany({
      include: {
        contributions: {
          orderBy: {
            paymentDate: "desc"
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    })

    return NextResponse.json(members)
  } catch (error) {
    console.error("Members fetch error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { name, phone, email, address } = await request.json()

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      )
    }

    // Generate Account Number
    // Find the highest numeric account number to increment
    const members = await db.member.findMany({
      select: { accountNumber: true }
    })

    let maxNum = 0
    for (const m of members) {
      if (/^\d+$/.test(m.accountNumber)) {
        const num = parseInt(m.accountNumber, 10)
        if (num > maxNum) maxNum = num
      }
    }

    const accountNumber = String(maxNum + 1).padStart(4, '0')

    const member = await db.member.create({
      data: {
        accountNumber,
        name,
        phone,
        email,
        address
      },
      include: {
        contributions: true
      }
    })

    return NextResponse.json(member)
  } catch (error) {
    console.error("Member creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
