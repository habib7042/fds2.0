import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { postId } = await params
    const { authorId } = await request.json()

    // Check if already liked
    const existingLike = await db.like.findUnique({
      where: {
        authorId_postId: {
          authorId,
          postId
        }
      }
    })

    if (existingLike) {
      // Unlike
      await db.like.delete({
        where: {
          id: existingLike.id
        }
      })
      return NextResponse.json({ liked: false })
    } else {
      // Like
      await db.like.create({
        data: {
          authorId,
          postId
        }
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Like error:", error)
    return NextResponse.json({ error: "Failed to like post" }, { status: 500 })
  }
}
