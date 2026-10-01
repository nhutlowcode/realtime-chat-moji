import { useAuthStore } from '@/stores/useAuthStore'
import type { Conversation } from '@/types/chat'
import { useState } from 'react'
import { Button } from '../ui/button'
import { ImagePlus, Send } from 'lucide-react'
import { Input } from '../ui/input'
import EmojiPicker from './EmojiPicker'
import { useChatStore } from '@/stores/useChatStore'
import { toast } from 'sonner'

const MessageInput = ({ selectedConvo }: { selectedConvo: Conversation }) => {
  const { user } = useAuthStore()
  const { sendDirectMessage, sendGroupMessage } = useChatStore()
  const [value, setValue] = useState('')

  // hàm xử lí gửi tin nhắn
  const sendMessage = async () => {
    console.log(selectedConvo.type)
    if (!value.trim()) return
    const currentValue = value
    setValue('')
    try {
      if (selectedConvo.type === 'direct') {
        // const otherUser = selectedConvo.participants.find(
        //   (p) => p._id !== user?._id,
        // )
        const participants = selectedConvo.participants
        const otherUser = participants.filter((c) => c._id !== user?._id)[0]
        console.log('otherUser sendDirectMessage: ', otherUser._id)
        await sendDirectMessage(otherUser?._id, currentValue)
      } else {
        await sendGroupMessage(selectedConvo._id, currentValue)
      }
    } catch (error) {
      console.error(error)
      toast.error('Lỗi xảy ra khi gửi tin nhắn. Bạn hãy thử lại xem nhé!')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault() // ngăn chặn hành vi phụ để đảm bảo chỉ chạy hàm sendsendMessage()
      sendMessage()
    }
  }

  return (
    <div className="flex items-center gap-2 p-3 min-h-[56px] bg-background">
      {/* nút thêm ảnh */}
      <Button
        variant="ghost"
        size="icon"
        className="hover:bg-primary/10 transition-smooth"
      >
        <ImagePlus className="size-4" />
      </Button>

      {/* ô soạn tin nhắn */}
      <div className="flex-1 relative">
        <Input
          onKeyDown={handleKeyPress}
          className="pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Soạn tin nhắn..."
        ></Input>
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          <Button
            asChild
            variant="ghost"
            size="icon"
            className="size-8 hover:bg-primary/10 transition-smooth"
          >
            <div>
              <EmojiPicker
                onEmojiChange={(emoji: string) => setValue(`${value}${emoji}`)}
                // EmojiPicker nhận vào tham số là (emoji: string) => setValue(`${value}${emoji}`)
              />
            </div>
          </Button>
        </div>
      </div>

      {/* nút gửi tin nhắn */}
      <Button
        onClick={sendMessage}
        className="bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105"
        disabled={!value}
      >
        <Send className="size-4 text-white" />
      </Button>
    </div>
  )
}

export default MessageInput
