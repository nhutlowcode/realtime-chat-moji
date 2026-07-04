import Logout from '@/components/auth/Logout'
import { Button } from '@/components/ui/button'
import api from '@/lib/axios'
import { useAuthStore } from '@/stores/useAuthStore'
import { toast } from 'sonner'

function ChatAppPage() {
  const user = useAuthStore((store) => store.user)

  const handleTest = async () => {
    try {
      await api.get('/users/test')
      toast.success('ok')
    } catch (error) {
      console.error(error)
      toast.error('thất bại')
    }
  }
  return (
    <div>
      <Logout />
      {user?.displayName}
      ChatAppPagee
      <Button onClick={handleTest}>test</Button>
    </div>
  )
}

export default ChatAppPage
