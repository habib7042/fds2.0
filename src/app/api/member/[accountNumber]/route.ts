import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { put } from "@vercel/blob"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  try {
    const { accountNumber } = await params

    if (!accountNumber || accountNumber.length !== 4) {
      return NextResponse.json(
        { error: "Invalid account number" },
        { status: 400 }
      )
    }

    const member = await db.member.findUnique({
      where: { accountNumber },
      include: {
        contributions: {
          orderBy: {
            paymentDate: "desc"
          }
        }
      }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    return NextResponse.json(member)
  } catch (error) {
    console.error("Member lookup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ accountNumber: string }> }
) {
  try {
    const { accountNumber } = await params

    // Check if content-type is multipart/form-data
    const contentType = request.headers.get("content-type") || ""

    let updateData: any = {}

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()

      // Extract text fields
      const fields = [
        "dob", "nid", "fatherName", "motherName", "maritalStatus",
        "nomineeName", "nomineeNid", "nomineeRelation",
        "phone", "email", "address"
      ]

      fields.forEach(field => {
        const value = formData.get(field)
        if (value !== null) {
          updateData[field] = value.toString()
        }
      })

      // Handle file uploads
      const profileImageFile = formData.get("profileImage") as File
      if (profileImageFile && profileImageFile.size > 0) {
        try {
          const blob = await put(`members/${accountNumber}/profile-${Date.now()}.${profileImageFile.name.split('.').pop()}`, profileImageFile, {
            access: 'public',
          })
          updateData.profileImage = blob.url
        } catch (uploadError) {
          console.error("Profile image upload failed:", uploadError)
        }
      }

      const nomineeImageFile = formData.get("nomineeImage") as File
      if (nomineeImageFile && nomineeImageFile.size > 0) {
        try {
          const blob = await put(`members/${accountNumber}/nominee-${Date.now()}.${nomineeImageFile.name.split('.').pop()}`, nomineeImageFile, {
            access: 'public',
          })
          updateData.nomineeImage = blob.url
        } catch (uploadError) {
          console.error("Nominee image upload failed:", uploadError)
        }
      }

    } else {
      // Fallback for JSON requests (though UI will switch to FormData)
      updateData = await request.json()
    }

    if (!accountNumber || accountNumber.length !== 4) {
      return NextResponse.json(
        { error: "Invalid account number" },
        { status: 400 }
      )
    }

    // Check if member exists
    const member = await db.member.findUnique({
      where: { accountNumber }
    })

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      )
    }

    // Update member
    const updatedMember = await db.member.update({
      where: { accountNumber },
      data: updateData
    })

    return NextResponse.json(updatedMember)
  } catch (error) {
    console.error("Member update error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
