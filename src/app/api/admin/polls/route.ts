import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { question, options, creatorId } = await request.json()

    if (!question || !options || options.length < 2) {
      return NextResponse.json({ error: "Invalid poll data" }, { status: 400 })
    }

    const poll = await db.poll.create({
      data: {
        question,
        creatorId,
        options: {
          create: options.map((opt: string) => ({ text: opt }))
        }
      },
      include: {
        options: true
      }
    })

    return NextResponse.json(poll)
  } catch (error) {
    console.error("Create poll error:", error)
    return NextResponse.json({ error: "Failed to create poll" }, { status: 500 })
  }
}
