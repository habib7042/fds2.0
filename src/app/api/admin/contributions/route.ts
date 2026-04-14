import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { memberId, month, year, amount, description } = await request.json()

    if (!memberId || !month || !year || !amount) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    const member = await db.member.findUnique({
      where: { id: memberId }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    if (!member.isActive) {
      return NextResponse.json(
        { error: "Cannot add contribution for a suspended member" },
        { status: 400 }
      )
    }

    const existingContribution = await db.contribution.findFirst({
      where: {
        memberId,
        month,
        year
      }
    })

    if (existingContribution) {
      return NextResponse.json(
        { error: "Contribution for this month already exists" },
        { status: 400 }
      )
    }

    const contribution = await db.contribution.create({
      data: {
        memberId,
        month,
        year,
        amount: parseFloat(amount),
        description
      }
    })

    return NextResponse.json(contribution)
  } catch (error) {
    console.error("Contribution creation error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}