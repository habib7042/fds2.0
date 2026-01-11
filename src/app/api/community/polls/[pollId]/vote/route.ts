import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ pollId: string }> }
) {
  try {
    const { pollId } = await params
    const { voterId, optionId } = await request.json()

    // Check if user already voted in this poll
    const existingVote = await db.pollVote.findUnique({
      where: {
        voterId_pollId: {
          voterId,
          pollId
        }
      }
    })

    if (existingVote) {
      return NextResponse.json({ error: "Already voted" }, { status: 400 })
    }

    const vote = await db.pollVote.create({
      data: {
        voterId,
        pollId,
        optionId
      }
    })

    return NextResponse.json(vote)
  } catch (error) {
    console.error("Vote error:", error)
    return NextResponse.json({ error: "Failed to vote" }, { status: 500 })
  }
}
