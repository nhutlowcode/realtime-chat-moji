import { useChatStore } from '@/stores/useChatStore'
import GroupChatCard from './GroupChatCard'

function GroupChatList() {
  const { conversations } = useChatStore()
  if (!conversations) return
  const groupChats = conversations.filter((convo) => convo.type === 'group')
  return (
    <div className="flex-1 overflow-y-auto space-y-2 p-2">
      {groupChats.map((convo) => (
        <GroupChatCard key={convo._id} convo={convo} />
      ))}
    </div>
  )
}

export default GroupChatList
