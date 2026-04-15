import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import * as jose from "jose"

const jwtSecret = new TextEncoder().encode(
  process.env.JWT_SECRET || "fallback_secret_for_development_only"
)

async function getMemberIdFromToken(request: NextRequest) {
  const cookie = request.cookies.get("member_session")?.value
  if (!cookie) return null

  try {
    const { payload } = await jose.jwtVerify(cookie, jwtSecret)
    if (!payload.id || typeof payload.id !== "string") return null
    return payload.id
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromToken(request)
    if (!memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loans = await db.loan.findMany({
      where: { memberId },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error("Fetch loans error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const memberId = await getMemberIdFromToken(request)
    if (!memberId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { amount, purpose } = body

    if (!amount || !purpose || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Invalid amount or purpose" },
        { status: 400 }
      )
    }

    const loan = await db.loan.create({
      data: {
        memberId,
        amount,
        purpose,
        status: "PENDING"
      }
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Create loan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
