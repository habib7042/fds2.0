import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const loans = await db.loan.findMany({
      include: {
        member: {
          select: { name: true, accountNumber: true, phone: true }
        }
      },
      orderBy: { requestDate: 'desc' }
    })
    return NextResponse.json(loans)
  } catch (error) {
    console.error("Failed to fetch loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}
