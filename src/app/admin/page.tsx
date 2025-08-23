"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const router = useRouter()

  const [newMember, setNewMember] = useState({
    name: "",
    phone: "",
    email: "",
    address: ""
  })

  const [newContribution, setNewContribution] = useState({
    memberId: "",
    month: "",
    year: new Date().getFullYear(),
    amount: "",
    description: ""
  })

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    checkAuth()
    fetchMembers()
  }, [])

  const checkAuth = () => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/")
    }
  }

  const fetchMembers = async () => {
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/members", {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setMembers(data)
      } else {
        setError("Failed to fetch members")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/members", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newMember)
      })

      if (response.ok) {
        setShowAddMember(false)
        setNewMember({ name: "", phone: "", email: "", address: "" })
        fetchMembers()
      } else {
        const { error } = await response.json()
        setError(error || "Failed to add member")
      }
    } catch (err) {
      setError("Network error occurred")
    }
  }

  const handleAddContribution = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("adminToken")
      const response = await fetch("/api/admin/contributions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newContribution,
          amount: parseFloat(newContribution.amount)
        })
      })

      if (response.ok) {
        setShowAddContribution(false)
        setNewContribution({
          memberId: "",
          month: "",
          year: new Date().getFullYear(),
          amount: "",
          description: ""
        })
        fetchMembers()
      } else {
        const { error } = await response.json()
        setError(error || "Failed to add contribution")
      }
    } catch (err) {
      setError("Network error occurred")
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("adminToken")
    router.push("/")
  }

  const generateAccountNumber = () => {
    const lastMember = members.reduce((prev, current) => 
      parseInt(prev.accountNumber) > parseInt(current.accountNumber) ? prev : current
    , members[0])
    
    const lastNumber = lastMember ? parseInt(lastMember.accountNumber) : 0
    return String(lastNumber + 1).padStart(4, '0')
  }

  // Helper functions for payment tracking
  const getMonthName = (month: string) => {
    const months: { [key: string]: string } = {
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
    return months[month] || month
  }

  const getFilteredMonths = () => {
    const months = []
    const currentYear = selectedYear || new Date().getFullYear()
    const startMonth = selectedMonth && selectedMonth !== "all" ? parseInt(selectedMonth) : 1
    const endMonth = selectedMonth && selectedMonth !== "all" ? parseInt(selectedMonth) : 12
    
    for (let month = startMonth; month <= endMonth; month++) {
      const monthStr = String(month).padStart(2, '0')
      months.push({
        month: monthStr,
        year: currentYear,
        monthName: getMonthName(monthStr),
        key: `${currentYear}-${monthStr}`
      })
    }
    
    return months
  }

  const getPaymentStats = () => {
    const filteredMonths = getFilteredMonths()
    let paidMembers = 0
    let unpaidMembers = 0
    let totalAmount = 0

    members.forEach(member => {
      let hasPaidForSelectedPeriod = false
      filteredMonths.forEach(monthInfo => {
        const payment = member.contributions.find(
          c => c.month === monthInfo.month && c.year === monthInfo.year
        )
        if (payment) {
          hasPaidForSelectedPeriod = true
          totalAmount += payment.amount
        }
      })
      
      if (hasPaidForSelectedPeriod) {
        paidMembers++
      } else {
        unpaidMembers++
      }
    })

    return { paidMembers, unpaidMembers, totalAmount }
  }

  const getRecentContributions = () => {
    const allContributions = members.flatMap(member => 
      member.contributions.map(contribution => ({
        ...contribution,
        memberName: member.name,
        accountNumber: member.accountNumber
      }))
    )
    
    return allContributions
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 10)
  }

  const getMonthlyPaymentStatus = () => {
    const currentYear = new Date().getFullYear()
    const months = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))
    
    return months.map(month => {
      const paidCount = members.filter(member => 
        member.contributions.some(c => c.month === month && c.year === currentYear)
      ).length
      
      const unpaidCount = members.length - paidCount
      
      const totalAmount = members
        .filter(member => 
          member.contributions.some(c => c.month === month && c.year === currentYear)
        )
        .reduce((sum, member) => {
          const contribution = member.contributions.find(c => c.month === month && c.year === currentYear)
          return sum + (contribution?.amount || 0)
        }, 0)

      return {
        month,
        monthName: getMonthName(month),
        year: currentYear,
        paidCount,
        unpaidCount,
        totalAmount
      }
    }).reverse()
  }

  const getMembersWithPaymentIssues = () => {
    const currentDate = new Date()
    const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0')
    const currentYear = currentDate.getFullYear()
    
    return members.filter(member => {
      // Check if member has contributions for the last 2 months
      const twoMonthsAgo = new Date(currentDate)
      twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
      
      const requiredMonths = []
      for (let i = 0; i < 2; i++) {
        const checkDate = new Date(currentDate)
        checkDate.setMonth(checkDate.getMonth() - i)
        requiredMonths.push({
          month: String(checkDate.getMonth() + 1).padStart(2, '0'),
          year: checkDate.getFullYear()
        })
      }
      
      const overdueMonths = requiredMonths.filter(({ month, year }) => 
        !member.contributions.some(c => c.month === month && c.year === year)
      )
      
      return overdueMonths.length > 0
    }).map(member => {
      const currentDate = new Date()
      const requiredMonths = []
      for (let i = 0; i < 2; i++) {
        const checkDate = new Date(currentDate)
        checkDate.setMonth(checkDate.getMonth() - i)
        requiredMonths.push({
          month: String(checkDate.getMonth() + 1).padStart(2, '0'),
          year: checkDate.getFullYear()
        })
      }
      
      const overdueMonths = requiredMonths.filter(({ month, year }) => 
        !member.contributions.some(c => c.month === month && c.year === year)
      )
      
      return {
        ...member,
        overdueMonths: overdueMonths.length
      }
    })
  }

  const generateMemberPDF = async (member: Member) => {
    setGeneratingPDF(member.id)
    try {
      // Create print-friendly HTML content
      const printWindow = window.open('', '_blank')
      if (!printWindow) {
        throw new Error('Unable to open print window')
      }

      const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)
      const currentYearContributions = member.contributions
        .filter(c => c.year === new Date().getFullYear())
        .reduce((sum, c) => sum + c.amount, 0)

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
            
            .admin-note {
              background-color: #dbeafe;
              border: 1px solid #3b82f6;
              padding: 15px;
              margin: 20px 0;
              border-radius: 5px;
              color: #1e40af;
            }
            
            .admin-note strong {
              color: #1e3a8a;
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
                <span class="info-label">মোট চাঁদা:</span> ৳${totalContributions.toFixed(2)}
              </div>
              <div class="info-item">
                <span class="info-label">চলতি বছরের চাঁদা:</span> ৳${currentYearContributions.toFixed(2)}
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
          
          <div class="admin-note">
            <strong>অ্যাডমিন নোট:</strong> এই স্টেটমেন্টটি অ্যাডমিন দ্বারা জেনারেট করা হয়েছে।
          </div>
          
          <div class="footer">
            <p>Friends Development Society (FDS) - স্বচ্ছতা ও জবাবদিহিতার প্রতিশ্রুতি</p>
            <p>Generated by Admin on: ${new Date().toLocaleString('bn-BD')}</p>
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
      }
      
    } catch (error) {
      console.error('PDF generation failed:', error)
      setError('PDF তৈরি করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।')
    } finally {
      setGeneratingPDF(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">হিসাবরক্ষক ড্যাশবোর্ড</h1>
            <p className="text-gray-600">Admin Dashboard</p>
          </div>
          <div className="flex gap-4">
            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
              <DialogTrigger asChild>
                <Button>নতুন সদস্য যোগ করুন</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>নতুন সদস্য যোগ করুন</DialogTitle>
                  <DialogDescription>
                    নতুন সদস্যের তথ্য পূরণ করুন
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">নাম</Label>
                    <Input
                      id="name"
                      value={newMember.name}
                      onChange={(e) => setNewMember({...newMember, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">ফোন নম্বর</Label>
                    <Input
                      id="phone"
                      value={newMember.phone}
                      onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">ইমেইল</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newMember.email}
                      onChange={(e) => setNewMember({...newMember, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">ঠিকানা</Label>
                    <Textarea
                      id="address"
                      value={newMember.address}
                      onChange={(e) => setNewMember({...newMember, address: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">সদস্য যোগ করুন</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddMember(false)}>
                      বাতিল
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={showAddContribution} onOpenChange={setShowAddContribution}>
              <DialogTrigger asChild>
                <Button variant="outline">চাঁদা যোগ করুন</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>চাঁদা যোগ করুন</DialogTitle>
                  <DialogDescription>
                    সদস্যের মাসিক চাঁদা যোগ করুন
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddContribution} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="memberId">সদস্য</Label>
                    <Select 
                      value={newContribution.memberId} 
                      onValueChange={(value) => setNewContribution({...newContribution, memberId: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="সদস্য নির্বাচন করুন" />
                      </SelectTrigger>
                      <SelectContent>
                        {members.map((member) => (
                          <SelectItem key={member.id} value={member.id}>
                            {member.name} ({member.accountNumber})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="month">মাস</Label>
                      <Select 
                        value={newContribution.month} 
                        onValueChange={(value) => setNewContribution({...newContribution, month: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="মাস নির্বাচন করুন" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="01">জানুয়ারি</SelectItem>
                          <SelectItem value="02">ফেব্রুয়ারি</SelectItem>
                          <SelectItem value="03">মার্চ</SelectItem>
                          <SelectItem value="04">এপ্রিল</SelectItem>
                          <SelectItem value="05">মে</SelectItem>
                          <SelectItem value="06">জুন</SelectItem>
                          <SelectItem value="07">জুলাই</SelectItem>
                          <SelectItem value="08">আগস্ট</SelectItem>
                          <SelectItem value="09">সেপ্টেম্বর</SelectItem>
                          <SelectItem value="10">অক্টোবর</SelectItem>
                          <SelectItem value="11">নভেম্বর</SelectItem>
                          <SelectItem value="12">ডিসেম্বর</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="year">বছর</Label>
                      <Input
                        id="year"
                        type="number"
                        value={newContribution.year}
                        onChange={(e) => setNewContribution({...newContribution, year: parseInt(e.target.value)})}
                        min="2020"
                        max="2030"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">পরিমাণ</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newContribution.amount}
                      onChange={(e) => setNewContribution({...newContribution, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">বিবরণ</Label>
                    <Textarea
                      id="description"
                      value={newContribution.description}
                      onChange={(e) => setNewContribution({...newContribution, description: e.target.value})}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">চাঁদা যোগ করুন</Button>
                    <Button type="button" variant="outline" onClick={() => setShowAddContribution(false)}>
                      বাতিল
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

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

        <Tabs defaultValue="members" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="members">সদস্য তালিকা</TabsTrigger>
            <TabsTrigger value="payments">চাঁদার হিসাব</TabsTrigger>
            <TabsTrigger value="overview">সারসংক্ষেপ</TabsTrigger>
          </TabsList>

          <TabsContent value="members">
            <Card>
              <CardHeader>
                <CardTitle>সদস্যদের তালিকা</CardTitle>
                <CardDescription>
                  মোট সদস্য: {members.length} | পরবর্তী একাউন্ট নম্বর: {generateAccountNumber()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>একাউন্ট নম্বর</TableHead>
                        <TableHead>নাম</TableHead>
                        <TableHead>ফোন</TableHead>
                        <TableHead>ইমেইল</TableHead>
                        <TableHead>মোট চাঁদা</TableHead>
                        <TableHead>যোগদানের তারিখ</TableHead>
                        <TableHead>একশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {members.map((member) => {
                        const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)
                        return (
                          <TableRow key={member.id}>
                            <TableCell className="font-medium">{member.accountNumber}</TableCell>
                            <TableCell>{member.name}</TableCell>
                            <TableCell>{member.phone || "-"}</TableCell>
                            <TableCell>{member.email || "-"}</TableCell>
                            <TableCell>৳{totalContributions.toFixed(2)}</TableCell>
                            <TableCell>{new Date(member.createdAt).toLocaleDateString("bn-BD")}</TableCell>
                            <TableCell>
                              <Button 
                                size="sm" 
                                onClick={() => generateMemberPDF(member)}
                                disabled={generatingPDF === member.id}
                                className="bg-blue-600 hover:bg-blue-700"
                              >
                                {generatingPDF === member.id ? "তৈরি হচ্ছে..." : "PDF"}
                              </Button>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>মাসিক চাঁদার হিসাব</CardTitle>
                <CardDescription>
                  কোন সদস্য কোন মাসের চাঁদা দিয়েছেন তার বিস্তারিত হিসাব
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Year and Month Filter */}
                  <div className="flex gap-4 items-center">
                    <div className="space-y-2">
                      <Label>বছর</Label>
                      <Select 
                        value={selectedYear?.toString() || ""} 
                        onValueChange={(value) => setSelectedYear(parseInt(value))}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="বছর" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>মাস</Label>
                      <Select 
                        value={selectedMonth || "all"} 
                        onValueChange={(value) => setSelectedMonth(value)}
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue placeholder="সব মাস" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">সব মাস</SelectItem>
                          <SelectItem value="01">জানুয়ারি</SelectItem>
                          <SelectItem value="02">ফেব্রুয়ারি</SelectItem>
                          <SelectItem value="03">মার্চ</SelectItem>
                          <SelectItem value="04">এপ্রিল</SelectItem>
                          <SelectItem value="05">মে</SelectItem>
                          <SelectItem value="06">জুন</SelectItem>
                          <SelectItem value="07">জুলাই</SelectItem>
                          <SelectItem value="08">আগস্ট</SelectItem>
                          <SelectItem value="09">সেপ্টেম্বর</SelectItem>
                          <SelectItem value="10">অক্টোবর</SelectItem>
                          <SelectItem value="11">নভেম্বর</SelectItem>
                          <SelectItem value="12">ডিসেম্বর</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Payment Matrix Table */}
                  <div className="overflow-x-auto border rounded-lg">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky left-0 bg-white z-10">সদস্য</TableHead>
                          <TableHead className="text-center">একাউন্ট</TableHead>
                          {getFilteredMonths().map((monthInfo) => (
                            <TableHead key={monthInfo.key} className="text-center min-w-[100px]">
                              <div>
                                <div className="text-xs text-gray-500">{monthInfo.monthName}</div>
                                <div className="font-semibold">{monthInfo.year}</div>
                              </div>
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {members.map((member) => (
                          <TableRow key={member.id}>
                            <TableCell className="sticky left-0 bg-white z-10 font-medium">
                              {member.name}
                            </TableCell>
                            <TableCell className="text-center font-mono">
                              {member.accountNumber}
                            </TableCell>
                            {getFilteredMonths().map((monthInfo) => {
                              const payment = member.contributions.find(
                                c => c.month === monthInfo.month && c.year === monthInfo.year
                              )
                              return (
                                <TableCell key={monthInfo.key} className="text-center">
                                  {payment ? (
                                    <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-200">
                                      <div className="text-xs">৳{payment.amount}</div>
                                      <div className="text-xs opacity-75">
                                        {new Date(payment.paymentDate).toLocaleDateString("bn-BD", { 
                                          month: 'short', 
                                          day: 'numeric' 
                                        })}
                                      </div>
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="text-red-600 border-red-200">
                                      অপরিশোধিত
                                    </Badge>
                                  )}
                                </TableCell>
                              )
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Payment Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {getPaymentStats().paidMembers}
                          </div>
                          <div className="text-sm text-gray-600">চাঁদা দিয়েছেন</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-red-600">
                            {getPaymentStats().unpaidMembers}
                          </div>
                          <div className="text-sm text-gray-600">চাঁদা দেননি</div>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            ৳{getPaymentStats().totalAmount.toFixed(2)}
                          </div>
                          <div className="text-sm text-gray-600">মোট চাঁদা</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Contributions */}
              <Card>
                <CardHeader>
                  <CardTitle>সাম্প্রতিক চাঁদা</CardTitle>
                  <CardDescription>শেষ ১০টি চাঁদার লেনদেন</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getRecentContributions().map((contribution, index) => (
                      <div key={contribution.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{contribution.memberName}</div>
                          <div className="text-sm text-gray-500">
                            {getMonthName(contribution.month)} {contribution.year}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-600">৳{contribution.amount}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(contribution.paymentDate).toLocaleDateString("bn-BD")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Payment Status by Month */}
              <Card>
                <CardHeader>
                  <CardTitle>মাস অনুযায়ী অবস্থা</CardTitle>
                  <CardDescription>চলতি বছরের মাসিক চাঁদার হিসাব</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {getMonthlyPaymentStatus().map((status) => (
                      <div key={status.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium">{status.monthName}</div>
                          <div className="text-sm text-gray-500">{status.year}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            <span className="text-green-600">{status.paidCount} জন</span>
                            <span className="text-gray-400"> / </span>
                            <span className="text-red-600">{status.unpaidCount} জন</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            ৳{status.totalAmount}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Members with Payment Issues */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>চাঁদা বকেয়া সদস্য</CardTitle>
                <CardDescription>যারা ২ মাস বা তার বেশি চাঁদা দেননি</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getMembersWithPaymentIssues().map((member) => (
                    <div key={member.id} className="p-4 border border-red-200 rounded-lg bg-red-50">
                      <div className="font-medium text-red-800">{member.name}</div>
                      <div className="text-sm text-red-600">একাউন্ট: {member.accountNumber}</div>
                      <div className="text-sm text-red-500">
                        বকেয়া: {member.overdueMonths} মাস
                      </div>
                    </div>
                  ))}
                  {getMembersWithPaymentIssues().length === 0 && (
                    <div className="col-span-full text-center py-8 text-green-600">
                      সব সদস্যই নিয়মিত চাঁদা দিচ্ছেন!
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}