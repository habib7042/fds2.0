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
import { Menu, Plus, LogOut, UserPlus, CreditCard, Users, TrendingUp, AlertCircle, FileText, Search } from "lucide-react"

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
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddContribution, setShowAddContribution] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
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

  useEffect(() => {
    checkAuth()
    fetchMembers()
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
            <p><strong>একাউন্ট নম্বর:</strong> ${member.accountNumber}</p>
            <p><strong>মোট চাঁদা:</strong> ৳${totalContributions}</p>
          </div>
          <table>
            <thead>
              <tr><th>মাস</th><th>বছর</th><th>পরিমাণ</th><th>তারিখ</th></tr>
            </thead>
            <tbody>
              ${member.contributions.map(c => `
                <tr>
                  <td>${getMonthName(c.month)}</td>
                  <td>${c.year}</td>
                  <td>৳${c.amount}</td>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট সদস্য</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{members.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট জমা (চলতি মাস)</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳{getPaymentStats().totalAmount}</div>
            </CardContent>
          </Card>
           <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">বকেয়া সদস্য</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{getPaymentStats().unpaidMembers}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="members" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="members">সদস্য</TabsTrigger>
            <TabsTrigger value="payments">হিসাব</TabsTrigger>
            <TabsTrigger value="overview">সারসংক্ষেপ</TabsTrigger>
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
                        <CardTitle className="text-sm font-medium">
                          {member.name}
                        </CardTitle>
                        <Badge variant="outline">{member.accountNumber}</Badge>
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground mt-2 space-y-1">
                          <p>{member.phone || "ফোন নম্বর নেই"}</p>
                          <p>যোগদান: {new Date(member.createdAt).toLocaleDateString('bn-BD')}</p>
                          <div className="pt-2 flex justify-between items-center">
                             <span className="font-bold text-primary">
                                ৳{member.contributions.reduce((s, c) => s + c.amount, 0)}
                             </span>
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
                         {[2023, 2024, 2025, 2026].map(y => <SelectItem key={y} value={y.toString()}>{y}</SelectItem>)}
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
                      <TableHead className="w-[150px]">সদস্য</TableHead>
                      {getFilteredMonths().map(m => (
                        <TableHead key={m.key} className="text-center min-w-[80px]">{m.monthName}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map(member => (
                      <TableRow key={member.id}>
                        <TableCell className="font-medium">
                           <div>{member.name}</div>
                           <div className="text-xs text-muted-foreground">{member.accountNumber}</div>
                        </TableCell>
                        {getFilteredMonths().map(m => {
                          const paid = member.contributions.find(c => c.month === m.month && c.year === m.year)
                          return (
                            <TableCell key={m.key} className="text-center p-2">
                              {paid ? (
                                <div className="bg-green-100 text-green-700 rounded text-xs py-1">৳{paid.amount}</div>
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
             <Card>
                <CardHeader><CardTitle>সারসংক্ষেপ শীঘ্রই আসছে</CardTitle></CardHeader>
                <CardContent className="text-muted-foreground">
                   আরো বিস্তারিত গ্রাফ এবং চার্ট পরবর্তী আপডেটে যুক্ত করা হবে।
                </CardContent>
             </Card>
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
    </div>
  )
}
