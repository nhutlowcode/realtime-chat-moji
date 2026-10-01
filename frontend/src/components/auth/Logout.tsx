import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router'
import { LogOut } from 'lucide-react'

function Logout() {
  const { signOut } = useAuthStore()
  const navigate = useNavigate()
  const handleLogOut = async () => {
    try {
      await signOut()
      navigate('/signin')
    } catch (error) {
      console.log('Lỗi khi đăng xuất: ', error)
    }
  }
  return (
    <Button variant="completeGhost" onClick={handleLogOut}>
      <LogOut className="text-destructive" />
      Đăng xuất
    </Button>
  )
}

export default Logout
