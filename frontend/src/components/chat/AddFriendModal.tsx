import { useFriendStore } from '@/stores/useFriendStore'
import type { User } from '@/types/user'
import { UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import SearchForm from '../addFriendModal/SearchForm'
import SendRequestForm from '../addFriendModal/SendRequestForm'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog'

export interface IFormValues {
  username: string
  message: string
}

function AddFriendModal() {
  const [isFound, setIsFound] = useState<boolean | null>(null)
  const [searchUser, setSearchUser] = useState<User>()
  const [searchedUsername, setSearchedUsername] = useState('')

  const { loading, searchByUsername, addFriend } = useFriendStore()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<IFormValues>({ defaultValues: { username: '', message: '' } })

  const usernameValue = watch('username') // theo dõi realtime input username mà không cần submit

  // console.log('usernameValue: ', usernameValue)

  const handleSearch = handleSubmit(async (data) => {
    const username = data.username.trim()
    if (!username) return

    setIsFound(null)
    setSearchedUsername(username)

    try {
      const foundUser = await searchByUsername(username)
      if (foundUser) {
        setIsFound(true)
        setSearchUser(foundUser)
      } else {
        setIsFound(false)
      }
    } catch (error) {
      console.error(error)
      setIsFound(false)
    }
  })

  const handleSend = handleSubmit(async (data) => {
    if (!searchUser) return

    try {
      const message = await addFriend(searchUser._id, data.message.trim())
      toast.success(message)

      handleCancel()
    } catch (error) {
      console.error('Lỗi xảy ra khi gửi request từ form', error)
    }
  })

  const handleCancel = () => {
    reset()
    setSearchedUsername('')
    setIsFound(null)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="flex justify-center items-center size-5 rounded-full hover:bg-sidebar-accent cursor-pointer z-10">
          <UserPlus className="size-4" />
          <span className="sr-only">Kết bạn</span>
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px] border-none">
        <DialogHeader>
          <DialogTitle>Kết bạn</DialogTitle>
        </DialogHeader>
        {!isFound && (
          <>
            <SearchForm
              register={register}
              loading={loading}
              errors={errors}
              usernameValue={usernameValue}
              isFound={isFound}
              searchUsername={searchedUsername}
              onSubmit={handleSearch}
              onCancel={handleCancel}
            />
          </>
        )}

        {isFound && (
          <>
            <SendRequestForm
              register={register}
              loading={loading}
              searchedUsername={searchedUsername}
              onBack={() => setIsFound(null)}
              onSubmit={handleSend}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default AddFriendModal
