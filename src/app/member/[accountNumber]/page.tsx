"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Download, Calendar, DollarSign, User, Phone, Mail, MapPin } from "lucide-react"

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
  "01": "জানুয়ারি", "02": "ফেব্রুয়ারি", "03": "মার্চ", "04": "এপ্রিল",
  "05": "মে", "06": "জুন", "07": "জুলাই", "08": "আগস্ট",
  "09": "সেপ্টেম্বর", "10": "অক্টোবর", "11": "নভেম্বর", "12": "ডিসেম্বর"
}

export default function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatingPDF, setGeneratingPDF] = useState(false)
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

  const generatePDF = async () => {
    if (!member) return
    setGeneratingPDF(true)
    try {
      const printWindow = window.open('', '_blank')
      if (!printWindow) throw new Error('Unable to open print window')

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>হিসাব স্টেটমেন্ট - ${member.name}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@400;500;600;700&display=swap');
            body { font-family: 'Noto Sans Bengali', sans-serif; padding: 20px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .summary { margin-bottom: 30px; padding: 15px; background: #f9fafb; border-radius: 8px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
            th { background-color: #f3f4f6; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Friends Development Society (FDS)</h1>
            <h2>হিসাব স্টেটমেন্ট</h2>
          </div>
          <div class="summary">
            <p><strong>সদস্য:</strong> ${member.name} (${member.accountNumber})</p>
            <p><strong>মোট জমা:</strong> ৳${getTotalContributions().toFixed(2)}</p>
            <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
          </div>
          <table>
            <thead>
              <tr><th>মাস ও বছর</th><th>পরিমাণ</th><th>জমার তারিখ</th></tr>
            </thead>
            <tbody>
              ${member.contributions
                .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                .map(c => `
                <tr>
                  <td>${getMonthName(c.month)} ${c.year}</td>
                  <td>৳${c.amount.toFixed(2)}</td>
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
      setGeneratingPDF(false)
    }
  }

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>
  if (!member) return null

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b">
        <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
              {member.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-tight">{member.name}</h1>
              <p className="text-xs text-muted-foreground">AC: {member.accountNumber}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive">
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <DollarSign className="h-6 w-6 text-primary mb-2" />
                <div className="text-2xl font-bold text-primary">৳{getTotalContributions()}</div>
                <p className="text-xs text-muted-foreground">মোট জমা</p>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Calendar className="h-6 w-6 text-blue-600 mb-2" />
                <div className="text-2xl font-bold text-blue-600">৳{getCurrentYearContributions()}</div>
                <p className="text-xs text-muted-foreground">চলতি বছর</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Info & History Tabs */}
        <Tabs defaultValue="history" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="history">চাঁদার ইতিহাস</TabsTrigger>
            <TabsTrigger value="profile">প্রোফাইল</TabsTrigger>
          </TabsList>

          <TabsContent value="history" className="space-y-4">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={generatePDF} disabled={generatingPDF}>
                <Download className="mr-2 h-4 w-4" />
                {generatingPDF ? "তৈরি হচ্ছে..." : "স্টেটমেন্ট ডাউনলোড"}
              </Button>
            </div>

            <div className="space-y-3">
              {member.contributions.length > 0 ? (
                member.contributions
                  .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
                  .map((contribution, index) => (
                    <motion.div
                      key={contribution.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="flex items-center p-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {getMonthName(contribution.month)}
                              <Badge variant="secondary" className="text-xs font-normal">
                                {contribution.year}
                              </Badge>
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(contribution.paymentDate).toLocaleDateString("bn-BD")}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className="block text-lg font-bold text-green-600">
                              +৳{contribution.amount}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  কোন চাঁদা জমা দেওয়া হয়নি
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">নাম</p>
                    <p className="text-sm text-muted-foreground">{member.name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ফোন</p>
                    <p className="text-sm text-muted-foreground">{member.phone || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ইমেইল</p>
                    <p className="text-sm text-muted-foreground">{member.email || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">ঠিকানা</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{member.address || "N/A"}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
