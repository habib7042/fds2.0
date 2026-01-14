"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LogOut, Download, Calendar, DollarSign, User, Phone, Mail, MapPin, Edit, FileText, Heart, UserPlus, Image as ImageIcon, MessageSquare, Bell, Lock, CheckCircle2 } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Keypad } from "@/components/ui/keypad"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Adjustment {
  id: string
  type: string
  amount: number
  date: string
  description?: string
}

interface FundAdjustment {
  id: string
  type: string
  amount: number
  date: string
  description?: string
}

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
  adjustments: Adjustment[]
  fundAdjustments: FundAdjustment[]
  memberCount: number
  isVerified?: boolean
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

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function MemberDashboard() {
  const [member, setMember] = useState<Member | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [generatingPDF, setGeneratingPDF] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isChangingPin, setIsChangingPin] = useState(false)
  const [newPin, setNewPin] = useState("")
  const [saving, setSaving] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const params = useParams()
  const router = useRouter()
  const accountNumber = params.accountNumber as string

  // Form state
  const [formData, setFormData] = useState<Partial<Member>>({})
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null)
  const [nomineeImageFile, setNomineeImageFile] = useState<File | null>(null)

  useEffect(() => {
    fetchMemberData()
  }, [accountNumber])

  useEffect(() => {
    if (member) {
      setFormData({
        dob: member.dob || "",
        nid: member.nid || "",
        fatherName: member.fatherName || "",
        motherName: member.motherName || "",
        maritalStatus: member.maritalStatus || "",
        nomineeName: member.nomineeName || "",
        nomineeNid: member.nomineeNid || "",
        nomineeRelation: member.nomineeRelation || "",
        phone: member.phone || "",
        email: member.email || "",
        address: member.address || "",
      })
    }
  }, [member])

  useEffect(() => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      navigator.serviceWorker.ready.then(async (registration) => {
        const sub = await registration.pushManager.getSubscription()
        setIsSubscribed(!!sub)
      })
    }
  }, [])

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

  const handleSubscribe = async () => {
    if (!member) return
    if (!('serviceWorker' in navigator)) return

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
          console.error("VAPID Public Key not found")
          toast.error("Push notifications not configured")
          return
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      })

      await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subscription, memberId: member.id })
      })

      setIsSubscribed(true)
      toast.success("Notifications enabled!")
    } catch (err) {
      console.error("Subscription failed", err)
      toast.error("Failed to enable notifications")
    }
  }

  const handleChangePin = async () => {
     if (!newPin || newPin.length < 4) {
        toast.error("পিন অন্তত ৪ ডিজিট হতে হবে")
        return
     }

     try {
        const res = await fetch(`/api/member/${accountNumber}`, {
           method: "PATCH",
           headers: { "Content-Type": "application/json" },
           body: JSON.stringify({ pin: newPin })
        })
        if (res.ok) {
           toast.success("পিন পরিবর্তন সফল হয়েছে")
           setIsChangingPin(false)
           setNewPin("")
        } else {
           toast.error("পিন পরিবর্তন ব্যর্থ হয়েছে")
        }
     } catch (e) {
        toast.error("ত্রুটি হয়েছে")
     }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const data = new FormData()

      // Append text fields
      Object.keys(formData).forEach(key => {
        const value = formData[key as keyof Member]
        if (value) {
          data.append(key, value as string)
        }
      })

      // Append files
      if (profileImageFile) {
        data.append("profileImage", profileImageFile)
      }
      if (nomineeImageFile) {
        data.append("nomineeImage", nomineeImageFile)
      }

      const response = await fetch(`/api/member/${accountNumber}`, {
        method: "PATCH",
        body: data,
      })

      if (response.ok) {
        const updatedMember = await response.json()
        setMember((prev) => prev ? { ...prev, ...updatedMember } : null)
        setIsEditing(false)
        setProfileImageFile(null)
        setNomineeImageFile(null)
        toast.success("প্রোফাইল আপডেট সফল হয়েছে")
      } else {
        toast.error("প্রোফাইল আপডেট ব্যর্থ হয়েছে")
      }
    } catch (error) {
      toast.error("নেটওয়ার্ক ত্রুটি হয়েছে")
    } finally {
      setSaving(false)
    }
  }

  const getMonthName = (month: string) => {
    return monthNames[month as keyof typeof monthNames] || month
  }

  const getTotalBalance = () => {
    if (!member) return 0
    const contributions = member.contributions.reduce((sum, c) => sum + c.amount, 0)

    // Personal Adjustments
    const personalInterests = member.adjustments?.filter(a => a.type === 'INTEREST').reduce((sum, a) => sum + a.amount, 0) || 0
    const personalCharges = member.adjustments?.filter(a => a.type === 'CHARGE').reduce((sum, a) => sum + a.amount, 0) || 0

    // Global Adjustments (Share)
    const memberCount = Math.max(1, member.memberCount)
    const globalInterests = member.fundAdjustments?.filter(a => a.type === 'INTEREST').reduce((sum, a) => sum + (a.amount / memberCount), 0) || 0
    const globalCharges = member.fundAdjustments?.filter(a => a.type === 'CHARGE').reduce((sum, a) => sum + (a.amount / memberCount), 0) || 0

    return contributions + personalInterests - personalCharges + globalInterests - globalCharges
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
            <p><strong>মোট জমা:</strong> ৳${getTotalBalance().toFixed(2)}</p>
            <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString('bn-BD')}</p>
          </div>
          <table>
            <thead>
              <tr><th>বিবরণ</th><th>পরিমাণ</th><th>তারিখ</th></tr>
            </thead>
            <tbody>
              ${member.contributions
                .map(c => ({
                    date: new Date(c.paymentDate),
                    desc: `${getMonthName(c.month)} ${c.year} চাঁদা`,
                    amount: c.amount,
                    type: 'deposit'
                }))
                .concat(member.adjustments?.map(a => ({
                    date: new Date(a.date),
                    desc: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা' : 'ব্যাংক চার্জ',
                    amount: a.type === 'CHARGE' ? -a.amount : a.amount,
                    type: a.type
                })) || [])
                .concat(member.fundAdjustments?.map(a => ({
                    date: new Date(a.date),
                    desc: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা (শেয়ার)' : 'ব্যাংক চার্জ (শেয়ার)',
                    amount: a.type === 'CHARGE' ? -(a.amount / Math.max(1, member.memberCount)) : (a.amount / Math.max(1, member.memberCount)),
                    type: a.type
                })) || [])
                .sort((a, b) => b.date.getTime() - a.date.getTime())
                .map(item => `
                <tr>
                  <td>${item.desc}</td>
                  <td style="color: ${item.amount < 0 ? 'red' : 'green'}">৳${Math.abs(item.amount).toFixed(2)}</td>
                  <td>${item.date.toLocaleDateString('bn-BD')}</td>
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
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-primary">
              <AvatarImage src={member.profileImage} alt={member.name} />
              <AvatarFallback className="bg-primary text-primary-foreground font-bold">
                {member.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1">
                <h1 className="text-sm font-semibold leading-tight">{member.name}</h1>
                {member.isVerified && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <CheckCircle2 className="h-4 w-4 text-blue-500 fill-blue-500 text-white" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>যাচাইকৃত সদস্য</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              <p className="text-xs text-muted-foreground">AC: {member.accountNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isSubscribed && (
                <Button variant="ghost" size="icon" onClick={handleSubscribe} className="text-primary">
                    <Bell className="h-5 w-5" />
                </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex gap-2"
              onClick={() => router.push(`/member/${accountNumber}/community`)}
            >
              <MessageSquare className="h-4 w-4" /> কমিউনিটি
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => router.push(`/member/${accountNumber}/community`)}
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-destructive">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
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
                <div className="text-2xl font-bold text-primary">৳{getTotalBalance().toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">বর্তমান স্থিতি</p>
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
            <TabsTrigger value="history">লেনদেন ইতিহাস</TabsTrigger>
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
              {/* Merge Contributions and Adjustments */}
              {(() => {
                  const allItems = [
                      ...member.contributions.map(c => ({
                          id: c.id,
                          type: 'CONTRIBUTION',
                          amount: c.amount,
                          date: c.paymentDate,
                          title: `${getMonthName(c.month)} ${c.year}`,
                          subtitle: 'মাসিক চাঁদা'
                      })),
                      ...(member.adjustments || []).map(a => ({
                          id: a.id,
                          type: a.type,
                          amount: a.amount,
                          date: a.date,
                          title: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা' : 'ব্যাংক চার্জ',
                          subtitle: a.description || ''
                      })),
                      ...(member.fundAdjustments || []).map(a => ({
                          id: a.id,
                          type: a.type,
                          amount: a.amount / Math.max(1, member.memberCount),
                          date: a.date,
                          title: a.type === 'INTEREST' ? 'ব্যাংক মুনাফা (শেয়ার)' : 'ব্যাংক চার্জ (শেয়ার)',
                          subtitle: a.description || ''
                      }))
                  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                  if (allItems.length === 0) {
                      return (
                        <div className="text-center py-10 text-muted-foreground">
                          কোন লেনদেন নেই
                        </div>
                      )
                  }

                  return allItems.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card className="overflow-hidden">
                        <div className="flex items-center p-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              {item.title}
                              {item.type === 'CONTRIBUTION' && <Badge variant="secondary" className="text-xs font-normal">Paid</Badge>}
                            </h3>
                            <p className="text-xs text-muted-foreground flex items-center mt-1">
                              <Calendar className="h-3 w-3 mr-1" />
                              {new Date(item.date).toLocaleDateString("bn-BD")}
                              {item.subtitle && <span className="ml-2">• {item.subtitle}</span>}
                            </p>
                          </div>
                          <div className="text-right">
                            <span className={`block text-lg font-bold ${item.type === 'CHARGE' ? 'text-red-600' : 'text-green-600'}`}>
                              {item.type === 'CHARGE' ? '-' : '+'}৳{item.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))
              })()}
            </div>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>ব্যক্তিগত তথ্য</CardTitle>
                <div className="flex gap-2">
                  <Dialog open={isChangingPin} onOpenChange={setIsChangingPin}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Lock className="h-4 w-4 mr-2" /> পিন পরিবর্তন
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>পিন পরিবর্তন করুন</DialogTitle>
                        <DialogDescription>আপনার একাউন্টের নিরাপত্তা নিশ্চিত করতে নতুন পিন সেট করুন।</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label>নতুন পিন</Label>
                          <Input
                            type="password"
                            value={newPin}
                            readOnly
                            placeholder="****"
                            className="text-center text-xl tracking-widest h-12"
                          />
                        </div>
                        <Keypad
                          onInput={(n) => { if (newPin.length < 6) setNewPin(p => p + n) }}
                          onDelete={() => setNewPin(p => p.slice(0, -1))}
                        />
                      </div>
                      <DialogFooter>
                        <Button onClick={handleChangePin}>পরিবর্তন করুন</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isEditing} onOpenChange={setIsEditing}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4 mr-2" /> এডিট করুন
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-h-[85vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle>প্রোফাইল এডিট করুন</DialogTitle>
                        <DialogDescription>
                          আপনার তথ্যে পরিবর্তন এনে সংরক্ষণ করুন।
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleUpdateProfile} className="space-y-4 py-4">
                        {/* Photo Uploads */}
                        <div className="grid grid-cols-2 gap-4 border-b pb-4">
                          <div className="space-y-2">
                              <Label htmlFor="profileImage">আপনার ছবি</Label>
                              <Input
                                  id="profileImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setProfileImageFile(e.target.files?.[0] || null)}
                              />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="nomineeImage">নমিনির ছবি</Label>
                              <Input
                                  id="nomineeImage"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => setNomineeImageFile(e.target.files?.[0] || null)}
                              />
                          </div>
                        </div>

                        {/* Basic Info */}
                        <div className="space-y-2">
                          <Label htmlFor="phone">মোবাইল নম্বর</Label>
                          <Input id="phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">ইমেইল</Label>
                          <Input id="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="address">ঠিকানা</Label>
                          <Textarea id="address" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                              <Label htmlFor="dob">জন্মতারিখ</Label>
                              <Input id="dob" type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                          </div>
                          <div className="space-y-2">
                              <Label htmlFor="maritalStatus">বৈবাহিক অবস্থা</Label>
                              <Select value={formData.maritalStatus} onValueChange={(v) => setFormData({...formData, maritalStatus: v})}>
                                <SelectTrigger><SelectValue placeholder="নির্বাচন করুন" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="married">বিবাহিত</SelectItem>
                                    <SelectItem value="unmarried">অবিবাহিত</SelectItem>
                                </SelectContent>
                              </Select>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nid">জাতীয় পরিচয়পত্র/জন্ম নিবন্ধন নম্বর</Label>
                          <Input id="nid" value={formData.nid} onChange={(e) => setFormData({...formData, nid: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="fatherName">বাবার নাম</Label>
                          <Input id="fatherName" value={formData.fatherName} onChange={(e) => setFormData({...formData, fatherName: e.target.value})} />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="motherName">মায়ের নাম</Label>
                          <Input id="motherName" value={formData.motherName} onChange={(e) => setFormData({...formData, motherName: e.target.value})} />
                        </div>

                        <div className="border-t pt-4 mt-4">
                          <h4 className="font-semibold mb-3">নমিনির তথ্য</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="nomineeName">নমিনির নাম</Label>
                                <Input id="nomineeName" value={formData.nomineeName} onChange={(e) => setFormData({...formData, nomineeName: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomineeRelation">সম্পর্ক</Label>
                                <Input id="nomineeRelation" value={formData.nomineeRelation} onChange={(e) => setFormData({...formData, nomineeRelation: e.target.value})} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="nomineeNid">নমিনির এনআইডি/জন্ম নিবন্ধন</Label>
                                <Input id="nomineeNid" value={formData.nomineeNid} onChange={(e) => setFormData({...formData, nomineeNid: e.target.value})} />
                            </div>
                          </div>
                        </div>

                        <DialogFooter>
                          <Button type="submit" disabled={saving}>
                            {saving ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">

                {/* Profile Image Display */}
                <div className="flex justify-center mb-6">
                   <div className="flex flex-col items-center gap-2">
                      <div className="h-32 w-32 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center relative">
                         {member.profileImage ? (
                            <img src={member.profileImage} alt="Profile" className="h-full w-full object-cover" />
                         ) : (
                            <User className="h-16 w-16 text-muted-foreground" />
                         )}
                      </div>
                      <Badge variant="outline">আপনার ছবি</Badge>
                   </div>
                </div>

                <div className="grid gap-1">
                  <p className="text-sm font-medium leading-none">নাম</p>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-muted-foreground">{member.name}</p>
                    {member.isVerified && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100">
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">একাউন্ট নম্বর</p>
                   <p className="text-sm text-muted-foreground">{member.accountNumber}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">ফোন</p>
                   <p className="text-sm text-muted-foreground">{member.phone || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">ইমেইল</p>
                   <p className="text-sm text-muted-foreground">{member.email || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">ঠিকানা</p>
                   <p className="text-sm text-muted-foreground whitespace-pre-wrap">{member.address || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">জন্মতারিখ</p>
                   <p className="text-sm text-muted-foreground">{member.dob || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">এনআইডি/জন্ম নিবন্ধন</p>
                   <p className="text-sm text-muted-foreground">{member.nid || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">বাবার নাম</p>
                   <p className="text-sm text-muted-foreground">{member.fatherName || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">মায়ের নাম</p>
                   <p className="text-sm text-muted-foreground">{member.motherName || "তথ্য নেই"}</p>
                </div>
                <div className="grid gap-1">
                   <p className="text-sm font-medium leading-none">বৈবাহিক অবস্থা</p>
                   <p className="text-sm text-muted-foreground">
                      {member.maritalStatus === "married" ? "বিবাহিত" : member.maritalStatus === "unmarried" ? "অবিবাহিত" : "তথ্য নেই"}
                   </p>
                </div>

                <div className="border-t pt-4 mt-4">
                   <h4 className="font-semibold mb-4">নমিনির তথ্য</h4>

                   {/* Nominee Image Display */}
                   <div className="flex justify-start mb-6">
                      <div className="flex flex-col items-center gap-2">
                         <div className="h-24 w-24 rounded-full border-4 border-muted overflow-hidden bg-muted flex items-center justify-center relative">
                            {member.nomineeImage ? (
                               <img src={member.nomineeImage} alt="Nominee" className="h-full w-full object-cover" />
                            ) : (
                               <User className="h-10 w-10 text-muted-foreground" />
                            )}
                         </div>
                         <Badge variant="outline">নমিনির ছবি</Badge>
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-1">
                         <p className="text-sm font-medium leading-none">নাম</p>
                         <p className="text-sm text-muted-foreground">{member.nomineeName || "তথ্য নেই"}</p>
                      </div>
                      <div className="grid gap-1">
                         <p className="text-sm font-medium leading-none">সম্পর্ক</p>
                         <p className="text-sm text-muted-foreground">{member.nomineeRelation || "তথ্য নেই"}</p>
                      </div>
                      <div className="grid gap-1 col-span-2">
                         <p className="text-sm font-medium leading-none">এনআইডি/জন্ম নিবন্ধন</p>
                         <p className="text-sm text-muted-foreground">{member.nomineeNid || "তথ্য নেই"}</p>
                      </div>
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
