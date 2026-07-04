import { useAuthStore } from '@/stores/useAuthStore'
import { Button } from '../ui/button'
import { useNavigate } from 'react-router'

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
  return <Button onClick={handleLogOut}>Logout</Button>
}

export default Logout
