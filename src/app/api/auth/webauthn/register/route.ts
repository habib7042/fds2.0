import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { generateRegistrationOptions, verifyRegistrationResponse } from "@simplewebauthn/server"
import { isoBase64URL } from "@simplewebauthn/server/helpers"

const RP_ID = process.env.NEXT_PUBLIC_RP_ID || "localhost"
const ORIGIN = process.env.NEXT_PUBLIC_ORIGIN || "http://localhost:3000"

export async function POST(req: NextRequest) {
    try {
        const body = await req.json()
        const { action, memberId, attestationResponse } = body

        if (action === "generate-options") {
            if (!memberId) return NextResponse.json({ error: "Member ID required" }, { status: 400 })

            const member = await db.member.findUnique({
                where: { id: memberId },
                include: { authenticators: true }
            })

            if (!member) return NextResponse.json({ error: "Member not found" }, { status: 404 })

            const options = await generateRegistrationOptions({
                rpName: "Friends Development Society",
                rpID: RP_ID,
                userID: member.id,
                userName: member.accountNumber,
                attestationType: "none",
                excludeCredentials: member.authenticators.map(auth => ({
                    id: auth.credentialID,
                    type: "public-key",
                    transports: auth.transports ? (JSON.parse(auth.transports) as AuthenticatorTransport[]) : undefined,
                })),
                authenticatorSelection: {
                    residentKey: "preferred",
                    userVerification: "preferred",
                    authenticatorAttachment: "platform",
                },
            })

            // Save challenge to DB
            await db.member.update({
                where: { id: member.id },
                data: { webAuthnChallenge: options.challenge }
            })

            return NextResponse.json(options)
        }

        if (action === "verify") {
            if (!memberId || !attestationResponse) return NextResponse.json({ error: "Invalid payload" }, { status: 400 })

            const member = await db.member.findUnique({ where: { id: memberId } })
            if (!member || !member.webAuthnChallenge) return NextResponse.json({ error: "Invalid session" }, { status: 400 })

            let verification
            try {
                verification = await verifyRegistrationResponse({
                    response: attestationResponse,
                    expectedChallenge: member.webAuthnChallenge,
                    expectedOrigin: ORIGIN,
                    expectedRPID: RP_ID,
                })
            } catch (error) {
                console.error(error)
                return NextResponse.json({ error: "Verification failed" }, { status: 400 })
            }

            if (verification.verified && verification.registrationInfo) {
                const { credentialPublicKey, credentialID, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo

                await db.authenticator.create({
                    data: {
                        credentialID: isoBase64URL.fromBuffer(credentialID), // Convert to base64url string
                        credentialPublicKey: isoBase64URL.fromBuffer(credentialPublicKey), // Convert to base64url string
                        counter: BigInt(counter),
                        credentialDeviceType,
                        credentialBackedUp,
                        transports: JSON.stringify(attestationResponse.response.transports || []),
                        memberId: member.id
                    }
                })

                // Clear challenge
                await db.member.update({
                    where: { id: member.id },
                    data: { webAuthnChallenge: null }
                })

                return NextResponse.json({ success: true })
            }

            return NextResponse.json({ error: "Verification failed" }, { status: 400 })
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.error("WebAuthn Register Error:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
