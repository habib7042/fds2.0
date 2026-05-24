import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
    try {
        const adjustments = await db.fundAdjustment.findMany({
            orderBy: { date: "desc" }
        })
        return NextResponse.json(adjustments)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch adjustments" }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.substring(7)
    try {
      const decoded = Buffer.from(token, "base64").toString()
      const [adminId] = decoded.split(":")
      if (!adminId) throw new Error("Invalid token format")
      const admin = await db.admin.findUnique({ where: { id: adminId } })
      if (!admin) throw new Error("Admin not found")
    } catch (e) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { type, amount, description, target, memberId } = await request.json()

    if (!type || !amount || !target) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    if (target === 'all') {
        // Create GLOBAL FundAdjustment
        await db.fundAdjustment.create({
            data: {
                type,
                amount: parseFloat(amount),
                description
            }
        });
        return NextResponse.json({ success: true, type: 'global' })
    } else if (target === 'specific' && memberId) {
        // Keep existing logic for specific member adjustments
        await db.accountAdjustment.create({
            data: {
                memberId,
                type,
                amount: parseFloat(amount),
                description
            }
        });
        return NextResponse.json({ success: true, type: 'specific' })
    } else {
        return NextResponse.json({ error: "Invalid target" }, { status: 400 })
    }

  } catch (error) {
    console.error("Adjustment error:", error)
    return NextResponse.json({ error: "Failed to create adjustment" }, { status: 500 })
  }
}
