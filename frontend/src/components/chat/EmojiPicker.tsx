import { useThemeStore } from '@/stores/useThemeStore'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'
import { Smile } from 'lucide-react'
import Picker from '@emoji-mart/react'
import data from '@emoji-mart/data'

interface EmojiPickerProps {
  onEmojiChange: (value: string) => void
}

const EmojiPicker = ({ onEmojiChange }: EmojiPickerProps) => {
  const { isDark } = useThemeStore()
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer">
        <Smile className="size-4" />
      </PopoverTrigger>
      <PopoverContent
        side="right"
        sideOffset={40}
        className="bg-transparent border-none shadow-none drop-shadow-none mb-12"
      >
        <Picker
          theme={isDark ? 'dark' : 'light'}
          data={data}
          onEmojiSelect={(emoji: any) => onEmojiChange(emoji.native)}
          // onEmojiChange và onEmojiChange() là hai kiểu khác nhau
          // onEmojiChange là lấy function ra, onEmojiChange("...") là gọi func đó chạy với giá trị nào đó
          emojiSize={24}
        />
      </PopoverContent>
    </Popover>
  )
}

export default EmojiPicker
