import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const polls = await db.poll.findMany({
      where: {
        isActive: true
      },
      include: {
        options: {
          include: {
            votes: true
          }
        },
        votes: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(polls)
  } catch (error) {
    console.error("Fetch polls error:", error)
    return NextResponse.json({ error: "Failed to fetch polls" }, { status: 500 })
  }
}
