import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET() {
  try {
    const investments = await db.investment.findMany({
      orderBy: { date: 'desc' }
    })
    return NextResponse.json(investments)
  } catch (error) {
    console.error("Failed to fetch investments:", error)
    return NextResponse.json({ error: "Failed to fetch investments" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { amount, description } = await req.json()
    if (!amount || !description) {
      return NextResponse.json({ error: "Amount and description are required" }, { status: 400 })
    }

    const investment = await db.investment.create({
      data: {
        amount: parseFloat(amount),
        description,
        status: "ACTIVE"
      }
    })

    return NextResponse.json(investment)
  } catch (error) {
    console.error("Failed to create investment:", error)
    return NextResponse.json({ error: "Failed to create investment" }, { status: 500 })
  }
}
