import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()
    if (status !== "RETURNED") {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const investment = await db.investment.update({
      where: { id: params.id },
      data: {
        status,
        returnDate: new Date()
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error("Failed to update investment:", error)
    return NextResponse.json({ error: "Failed to update investment" }, { status: 500 })
  }
}
