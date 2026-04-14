import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { status } = await req.json()
    const validStatuses = ["APPROVED", "REJECTED", "PAID"]
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    const dataToUpdate: any = { status }
    if (status === "APPROVED") dataToUpdate.approvedDate = new Date()
    if (status === "PAID") dataToUpdate.paidDate = new Date()

    const loan = await db.loan.update({
      where: { id: params.id },
      data: dataToUpdate
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Failed to update loan:", error)
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
  }
}
