import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const { status } = await request.json()

    if (!id || !status || !["ACTIVE", "RETURNED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid data" },
        { status: 400 }
      )
    }

    const investment = await db.investment.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error("Admin update investment error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
