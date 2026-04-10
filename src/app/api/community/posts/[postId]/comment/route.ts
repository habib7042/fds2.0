import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { content, authorId } = await request.json()

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 })
    }

    const comment = await db.comment.create({
      data: {
        content,
        authorId,
        postId
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            profileImage: true
          }
        }
      }
    })

    return NextResponse.json(comment)
  } catch (error) {
    console.error("Comment error:", error)
    return NextResponse.json({ error: "Failed to comment" }, { status: 500 })
  }
}
