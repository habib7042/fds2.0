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

    // In this app, admin tokens are simple base64 encoded strings (id:timestamp)
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

    const loans = await db.loan.findMany({
      include: {
        member: {
          select: {
            name: true,
            accountNumber: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error("Admin fetch loans error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
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

    const body = await request.json()
    const { id, status } = body

    if (!id || !status || !["PENDING", "APPROVED", "REJECTED", "PAID"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      )
    }

    const loan = await db.loan.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Admin update loan error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
