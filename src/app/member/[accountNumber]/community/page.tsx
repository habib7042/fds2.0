"use client"

import { useEffect, useState, useRef } from "react"
import { useParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, MessageCircle, Send, Image as ImageIcon, Smile, MoreVertical, X } from "lucide-react"
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

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6 pb-20">
      <div className="flex gap-4 sticky top-0 bg-background/95 backdrop-blur z-10 py-2">
        <Button
          variant={activeTab === "posts" ? "default" : "outline"}
          onClick={() => setActiveTab("posts")}
          className="flex-1"
        >
          কমিউনিটি
        </Button>
        <Button
          variant={activeTab === "polls" ? "default" : "outline"}
          onClick={() => setActiveTab("polls")}
          className="flex-1"
        >
          পোলস ({polls.length})
        </Button>
      </div>

      {activeTab === "posts" && (
        <>
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
                    className="min-h-[100px]"
                  />
                  {selectedImage && (
                    <div className="relative w-fit">
                      <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="max-h-40 rounded-md" />
                      <button
                        onClick={() => setSelectedImage(null)}
                        className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2 relative">
                      <input
                        type="file"
                        accept="image/*"
                        hidden
                        ref={fileInputRef}
                        onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                      />
                      <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()}>
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setShowEmojiPicker(!showEmojiPicker)}>
                        <Smile className="h-5 w-5 text-muted-foreground" />
                      </Button>
                      {showEmojiPicker && (
                        <div className="absolute top-10 left-0 z-50">
                          <EmojiPicker onEmojiClick={onEmojiClick} />
                        </div>
                      )}
                    </div>
                    <Button onClick={handleCreatePost} disabled={isPosting}>
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
          {polls.length === 0 && <div className="text-center text-muted-foreground">কোনো পোল নেই</div>}
        </div>
      )}
    </div>
  )
}

function PostCard({ post, currentUserId, onLike, onComment }: { post: Post, currentUserId?: string, onLike: () => void, onComment: (c: string) => void }) {
  const [commentText, setCommentText] = useState("")
  const isLiked = post.likes.some(l => l.authorId === currentUserId)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={post.author.profileImage} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <CardTitle className="text-base">{post.author.name}</CardTitle>
          <p className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: bn })}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="whitespace-pre-wrap">{post.content}</p>
        {post.image && (
          <img src={post.image} alt="Post content" className="rounded-md w-full max-h-[400px] object-cover" />
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        <div className="flex gap-4 w-full">
          <Button variant="ghost" className={`gap-2 ${isLiked ? "text-red-500" : ""}`} onClick={onLike}>
            <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
            {post.likes.length}
          </Button>
          <Button variant="ghost" className="gap-2">
            <MessageCircle className="h-5 w-5" />
            {post.comments.length}
          </Button>
        </div>

        {/* Comments */}
        <div className="w-full space-y-4 pt-4 border-t">
          {post.comments.length > 0 && (
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
              {post.comments.map(comment => (
                <div key={comment.id} className="flex gap-3 text-sm">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={comment.author.profileImage} />
                    <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="bg-muted p-3 rounded-lg flex-1">
                    <p className="font-semibold text-xs">{comment.author.name}</p>
                    <p>{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <Input
              placeholder="কমেন্ট লিখুন..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => {
                if(e.key === 'Enter' && commentText.trim()) {
                  onComment(commentText)
                  setCommentText("")
                }
              }}
            />
            <Button size="icon" onClick={() => {
              if(commentText.trim()) {
                onComment(commentText)
                setCommentText("")
              }
            }}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}

function PollCard({ poll, currentUserId, onVote }: { poll: Poll, currentUserId?: string, onVote: (id: string) => void }) {
  const totalVotes = poll.votes.length
  const hasVoted = poll.votes.some(v => v.voterId === currentUserId)

  return (
    <Card>
      <CardHeader>
        <CardTitle>{poll.question}</CardTitle>
        <p className="text-sm text-muted-foreground">{totalVotes} ভোট</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.options.map(option => {
          const voteCount = option.votes.length
          const percentage = totalVotes === 0 ? 0 : Math.round((voteCount / totalVotes) * 100)

          return (
            <div key={option.id} className="space-y-2">
              <button
                className="w-full text-left group"
                onClick={() => !hasVoted && onVote(option.id)}
                disabled={hasVoted}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span>{option.text}</span>
                  <span>{percentage}%</span>
                </div>
                <Progress value={percentage} className="h-2" />
              </button>
            </div>
          )
        })}
        {hasVoted && <p className="text-xs text-center text-green-600 mt-2">আপনি ভোট দিয়েছেন</p>}
      </CardContent>
    </Card>
  )
}
