import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(
  req: Request,
  { params }: { params: { accountNumber: string } }
) {
  try {
    const member = await db.member.findUnique({
      where: { accountNumber: params.accountNumber },
      select: { id: true }
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const loans = await db.loan.findMany({
      where: { memberId: member.id },
      orderBy: { requestDate: 'desc' }
    })

    return NextResponse.json(loans)
  } catch (error) {
    console.error("Failed to fetch member loans:", error)
    return NextResponse.json({ error: "Failed to fetch loans" }, { status: 500 })
  }
}

export async function POST(
  req: Request,
  { params }: { params: { accountNumber: string } }
) {
  try {
    const { amount, reason } = await req.json()
    if (!amount || !reason) {
      return NextResponse.json({ error: "Amount and reason are required" }, { status: 400 })
    }

    const member = await db.member.findUnique({
      where: { accountNumber: params.accountNumber },
      select: { id: true }
    })

    if (!member) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 })
    }

    const loan = await db.loan.create({
      data: {
        memberId: member.id,
        amount: parseFloat(amount),
        reason,
        status: "PENDING"
      }
    })

    return NextResponse.json(loan)
  } catch (error) {
    console.error("Failed to create loan request:", error)
    return NextResponse.json({ error: "Failed to create loan request" }, { status: 500 })
  }
}
