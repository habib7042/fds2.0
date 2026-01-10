import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"

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
    const body = await request.json()

    // Whitelist fields that can be updated
    const {
      dob,
      nid,
      fatherName,
      motherName,
      maritalStatus,
      nomineeName,
      nomineeNid,
      nomineeRelation,
      phone,
      email,
      address
    } = body

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
      data: {
        dob,
        nid,
        fatherName,
        motherName,
        maritalStatus,
        nomineeName,
        nomineeNid,
        nomineeRelation,
        phone,
        email,
        address
      }
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
