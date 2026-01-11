"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, MessageCircle, Send, Image as ImageIcon, Smile, MoreVertical, X, ArrowLeft } from "lucide-react"
import EmojiPicker from 'emoji-picker-react'
import { toast } from "sonner"
import { Progress } from "@/components/ui/progress"
import { formatDistanceToNow } from "date-fns"
import { bn } from "date-fns/locale"

interface Post {
  id: string
  content: string
  image?: string
  author: {
    id: string
    name: string
    profileImage?: string
  }
  likes: Like[]
  comments: Comment[]
  createdAt: string
}

interface Like {
  id: string
  authorId: string
}

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    profileImage?: string
  }
  createdAt: string
}

interface Poll {
  id: string
  question: string
  options: PollOption[]
  votes: PollVote[]
  isActive: boolean
  createdAt: string
}

interface PollOption {
  id: string
  text: string
  votes: PollVote[]
}

interface PollVote {
  voterId: string
}

interface Member {
  id: string
  name: string
  profileImage?: string
}

export default function CommunityPage() {
  const params = useParams()
  const router = useRouter()
  const accountNumber = params.accountNumber as string
  const [member, setMember] = useState<Member | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [polls, setPolls] = useState<Poll[]>([])
  const [newPostContent, setNewPostContent] = useState("")
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isPosting, setIsPosting] = useState(false)
  const [activeTab, setActiveTab] = useState<"posts" | "polls">("posts")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchMember()
    fetchPosts()
    fetchPolls()
  }, [])

  const fetchMember = async () => {
    try {
      const res = await fetch(`/api/member/${accountNumber}`)
      if (res.ok) setMember(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchPosts = async () => {
    try {
      const res = await fetch("/api/community/posts")
      if (res.ok) setPosts(await res.json())
    } catch (e) { console.error(e) }
  }

  const fetchPolls = async () => {
    try {
      const res = await fetch("/api/community/polls")
      if (res.ok) setPolls(await res.json())
    } catch (e) { console.error(e) }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !selectedImage) return
    if (!member) return

    setIsPosting(true)
    try {
      const formData = new FormData()
      formData.append("content", newPostContent)
      formData.append("authorId", member.id)
      if (selectedImage) formData.append("image", selectedImage)

      const res = await fetch("/api/community/posts", {
        method: "POST",
        body: formData
      })

      if (res.ok) {
        setNewPostContent("")
        setSelectedImage(null)
        fetchPosts()
        toast.success("পোস্ট করা হয়েছে")
      } else {
        toast.error("পোস্ট করতে ব্যর্থ হয়েছে")
      }
    } catch (e) {
      toast.error("নেটওয়ার্ক ত্রুটি")
    } finally {
      setIsPosting(false)
    }
  }

  const handleLike = async (postId: string) => {
    if (!member) return
    try {
      const res = await fetch(`/api/community/posts/${postId}/like`, {
        method: "POST",
        body: JSON.stringify({ authorId: member.id })
      })
      if (res.ok) fetchPosts()
    } catch (e) { console.error(e) }
  }

  const handleComment = async (postId: string, content: string) => {
    if (!member) return
    try {
      const res = await fetch(`/api/community/posts/${postId}/comment`, {
        method: "POST",
        body: JSON.stringify({ content, authorId: member.id })
      })
      if (res.ok) fetchPosts()
    } catch (e) { console.error(e) }
  }

  const handleVote = async (pollId: string, optionId: string) => {
    if (!member) return
    try {
      const res = await fetch(`/api/community/polls/${pollId}/vote`, {
        method: "POST",
        body: JSON.stringify({ voterId: member.id, optionId })
      })
      if (res.ok) {
        toast.success("ভোট দেওয়া হয়েছে")
        fetchPolls()
      } else {
        const data = await res.json()
        toast.error(data.error || "ভোট দিতে ব্যর্থ")
      }
    } catch (e) { toast.error("নেটওয়ার্ক ত্রুটি") }
  }

  const onEmojiClick = (emojiObject: any) => {
    setNewPostContent(prev => prev + emojiObject.emoji)
    setShowEmojiPicker(false)
  }

  // Get the latest active poll
  const latestActivePoll = polls.filter(p => p.isActive).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]

  return (
    <div className="min-h-screen bg-muted/20">
        <div className="sticky top-0 bg-background/95 backdrop-blur z-20 border-b">
           <div className="max-w-2xl mx-auto p-4 flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => router.push(`/member/${accountNumber}`)}>
                 <ArrowLeft className="h-5 w-5" />
              </Button>
              <h1 className="font-bold text-lg">কমিউনিটি</h1>
           </div>
           <div className="max-w-2xl mx-auto px-4 flex gap-4 pb-2">
                <Button
                variant={activeTab === "posts" ? "default" : "ghost"}
                onClick={() => setActiveTab("posts")}
                className="flex-1 rounded-full"
                size="sm"
                >
                পোস্ট
                </Button>
                <Button
                variant={activeTab === "polls" ? "default" : "ghost"}
                onClick={() => setActiveTab("polls")}
                className="flex-1 rounded-full"
                size="sm"
                >
                পোলস ({polls.length})
                </Button>
            </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
            {activeTab === "posts" && (
                <>
                {/* Active Poll Teaser */}
                {latestActivePoll && (
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-bold text-primary px-2 py-0.5 bg-primary/10 rounded-full">HOT TOPIC</span>
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setActiveTab("polls")}>
                                সকল পোল দেখুন
                            </Button>
                        </div>
                        <PollCard
                            poll={latestActivePoll}
                            currentUserId={member?.id}
                            onVote={(optionId) => handleVote(latestActivePoll.id, optionId)}
                            compact={true}
                        />
                    </div>
                )}

                {/* Create Post */}
                <Card>
                    <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <Avatar>
                        <AvatarImage src={member?.profileImage} />
                        <AvatarFallback>{member?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-4">
                        <Textarea
                            placeholder="আপনার মনে কি আছে?"
                            value={newPostContent}
                            onChange={(e) => setNewPostContent(e.target.value)}
                            className="min-h-[100px] bg-transparent border-none focus-visible:ring-0 resize-none p-0 placeholder:text-muted-foreground/70"
                        />
                        {selectedImage && (
                            <div className="relative w-fit">
                            <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="max-h-60 rounded-lg object-cover" />
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1 hover:bg-black/70 transition"
                            >
                                <X size={14} />
                            </button>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t">
                            <div className="flex gap-1 relative">
                            <input
                                type="file"
                                accept="image/*"
                                hidden
                                ref={fileInputRef}
                                onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                            />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => fileInputRef.current?.click()}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                            >
                                <Smile className="h-5 w-5" />
                            </Button>
                            {showEmojiPicker && (
                                <div className="absolute top-10 left-0 z-50 shadow-xl rounded-xl overflow-hidden">
                                <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                                </div>
                            )}
                            </div>
                            <Button onClick={handleCreatePost} disabled={isPosting} size="sm" className="rounded-full px-6">
                            {isPosting ? "পোস্ট হচ্ছে..." : "পোস্ট করুন"}
                            </Button>
                        </div>
                        </div>
                    </div>
                    </CardContent>
                </Card>

                {/* Feed */}
                <div className="space-y-4">
                    {posts.map(post => (
                    <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={member?.id}
                        onLike={() => handleLike(post.id)}
                        onComment={(content) => handleComment(post.id, content)}
                    />
                    ))}
                </div>
                </>
            )}

            {activeTab === "polls" && (
                <div className="space-y-4">
                {polls.map(poll => (
                    <PollCard
                    key={poll.id}
                    poll={poll}
                    currentUserId={member?.id}
                    onVote={(optionId) => handleVote(poll.id, optionId)}
                    />
                ))}
                {polls.length === 0 && <div className="text-center py-10 text-muted-foreground">কোনো পোল নেই</div>}
                </div>
            )}
        </div>
    </div>
  )
}

function PostCard({ post, currentUserId, onLike, onComment }: { post: Post, currentUserId?: string, onLike: () => void, onComment: (c: string) => void }) {
  const [commentText, setCommentText] = useState("")
  const isLiked = post.likes.some(l => l.authorId === currentUserId)

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
        <Avatar>
          <AvatarImage src={post.author.profileImage} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-sm font-semibold">{post.author.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{post.content}</p>
        {post.image && (
          <div className="rounded-xl overflow-hidden bg-muted">
              <img src={post.image} alt="Post content" className="w-full max-h-[500px] object-cover" />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-0 p-0">
        <div className="flex items-center w-full border-t border-b px-2">
          <Button
             variant="ghost"
             className={`flex-1 gap-2 rounded-none h-10 ${isLiked ? "text-red-500" : "text-muted-foreground"}`}
             onClick={onLike}
          >
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            <span className="text-sm">{post.likes.length}</span>
          </Button>
          <div className="w-px h-6 bg-border" />
          <Button variant="ghost" className="flex-1 gap-2 rounded-none h-10 text-muted-foreground">
            <MessageCircle className="h-5 w-5" />
            <span className="text-sm">{post.comments.length}</span>
          </Button>
        </div>

        {/* Comments */}
        <div className="w-full space-y-3 p-4 bg-muted/30">
          {post.comments.length > 0 && (
            <div className="space-y-3 mb-3">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-2 text-sm group">
                  <Avatar className="h-6 w-6 mt-0.5">
                    <AvatarImage src={comment.author.profileImage} />
                    <AvatarFallback className="text-[10px]">{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                     <div className="bg-background border rounded-2xl px-3 py-2 inline-block">
                        <span className="font-semibold text-xs block mb-0.5">{comment.author.name}</span>
                        <span className="text-sm">{comment.content}</span>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
             <Avatar className="h-8 w-8">
                 <AvatarFallback>?</AvatarFallback>
             </Avatar>
            <div className="flex-1 relative">
               <Input
                placeholder="কমেন্ট করুন..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => {
                    if(e.key === 'Enter' && commentText.trim()) {
                    onComment(commentText)
                    setCommentText("")
                    }
                }}
                className="rounded-full pr-10 h-9"
                />
                <Button
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 rounded-full"
                    variant="ghost"
                    onClick={() => {
                    if(commentText.trim()) {
                        onComment(commentText)
                        setCommentText("")
                    }
                    }}
                >
                <Send className="h-4 w-4 text-primary" />
                </Button>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

function PollCard({ poll, currentUserId, onVote, compact = false }: { poll: Poll, currentUserId?: string, onVote: (id: string) => void, compact?: boolean }) {
  const totalVotes = poll.votes.length
  const hasVoted = poll.votes.some(v => v.voterId === currentUserId)
  const isExpired = !poll.isActive

  return (
    <Card className={compact ? "shadow-none border-none bg-transparent" : ""}>
      <CardHeader className={compact ? "p-0 mb-4" : ""}>
        <CardTitle className={compact ? "text-base" : ""}>{poll.question}</CardTitle>
        {!compact && (
             <div className="flex gap-2 mt-1">
                 <span className="text-sm text-muted-foreground">{totalVotes} ভোট</span>
                 {isExpired && <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">সমাপ্ত</span>}
             </div>
        )}
      </CardHeader>
      <CardContent className={`space-y-3 ${compact ? "p-0" : ""}`}>
        {poll.options.map(option => {
          const voteCount = option.votes.length
          const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100)
          const isLeading = percentage > 0 && percentage === Math.max(...poll.options.map(o => {
              const vc = o.votes.length
              return totalVotes === 0 ? 0 : Math.round((vc / totalVotes) * 100)
          }))

          return (
            <div key={option.id} className="space-y-1">
              <button
                className={`w-full text-left group relative overflow-hidden rounded-lg border transition-all ${hasVoted || isExpired ? "cursor-default" : "hover:border-primary/50"}`}
                onClick={() => !hasVoted && !isExpired && onVote(option.id)}
                disabled={hasVoted || isExpired}
              >
                 {/* Progress Bar Background */}
                 <div
                    className={`absolute inset-y-0 left-0 bg-primary/10 transition-all duration-500 ${isLeading && (hasVoted || isExpired) ? "bg-green-500/10" : ""}`}
                    style={{ width: `${percentage}%` }}
                 />

                 <div className="relative p-3 flex justify-between items-center z-10">
                    <span className="font-medium text-sm">{option.text}</span>
                    {(hasVoted || isExpired) && <span className="font-bold text-sm">{percentage}%</span>}
                 </div>
              </button>
            </div>
          )
        })}
        {!compact && hasVoted && <p className="text-xs text-center text-green-600 mt-2">আপনি ভোট দিয়েছেন</p>}
        {compact && (
             <div className="flex justify-between items-center mt-2 text-xs text-muted-foreground">
                 <span>{totalVotes} জন ভোট দিয়েছেন</span>
                 {hasVoted ? <span className="text-green-600">ভোট সম্পন্ন</span> : <span className="text-primary">ভোট দিন</span>}
             </div>
        )}
      </CardContent>
    </Card>
  )
}
