import { useFriendStore } from '@/stores/useFriendStore'
import type { Friend } from '@/types/user'
import { UserPlus, Users } from 'lucide-react'
import { useState } from 'react'
import InviteSuggestionList from '../newGroupChat/InviteSuggestionList'
import SelectedUsersList from '../newGroupChat/SelectedUsersList'
import { Button } from '../ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { toast } from 'sonner'
import { useChatStore } from '@/stores/useChatStore'
import { SidebarGroupAction } from '../ui/sidebar'

const NewGroupChatModal = () => {
  const [groupName, setGroupName] = useState('')
  const [search, setSearch] = useState('')

  const { friends, getFriends } = useFriendStore()
  const { loading, createConversation } = useChatStore()

  const [invitedUsers, setInvitedUsers] = useState<Friend[]>([])

  const handleGetFriends = async () => {
    await getFriends()
  }

  const handleSelectFriend = (friend: Friend) => {
    setInvitedUsers([...invitedUsers, friend])
    setSearch('')
  }

  const handleRemoveFriend = (friend: Friend) => {
    setInvitedUsers(invitedUsers.filter((user) => user._id !== friend._id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault()
      if (invitedUsers.length === 0) {
        toast.warning('Bạn phải mời ít nhất một người vào nhóm!')
        return
      }

      await createConversation(
        'group',
        groupName,
        invitedUsers.map((u) => u._id),
      )

      setSearch('')
      setInvitedUsers([])
    } catch (error) {
      console.error(
        'Lỗi xảy ra khi handleSubmit trong newGroupChatModal',
        error,
      )
    }
  }

  const filteredFriends = friends.filter(
    (friend) =>
      friend.displayName.toLowerCase().includes(search.toLowerCase()) &&
      !invitedUsers.some((u) => u._id === friend._id),
  )
  return (
    <Dialog>
      <DialogTrigger asChild>
        <SidebarGroupAction title="Tạo nhóm" onClick={handleGetFriends}>
          <Users className="size-4" />
          <span className="sr-only">Tạo nhóm</span>
        </SidebarGroupAction>
      </DialogTrigger>

      <DialogContent className="sm:max-w-106.25 border-none">
        <DialogHeader>
          <DialogTitle className="capitalize">Tạo nhóm chat mới</DialogTitle>
        </DialogHeader>

        <form className="space-y-4 " onSubmit={handleSubmit}>
          {/* tên nhóm */}
          <div className="space-y-2">
            <Label htmlFor="groupname" className="text-sm font-semibold">
              Tên nhóm
            </Label>

            <Input
              id="groupname"
              placeholder="Gõ tên nhóm vào đây..."
              className="glass border-border/50 focus:border-primary/50 transition-smooth"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              required
            />
          </div>

          {/* mời thành viên */}
          <div className="space-y-2">
            <Label htmlFor="invite" className="text-sm font-semibold">
              Mời thành viên
            </Label>

            <Input
              id="invite"
              placeholder="Tìm theo tên hiển thị..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            {/* danh sách gợi ý */}
            {search && filteredFriends.length > 0 && (
              <InviteSuggestionList
                filteredFriends={filteredFriends}
                onSelect={handleSelectFriend}
              />
            )}

            {/* danh sách user đã chọn */}
            <SelectedUsersList
              invitedUsers={invitedUsers}
              onRemove={handleRemoveFriend}
            />
          </div>

          {/* Nút submit */}
          <DialogFooter>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-chat text-white hover:opacity-90 transition-smooth"
            >
              {loading ? (
                <span>Đang tạo...</span>
              ) : (
                <>
                  <UserPlus className="size-4 mr-2" />
                  Tạo nhóm
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewGroupChatModal
