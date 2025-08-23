"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Member {
  id: string
  accountNumber: string
  name: string
  phone?: string
  email?: string
  address?: string
  createdAt: string
  contributions: Contribution[]
}

interface Contribution {
  id: string
  memberId: string
  month: string
  year: number
  amount: number
  paymentDate: string
  description?: string
}

const monthNames = {
  "01": "জানুয়ারি",
  "02": "ফেব্রুয়ারি",
  "03": "মার্চ",
  "04": "এপ্রিল",
  "05": "মে",
  "06": "জুন",
  "07": "জুলাই",
  "08": "আগস্ট",
  "09": "সেপ্টেম্বর",
  "10": "অক্টোবর",
  "11": "নভেম্বর",
  "12": "ডিসেম্বর"
}

export default function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const params = useParams()
  const router = useRouter()
  const accountNumber = params.accountNumber as string

  useEffect(() => {
    fetchMemberData()
  }, [accountNumber])

  const fetchMemberData = async () => {
    try {
      const response = await fetch(`/api/member/${accountNumber}`)
      
      if (response.ok) {
        const data = await response.json()
        setMember(data)
      } else {
        setError("Member not found")
        router.push("/")
      }
    } catch (err) {
      setError("Network error occurred")
      router.push("/")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("memberAccount")
    router.push("/")
  }

  const getMonthName = (month: string) => {
    return monthNames[month as keyof typeof monthNames] || month
  }

  const getTotalContributions = () => {
    if (!member) return 0
    return member.contributions.reduce((sum, contribution) => sum + contribution.amount, 0)
  }

  const getCurrentYearContributions = () => {
    if (!member) return 0
    const currentYear = new Date().getFullYear()
    return member.contributions
      .filter(c => c.year === currentYear)
      .reduce((sum, contribution) => sum + contribution.amount, 0)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Member not found</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">সদস্য ড্যাশবোর্ড</h1>
            <p className="text-gray-600">Member Dashboard</p>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            লগআউট
          </Button>
        </div>

        {error && (
          <Alert className="mb-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">একাউন্ট তথ্য</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div><strong>একাউন্ট নম্বর:</strong> {member.accountNumber}</div>
                <div><strong>নাম:</strong> {member.name}</div>
                <div><strong>ফোন:</strong> {member.phone || "N/A"}</div>
                <div><strong>ইমেইল:</strong> {member.email || "N/A"}</div>
                <div><strong>যোগদানের তারিখ:</strong> {new Date(member.createdAt).toLocaleDateString("bn-BD")}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">মোট চাঁদা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                ৳{getTotalContributions().toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                সকল সময়ের মোট চাঁদা
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">চলতি বছরের চাঁদা</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                ৳{getCurrentYearContributions().toFixed(2)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {new Date().getFullYear()} সালের মোট চাঁদা
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>চাঁদার ইতিহাস</CardTitle>
            <CardDescription>
              আপনার সকল মাসিক চাঁদার তালিকা
            </CardDescription>
          </CardHeader>
          <CardContent>
            {member.contributions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>মাস</TableHead>
                      <TableHead>বছর</TableHead>
                      <TableHead>পরিমাণ</TableHead>
                      <TableHead>জমা দেওয়ার তারিখ</TableHead>
                      <TableHead>বিবরণ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {member.contributions
                      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                      .map((contribution) => (
                        <TableRow key={contribution.id}>
                          <TableCell>{getMonthName(contribution.month)}</TableCell>
                          <TableCell>{contribution.year}</TableCell>
                          <TableCell className="font-medium">৳{contribution.amount.toFixed(2)}</TableCell>
                          <TableCell>{new Date(contribution.paymentDate).toLocaleDateString("bn-BD")}</TableCell>
                          <TableCell>{contribution.description || "-"}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                এখনো কোন চাঁদা জমা দেওয়া হয়নি
              </div>
            )}
          </CardContent>
        </Card>

        {member.address && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>ঠিকানা</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{member.address}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}