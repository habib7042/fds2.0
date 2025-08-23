"use client"

import { useEffect, useState, useRef } from "react"
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
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const params = useParams()
  const router = useRouter()
  const accountNumber = params.accountNumber as string
  const printRef = useRef<HTMLDivElement>(null)

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

  const generatePDF = async () => {
    if (!member || !printRef.current) return

    setGeneratingPDF(true)
    try {
      // Create print-friendly HTML content
      const printContent = printRef.current.innerHTML
      
      // Create a new window for printing
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Unable to open print window')
      }

      // Create the HTML document with proper styling for Bengali support
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>হিসাব স্টেটমেন্ট - ${member.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Noto Sans Bengali', sans-serif;
              line-height: 1.6;
              color: #333;
              padding: 20px;
              background: #fff;
            }
            
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
            }
            
            .header h1 {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 10px;
              color: #1f2937;
            }
            
            .header h2 {
              font-size: 18px;
              font-weight: 600;
              color: #4b5563;
            }
            
            .section {
              margin-bottom: 25px;
            }
            
            .section-title {
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 15px;
              color: #1f2937;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 5px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 25px;
            }
            
            .info-item {
              margin-bottom: 8px;
            }
            
            .info-label {
              font-weight: 600;
              color: #4b5563;
            }
            
            .table-container {
              overflow-x: auto;
              margin: 20px 0;
            }
            
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 15px 0;
            }
            
            th, td {
              border: 1px solid #d1d5db;
              padding: 8px 12px;
              text-align: left;
              font-size: 14px;
            }
            
            th {
              background-color: #f3f4f6;
              font-weight: 600;
              color: #1f2937;
            }
            
            .amount {
              text-align: right;
              font-weight: 500;
            }
            
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              font-size: 12px;
              color: #6b7280;
            }
            
            .special-note {
              background-color: #fef3c7;
              border: 1px solid #f59e0b;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              color: #92400e;
            }
            
            .special-note strong {
              color: #78350f;
            }
            
            @media print {
              body {
                padding: 0;
                margin: 0;
              }
              
              .no-print {
                display: none;
              }
            }
            
            @page {
              margin: 1cm;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Friends Development Society (FDS)</h1>
            <h2>হিসাব স্টেটমেন্ট / Account Statement</h2>
          </div>
          
          <div class="info-grid">
            <div class="section">
              <div class="section-title">সদস্যের তথ্য / Member Information</div>
              <div class="info-item">
                <span class="info-label">একাউন্ট নম্বর:</span> ${member.accountNumber}
              </div>
              <div class="info-item">
                <span class="info-label">নাম:</span> ${member.name}
              </div>
              <div class="info-item">
                <span class="info-label">ফোন:</span> ${member.phone || 'N/A'}
              </div>
              <div class="info-item">
                <span class="info-label">ইমেইল:</span> ${member.email || 'N/A'}
              </div>
              <div class="info-item">
                <span class="info-label">যোগদানের তারিখ:</span> ${new Date(member.createdAt).toLocaleDateString('bn-BD')}
              </div>
            </div>
            
            <div class="section">
              <div class="section-title">হিসাব সারাংশ / Account Summary</div>
              <div class="info-item">
                <span class="info-label">মোট চাঁদা:</span> ৳${getTotalContributions().toFixed(2)}
              </div>
              <div class="info-item">
                <span class="info-label">চলতি বছরের চাঁদা:</span> ৳${getCurrentYearContributions().toFixed(2)}
              </div>
              <div class="info-item">
                <span class="info-label">মোট পেমেন্ট:</span> ${member.contributions.length} টি
              </div>
              <div class="info-item">
                <span class="info-label">স্টেটমেন্ট তারিখ:</span> ${new Date().toLocaleDateString('bn-BD')}
              </div>
            </div>
          </div>
          
          <div class="section">
            <div class="section-title">চাঁদার ইতিহাস / Contribution History</div>
            ${member.contributions.length > 0 ? `
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>মাস</th>
                      <th>বছর</th>
                      <th class="amount">পরিমাণ</th>
                      <th>জমা দেওয়ার তারিখ</th>
                      <th>বিবরণ</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${member.contributions
                      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                      .map(contribution => `
                        <tr>
                          <td>${getMonthName(contribution.month)}</td>
                          <td>${contribution.year}</td>
                          <td class="amount">৳${contribution.amount.toFixed(2)}</td>
                          <td>${new Date(contribution.paymentDate).toLocaleDateString('bn-BD')}</td>
                          <td>${contribution.description || '-'}</td>
                        </tr>
                      `).join('')}
                  </tbody>
                </table>
              </div>
            ` : '<p style="text-align: center; color: #6b7280; padding: 20px;">এখনো কোন চাঁদা জমা দেওয়া হয়নি</p>'}
          </div>
          
          ${member.address ? `
            <div class="section">
              <div class="section-title">ঠিকানা / Address</div>
              <p style="background-color: #f9fafb; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px;">${member.address.replace(/\n/g, '<br>')}</p>
            </div>
          ` : ''}
          
          ${member.contributions.length === 0 ? `
            <div class="special-note">
              <strong>বিশেষ নোট:</strong> এই সদস্যটি এখনো কোনো চাঁদা জমা দেয়নি। অনুগ্রহ করে নিয়মিত চাঁদা জমা দেওয়ার জন্য অনুরোধ করা হলো।
            </div>
          ` : ''}
          
          <div class="footer">
            <p>Friends Development Society (FDS) - স্বচ্ছতা ও জবাবদিহিতার প্রতিশ্রুতি</p>
            <p>Generated on: ${new Date().toLocaleString('bn-BD')}</p>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <p style="color: #6b7280; font-size: 14px;">দয়া করে Print বা Save as PDF বাটন ব্যবহার করুন</p>
            <p style="color: #6b7280; font-size: 12px;">Please use Print or Save as PDF button</p>
          </div>
        </body>
        </html>
      `

      printWindow.document.write(htmlContent)
      printWindow.document.close()
      
      // Wait for the content to load, then trigger print
      printWindow.onload = () => {
        printWindow.print()
        // Note: We don't close the window automatically as it might interrupt the print dialog
      }
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      setError('PDF তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setGeneratingPDF(false)
    }
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
          <div className="flex gap-4">
            <Button 
              onClick={generatePDF} 
              disabled={generatingPDF || loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {generatingPDF ? "প্রিন্ট প্রিভিউ তৈরি হচ্ছে..." : "হিসাব স্টেটমেন্ট প্রিন্ট করুন"}
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              লগআউট
            </Button>
          </div>
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

        {/* Hidden print content for PDF generation */}
        <div ref={printRef} className="hidden">
          {/* This div is used as a reference for PDF generation */}
          <div className="print-content">
            <h1>Friends Development Society (FDS)</h1>
            <h2>হিসাব স্টেটমেন্ট</h2>
            <div className="member-info">
              <p>একাউন্ট নম্বর: {member.accountNumber}</p>
              <p>নাম: {member.name}</p>
              <p>ফোন: {member.phone || 'N/A'}</p>
              <p>ইমেইল: {member.email || 'N/A'}</p>
              <p>যোগদানের তারিখ: {new Date(member.createdAt).toLocaleDateString('bn-BD')}</p>
            </div>
            <div className="contributions">
              {member.contributions.map(contribution => (
                <div key={contribution.id}>
                  <p>মাস: {getMonthName(contribution.month)}</p>
                  <p>বছর: {contribution.year}</p>
                  <p>পরিমাণ: ৳{contribution.amount.toFixed(2)}</p>
                  <p>তারিখ: {new Date(contribution.paymentDate).toLocaleDateString('bn-BD')}</p>
                  <p>বিবরণ: {contribution.description || '-'}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}