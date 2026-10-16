import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useFriendStore } from '@/stores/useFriendStore'
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import SentRequestDialog from './SentRequestDialog'
import ReceivedRequest from './ReceivedRequest'

interface FriendRequestDialogProps {
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}

const FriendRequestsDialog = ({ open, setOpen }: FriendRequestDialogProps) => {
  const [tab, setTab] = useState('received')
  const { getAllFriendRequest } = useFriendStore()

  useEffect(() => {
    const loadRequest = async () => {
      try {
        await getAllFriendRequest()
      } catch (error) {
        console.error('lỗi xảy ra khi load request', error)
      }
    }

    loadRequest()
  }, [])
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Lời mời kết bạn</DialogTitle>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          {/* 1 dialog có 2 tab đã nhận và đã gửi */}
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="received">Đã nhận</TabsTrigger>
            <TabsTrigger value="sent">Đã gửi</TabsTrigger>
          </TabsList>

          <TabsContent value="received">
            <ReceivedRequest />
          </TabsContent>
          <TabsContent value="sent">
            <SentRequestDialog />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export default FriendRequestsDialog
