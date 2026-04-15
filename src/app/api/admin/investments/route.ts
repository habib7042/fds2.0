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

    const token = authHeader.substring(7)
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [adminId] = decoded.split(":")
      if (!adminId) throw new Error("Invalid token format")

      const admin = await db.admin.findUnique({ where: { id: adminId } })
      if (!admin) throw new Error("Admin not found")
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const investments = await db.investment.findMany({
      orderBy: { date: "desc" }
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error("Admin fetch investments error:", error)
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

    const token = authHeader.substring(7)
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [adminId] = decoded.split(":")
      if (!adminId) throw new Error("Invalid token format")

      const admin = await db.admin.findUnique({ where: { id: adminId } })
      if (!admin) throw new Error("Admin not found")
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 401 }
      )
    }

    const { amount, project, description } = await request.json()

    if (!amount || !project) {
      return NextResponse.json(
        { error: "Amount and Project are required" },
        { status: 400 }
      )
    }

    const investment = await db.investment.create({
      data: {
        amount: parseFloat(amount),
        project,
        description,
        status: "ACTIVE"
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error("Admin create investment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
