"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Plus, LogOut, UserPlus, CreditCard, Users, TrendingUp, AlertCircle, FileText, Search, Wallet, Eye, BarChart2, CheckCircle, XCircle } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"

interface Member {
  id: string
  accountNumber: string
  name: string
  phone?: string
  email?: string
  address?: string
  dob?: string
  nid?: string
  fatherName?: string
  motherName?: string
  maritalStatus?: string
  nomineeName?: string
  nomineeNid?: string
  nomineeRelation?: string
  profileImage?: string
  nomineeImage?: string
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

interface Poll {
  id: string
  question: string
  options: PollOption[]
  isActive: boolean
  createdAt: string
  _count: {
    votes: number
  }
}

interface PollOption {
  id: string
  text: string
  _count: {
    votes: number
  }
}

export default function AdminDashboard() {
  const [members, setMembers] = useState<Member[]>([])
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [showCreatePoll, setShowCreatePoll] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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

  const [newPoll, setNewPoll] = useState({
    question: "",
    options: ["", ""]
  })

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<string>("all")
  const [generatingPDF, setGeneratingPDF] = useState<string | null>(null)

  useEffect(() => {
    checkAuth()
    fetchMembers()
    fetchPolls()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase()
      setFilteredMembers(members.filter(m =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.accountNumber.includes(lowerQuery) ||
        m.phone?.includes(lowerQuery)
      ))
    } else {
      setFilteredMembers(members)
    }
  }, [searchQuery, members])

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
        setFilteredMembers(data)
      } else {
        setError("Failed to fetch members")
      }
    } catch (err) {
      setError("Network error occurred")
    } finally {
      setLoading(false)
    }
  }

  const fetchPolls = async () => {
    try {
      const response = await fetch("/api/admin/polls")
      if (response.ok) {
        const data = await response.json()
        setPolls(data)
      }
    } catch (err) {
      console.error("Failed to fetch polls")
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

  const handleCreatePoll = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/polls", {
        method: "POST",
        body: JSON.stringify(newPoll)
      })

      if (response.ok) {
        setShowCreatePoll(false)
        setNewPoll({ question: "", options: ["", ""] })
        toast.success("পোল তৈরি করা হয়েছে")
        fetchPolls()
      } else {
        toast.error("পোল তৈরি করতে ব্যর্থ")
      }
    } catch (e) {
      toast.error("নেটওয়ার্ক ত্রুটি")
    }
  }

  const handleEndPoll = async (pollId: string) => {
    try {
      const response = await fetch("/api/admin/polls", {
        method: "PATCH",
        body: JSON.stringify({ id: pollId, isActive: false })
      })

      if (response.ok) {
        toast.success("পোল বন্ধ করা হয়েছে")
        fetchPolls()
      } else {
        toast.error("পোল বন্ধ করতে ব্যর্থ")
      }
    } catch (e) {
      toast.error("নেটওয়ার্ক ত্রুটি")
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

  const toBengaliNumber = (num: number | string) => {
    const bengaliDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    return num.toString().replace(/\d/g, (d) => bengaliDigits[parseInt(d)]);
  }

  const getMonthName = (month: string) => {
    const months: { [key: string]: string } = {
      "01": "জানুয়ারি", "02": "ফেব্রুয়ারি", "03": "মার্চ", "04": "এপ্রিল",
      "05": "মে", "06": "জুন", "07": "জুলাই", "08": "আগস্ট",
      "09": "সেপ্টেম্বর", "10": "অক্টোবর", "11": "নভেম্বর", "12": "ডিসেম্বর"
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
      if (hasPaidForSelectedPeriod) paidMembers++
      else unpaidMembers++
    })

    return { paidMembers, unpaidMembers, totalAmount }
  }

  const getTotalFund = () => {
    return members.reduce((sum, member) => {
      return sum + member.contributions.reduce((mSum, c) => mSum + c.amount, 0);
    }, 0);
  }

  const getMonthlyData = () => {
    const data: { name: string; total: number }[] = []
    const today = new Date()

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthStr = String(d.getMonth() + 1).padStart(2, '0')
      const year = d.getFullYear()
      const name = `${getMonthName(monthStr)} ${toBengaliNumber(year)}`

      let total = 0
      members.forEach(member => {
        member.contributions.forEach(c => {
          if (c.month === monthStr && c.year === year) {
            total += c.amount
          }
        })
      })

      data.push({ name, total })
    }
    return data
  }

  const getCurrentMonthPaymentData = () => {
    const today = new Date()
    const currentMonth = String(today.getMonth() + 1).padStart(2, '0')
    const currentYear = today.getFullYear()

    let paid = 0
    let unpaid = 0

    members.forEach(member => {
       const hasPaid = member.contributions.some(c => c.month === currentMonth && c.year === currentYear)
       if (hasPaid) paid++
       else unpaid++
    })

    return [
      { name: 'পরিশোধিত', value: paid },
      { name: 'বকেয়া', value: unpaid }
    ]
  }

  const PIE_COLORS = ['#16a34a', '#dc2626'];

  const generateMemberPDF = async (member: Member) => {
    setGeneratingPDF(member.id)
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) throw new Error('Unable to open print window')

      const totalContributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)
      const currentYearContributions = member.contributions
        .filter(c => c.year === new Date().getFullYear())
        .reduce((sum, c) => sum + c.amount, 0)

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>হিসাব স্টেটমেন্ট - ${member.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
            body { font-family: 'Noto Sans Bengali', sans-serif; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Friends Development Society (FDS)</h1>
            <h2>হিসাব স্টেটমেন্ট</h2>
          </div>
          <div>
            <p><strong>নাম:</strong> ${member.name}</p>
            <p><strong>একাউন্ট নম্বর:</strong> ${toBengaliNumber(member.accountNumber)}</p>
            <p><strong>মোট চাঁদা:</strong> ৳${toBengaliNumber(totalContributions)}</p>
          </div>
          <table>
            <thead>
              <tr><th>মাস</th><th>বছর</th><th>পরিমাণ</th><th>তারিখ</th></tr>
            </thead>
            <tbody>
              ${member.contributions.map(c => `
                <tr>
                  <td>${getMonthName(c.month)}</td>
                  <td>${toBengaliNumber(c.year)}</td>
                  <td>৳${toBengaliNumber(c.amount)}</td>
                  <td>${new Date(c.paymentDate).toLocaleDateString('bn-BD')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <script>window.print();</script>
        </body>
        </html>
      `
      printWindow.document.write(htmlContent)
      printWindow.document.close()
    } catch (error) {
      console.error(error)
      setError('PDF generation failed')
    } finally {
      setGeneratingPDF(null)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 border-b bg-background sticky top-0 z-20">
        <div className="font-bold text-lg">অ্যাডমিন প্যানেল</div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon"><Menu /></Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>মেনু</SheetTitle>
            </SheetHeader>
            <div className="flex flex-col gap-4 mt-8">
              <Button onClick={() => setShowAddMember(true)} variant="outline" className="justify-start">
                <UserPlus className="mr-2 h-4 w-4" /> নতুন সদস্য
              </Button>
              <Button onClick={() => setShowAddContribution(true)} variant="outline" className="justify-start">
                <CreditCard className="mr-2 h-4 w-4" /> চাঁদা যোগ
              </Button>
              <Button onClick={() => setShowCreatePoll(true)} variant="outline" className="justify-start">
                <BarChart2 className="mr-2 h-4 w-4" /> নতুন পোল
              </Button>
              <Button onClick={handleLogout} variant="destructive" className="justify-start">
                <LogOut className="mr-2 h-4 w-4" /> লগআউট
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
        {/* Desktop Header */}
        <div className="hidden md:flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">অ্যাডমিন ড্যাশবোর্ড</h1>
            <p className="text-muted-foreground">সংগঠনের সকল কার্যক্রম নিয়ন্ত্রণ করুন</p>
          </div>
          <div className="flex gap-4">
            <Button onClick={() => setShowAddMember(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> সদস্য যোগ
            </Button>
            <Button onClick={() => setShowAddContribution(true)} variant="secondary">
              <CreditCard className="mr-2 h-4 w-4" /> চাঁদা যোগ
            </Button>
            <Button onClick={() => setShowCreatePoll(true)} variant="outline">
              <BarChart2 className="mr-2 h-4 w-4" /> নতুন পোল
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 h-4 w-4" /> লগআউট
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সদস্য</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{toBengaliNumber(members.length)}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট তহবিল</CardTitle>
              <Wallet className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">৳{toBengaliNumber(getTotalFund())}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">জমা (চলতি মাস)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{toBengaliNumber(getPaymentStats().totalAmount)}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বকেয়া সদস্য</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{toBengaliNumber(getPaymentStats().unpaidMembers)}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
            <TabsTrigger value="members">সদস্য</TabsTrigger>
            <TabsTrigger value="payments">হিসাব</TabsTrigger>
            <TabsTrigger value="overview">সারসংক্ষেপ</TabsTrigger>
            <TabsTrigger value="polls">পোলস</TabsTrigger>
          </TabsList>

          <TabsContent value="members" className="space-y-4">
             <div className="flex items-center gap-2 mb-4">
                <Search className="text-muted-foreground w-4 h-4" />
                <Input
                   placeholder="নাম বা একাউন্ট নম্বর দিয়ে খুঁজুন..."
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="max-w-sm"
                />
             </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence>
                {filteredMembers.map((member) => (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Card className="hover:shadow-md transition-shadow">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <div className="flex items-center gap-3">
                           <Avatar className="h-10 w-10">
                              <AvatarImage src={member.profileImage} alt={member.name} />
                              <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                           </Avatar>
                           <div>
                              <CardTitle className="text-sm font-medium">
                                 {member.name}
                              </CardTitle>
                              <Badge variant="outline">{toBengaliNumber(member.accountNumber)}</Badge>
                           </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p>{toBengaliNumber(member.phone || "ফোন নম্বর নেই")}</p>
                          <p>যোগদান: {new Date(member.createdAt).toLocaleDateString('bn-BD')}</p>
                          <div className="pt-2 flex justify-between items-center">
                             <span className="font-bold text-primary">
                                ৳{toBengaliNumber(member.contributions.reduce((s, c) => s + c.amount, 0))}
                             </span>
                             <div className="flex gap-1">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => setSelectedMember(member)}
                                >
                                    <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => generateMemberPDF(member)}
                                    disabled={generatingPDF === member.id}
                                >
                                    <FileText className="h-4 w-4" />
                                </Button>
                             </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TabsContent>

          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>পেমেন্ট ম্যাট্রিক্স</CardTitle>
                <div className="flex flex-wrap gap-2 mt-2">
                   <Select value={selectedYear.toString()} onValueChange={(v) => setSelectedYear(parseInt(v))}>
                      <SelectTrigger className="w-[100px]">
                         <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                         {[2023, 2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{toBengaliNumber(y)}</SelectItem>)}
                      </SelectContent>
                   </Select>
                   <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="w-[120px]">
                         <SelectValue placeholder="মাস" />
                      </SelectTrigger>
                      <SelectContent>
                         <SelectItem value="all">সব মাস</SelectItem>
                         {Object.entries({
                            "01": "জানুয়ারি", "02": "ফেব্রুয়ারি", "03": "মার্চ", "04": "এপ্রিল",
                            "05": "মে", "06": "জুন", "07": "জুলাই", "08": "আগস্ট",
                            "09": "সেপ্টেম্বর", "10": "অক্টোবর", "11": "নভেম্বর", "12": "ডিসেম্বর"
                         }).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                      </SelectContent>
                   </Select>
                </div>
              </CardHeader>
              <CardContent className="overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[200px]">সদস্য</TableHead>
                      {getFilteredMonths().map(m => (
                        <TableHead key={m.key} className="text-center min-w-[80px]">{m.monthName}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(member => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                           <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                 <AvatarImage src={member.profileImage} alt={member.name} />
                                 <AvatarFallback className="text-xs">{member.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div>
                                 <div className="text-sm">{member.name}</div>
                                 <div className="text-xs text-muted-foreground">{toBengaliNumber(member.accountNumber)}</div>
                              </div>
                           </div>
                        </TableCell>
                        {getFilteredMonths().map(m => {
                          const paid = member.contributions.find(c => c.month === m.month && c.year === m.year)
                          return (
                            <TableCell key={m.key} className="text-center p-2">
                              {paid ? (
                                <div className="bg-green-100 text-green-700 rounded text-xs py-1">৳{toBengaliNumber(paid.amount)}</div>
                              ) : (
                                <div className="bg-red-50 text-red-300 rounded text-xs py-1">-</div>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>মাসিক আয় (সর্বশেষ ৬ মাস)</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getMonthlyData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" fontSize={12} tickMargin={10} />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="total" name="মোট টাকা" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="h-[400px] flex flex-col">
                <CardHeader>
                  <CardTitle>চলতি মাসের পেমেন্ট স্ট্যাটাস</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 min-h-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getCurrentMonthPaymentData()}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {getCurrentMonthPaymentData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="polls" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {polls.map((poll) => (
                <Card key={poll.id} className={!poll.isActive ? "opacity-75" : ""}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <CardTitle className="text-base">{poll.question}</CardTitle>
                        <CardDescription>{new Date(poll.createdAt).toLocaleDateString('bn-BD')}</CardDescription>
                      </div>
                      <Badge variant={poll.isActive ? "default" : "secondary"}>
                        {poll.isActive ? "চলমান" : "বন্ধ"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      {poll.options.map((option) => {
                         const totalVotes = poll._count.votes || 0
                         const percentage = totalVotes > 0 ? Math.round((option._count.votes / totalVotes) * 100) : 0

                         return (
                          <div key={option.id} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>{option.text}</span>
                              <span className="text-muted-foreground">{percentage}% ({option._count.votes})</span>
                            </div>
                            <Progress value={percentage} className="h-2" />
                          </div>
                         )
                      })}
                    </div>
                    <div className="flex justify-between items-center text-sm text-muted-foreground pt-2 border-t">
                      <span>মোট ভোট: {poll._count.votes}</span>
                      {poll.isActive && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleEndPoll(poll.id)}
                        >
                          পোল বন্ধ করুন
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              {polls.length === 0 && (
                <div className="col-span-2 text-center py-10 text-muted-foreground">
                  কোন পোল নেই
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>নতুন সদস্য যোগ করুন</DialogTitle>
            <DialogDescription>সদস্যের প্রয়োজনীয় তথ্য প্রদান করুন</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMember} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">নাম</Label>
              <Input id="name" value={newMember.name} onChange={e => setNewMember({...newMember, name: e.target.value})} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">ফোন</Label>
              <Input id="phone" value={newMember.phone} onChange={e => setNewMember({...newMember, phone: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">ঠিকানা</Label>
              <Textarea id="address" value={newMember.address} onChange={e => setNewMember({...newMember, address: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="submit">সংরক্ষণ করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Contribution Dialog */}
      <Dialog open={showAddContribution} onOpenChange={setShowAddContribution}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>চাঁদা গ্রহণ</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddContribution} className="space-y-4">
            <div className="space-y-2">
              <Label>সদস্য</Label>
              <Select onValueChange={v => setNewContribution({...newContribution, memberId: v})}>
                <SelectTrigger><SelectValue placeholder="সদস্য নির্বাচন করুন" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => <SelectItem key={m.id} value={m.id}>{m.name} ({m.accountNumber})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                  <Label>মাস</Label>
                  <Select onValueChange={v => setNewContribution({...newContribution, month: v})}>
                     <SelectTrigger><SelectValue placeholder="মাস" /></SelectTrigger>
                     <SelectContent>
                        {Object.entries({
                            "01": "জানুয়ারি", "02": "ফেব্রুয়ারি", "03": "মার্চ", "04": "এপ্রিল",
                            "05": "মে", "06": "জুন", "07": "জুলাই", "08": "আগস্ট",
                            "09": "সেপ্টেম্বর", "10": "অক্টোবর", "11": "নভেম্বর", "12": "ডিসেম্বর"
                         }).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                     </SelectContent>
                  </Select>
               </div>
               <div className="space-y-2">
                  <Label>বছর</Label>
                  <Input type="number" value={newContribution.year} onChange={e => setNewContribution({...newContribution, year: parseInt(e.target.value)})} />
               </div>
            </div>
            <div className="space-y-2">
               <Label>পরিমাণ</Label>
               <Input type="number" value={newContribution.amount} onChange={e => setNewContribution({...newContribution, amount: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="submit">জমা দিন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create Poll Dialog */}
      <Dialog open={showCreatePoll} onOpenChange={setShowCreatePoll}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>নতুন পোল তৈরি করুন</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePoll} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="poll-question">প্রশ্ন</Label>
              <Input
                id="poll-question"
                value={newPoll.question}
                onChange={(e) => setNewPoll({...newPoll, question: e.target.value})}
                placeholder="পোলের প্রশ্ন..."
                required
              />
            </div>
            <div className="space-y-2">
              <Label>অপশনস</Label>
              {newPoll.options.map((opt, idx) => (
                <div key={idx} className="flex gap-2">
                  <Input
                    value={opt}
                    onChange={(e) => {
                      const newOptions = [...newPoll.options]
                      newOptions[idx] = e.target.value
                      setNewPoll({...newPoll, options: newOptions})
                    }}
                    placeholder={`অপশন ${idx + 1}`}
                    required
                  />
                  {newPoll.options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newOptions = newPoll.options.filter((_, i) => i !== idx)
                        setNewPoll({...newPoll, options: newOptions})
                      }}
                    >
                      <span className="text-red-500">×</span>
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => setNewPoll({...newPoll, options: [...newPoll.options, ""]})}
              >
                + অপশন যোগ করুন
              </Button>
            </div>
            <DialogFooter>
              <Button type="submit">তৈরি করুন</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Member Details Dialog */}
      <Dialog open={!!selectedMember} onOpenChange={(open) => !open && setSelectedMember(null)}>
         <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
            <DialogHeader>
               <DialogTitle>সদস্যের বিস্তারিত তথ্য</DialogTitle>
            </DialogHeader>
            {selectedMember && (
               <div className="space-y-6">
                  <div className="flex justify-center">
                     <div className="flex flex-col items-center gap-2">
                        <Avatar className="h-32 w-32 border-4 border-muted">
                           <AvatarImage src={selectedMember.profileImage} alt={selectedMember.name} />
                           <AvatarFallback className="text-4xl">{selectedMember.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                           <h3 className="text-xl font-bold">{selectedMember.name}</h3>
                           <Badge variant="secondary" className="mt-1">
                              AC: {toBengaliNumber(selectedMember.accountNumber)}
                           </Badge>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                     <h4 className="font-semibold text-muted-foreground">ব্যক্তিগত তথ্য</h4>
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                           <span className="block text-muted-foreground text-xs">ফোন</span>
                           <span>{toBengaliNumber(selectedMember.phone || "তথ্য নেই")}</span>
                        </div>
                        <div>
                           <span className="block text-muted-foreground text-xs">ইমেইল</span>
                           <span>{selectedMember.email || "তথ্য নেই"}</span>
                        </div>
                        <div>
                           <span className="block text-muted-foreground text-xs">জন্মতারিখ</span>
                           <span>{selectedMember.dob || "তথ্য নেই"}</span>
                        </div>
                        <div>
                           <span className="block text-muted-foreground text-xs">এনআইডি/জন্ম নিবন্ধন</span>
                           <span>{selectedMember.nid || "তথ্য নেই"}</span>
                        </div>
                        <div>
                           <span className="block text-muted-foreground text-xs">বাবার নাম</span>
                           <span>{selectedMember.fatherName || "তথ্য নেই"}</span>
                        </div>
                        <div>
                           <span className="block text-muted-foreground text-xs">মায়ের নাম</span>
                           <span>{selectedMember.motherName || "তথ্য নেই"}</span>
                        </div>
                        <div className="col-span-2">
                           <span className="block text-muted-foreground text-xs">ঠিকানা</span>
                           <span>{selectedMember.address || "তথ্য নেই"}</span>
                        </div>
                     </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                     <h4 className="font-semibold text-muted-foreground">নমিনির তথ্য</h4>
                     <div className="flex items-start gap-4">
                        <Avatar className="h-16 w-16 border-2 border-muted">
                           <AvatarImage src={selectedMember.nomineeImage} alt="Nominee" />
                           <AvatarFallback>N</AvatarFallback>
                        </Avatar>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm flex-1">
                           <div>
                              <span className="block text-muted-foreground text-xs">নাম</span>
                              <span>{selectedMember.nomineeName || "তথ্য নেই"}</span>
                           </div>
                           <div>
                              <span className="block text-muted-foreground text-xs">সম্পর্ক</span>
                              <span>{selectedMember.nomineeRelation || "তথ্য নেই"}</span>
                           </div>
                           <div className="col-span-2">
                              <span className="block text-muted-foreground text-xs">এনআইডি/জন্ম নিবন্ধন</span>
                              <span>{selectedMember.nomineeNid || "তথ্য নেই"}</span>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            )}
         </DialogContent>
      </Dialog>
    </div>
  )
}
