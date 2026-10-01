import type { Conversation } from '@/types/chat'
import ChatCard from './ChatCard'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChatStore } from '@/stores/useChatStore'
import { cn } from '@/lib/utils'
import UserAvatar from './UserAvatar'
import StatusBadge from './StatusBadge'
import UnreadCountBadge from './UnreadCountBadge'
import { useSocketStore } from '@/stores/useSocketStore'

function DicrectMessageCard({ convo }: { convo: Conversation }) {
  const { user } = useAuthStore()
  const {
    activeConversationId,
    setActiveConversation,
    messages,
    fetchMessages,
  } = useChatStore()
  const { onlineUsers } = useSocketStore()

  if (!user) return null
  const otherUser = convo.participants.find((p) => p._id !== user?._id)
  if (!otherUser) return null

  const unreadCount = convo.unreadCounts[user._id]

  const lastMessage = convo.lastMessage?.content ?? ''

  // console.log('lastMessage ở DicrectMessageCard: ', lastMessage)

  const handleSelectConversation = async (id: string) => {
    setActiveConversation(id)
    // nếu không có cuộc trò chuyện này trong messages thì sẽ gọi hàm fetchMess
    if (!messages[id]) {
      await fetchMessages(id)
    }
  }

  return (
    <div>
      <ChatCard
        convoId={convo._id}
        name={otherUser.displayName ?? ''}
        timestamp={
          convo.lastMessage?.createdAt
            ? new Date(convo.lastMessage.createdAt)
            : undefined
        }
        isActive={activeConversationId === convo._id}
        onSelect={handleSelectConversation}
        unreadCount={unreadCount}
        // phần này là phần bên trái của chat card (avatar, status, unreadCount)
        leftSection={
          <>
            {/* todo: user avartar */}
            <UserAvatar
              type="sidebar"
              name={otherUser.displayName ?? ''}
              avatarUrl={otherUser.avatarUrl ?? undefined}
            />
            {/* todo: status badge - socket io */}
            <StatusBadge
              status={
                onlineUsers.includes(otherUser?._id ?? '')
                  ? 'online'
                  : 'offline'
              }
            />

            {/* todo: unread count */}
            {unreadCount > 0 && <UnreadCountBadge unreadCount={unreadCount} />}
          </>
        }
        subtitle={
          <p
            className={cn(
              'text-sm truncate',
              unreadCount > 0
                ? 'font-medium text-foreground'
                : 'text-muted-foreground',
            )}
          >
            {lastMessage}
          </p>
        }
      />
    </div>
  )
}

export default DicrectMessageCard
