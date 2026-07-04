import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '@/stores/useAuthStore'
import { useNavigate } from 'react-router'

const signInShema = z.object({
  username: z.string().min(3, 'Tên đăng nhập phải có ít nhất 3 ký tự'),
  password: z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
})

type signInFormValues = z.infer<typeof signInShema> // tự suy ra kiểu từ signUpShema, ví dụ firstname là string thì suy ra là string

export function SigninForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const { signIn } = useAuthStore()
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<signInFormValues>({
    resolver: zodResolver(signInShema),
  })

  const onsubmit = async (data: signInFormValues) => {
    const { username, password } = data
    await signIn(username, password)

    navigate('/')
  }

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 border-border">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit(onsubmit)}>
            <div className="flex flex-col gap-6">
              {/* header - logo */}
              <div className="flex flex-col items-center text-center gap-2">
                <a href="/" className="mx-auto block w-fit text-center">
                  <img src="/logo.svg" alt="logo" />
                </a>
                <h1 className="text-2xl font-bold">Chào mừng bạn</h1>
                <p className="text-muted-foreground text-balance">
                  Hãy đăng nhập để kết nối với mọi người.
                </p>
              </div>

              {/* userName */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="username" className="block text-sm">
                    Tên đăng nhập
                  </Label>
                  <Input
                    type="text"
                    id="username"
                    placeholder="moji"
                    {...register('username')}
                  />
                </div>
                {/* todo: error message */}
                {errors.username && (
                  <p className="text-destructive text-sm">
                    {errors.username.message}
                  </p>
                )}
              </div>

              {/* password */}
              <div className="flex flex-col gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password" className="block text-sm">
                    Mật khẩu
                  </Label>
                  <Input
                    type="password"
                    id="password"
                    {...register('password')}
                  />
                </div>
                {/* todo: error message */}
                {errors.password && (
                  <p className="text-destructive text-sm">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Nút đăng nhập */}
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                Đăng nhập
              </Button>
            </div>

            {/* chuyển hướng đăng nhập */}
            <div className="text-center text-sm">
              Bạn chưa có tài khoản?{' '}
              <a href="/signup" className="underline underline-offset-4">
                Đăng ký.
              </a>
            </div>
          </form>
          <div className="relative hidden bg-muted md:block">
            <img
              src="/placeholderSignUp.png"
              alt="Image"
              className="absolute top-1/2 -translate-y-1/2 object-cover"
            />
          </div>
        </CardContent>
      </Card>
      <div className=" text-xs text-balance px-6 text-center *:[a]:hover:text-primary text-muted-foreground *:[a]:underline *:[a]:underline-offetset-4">
        Bằng cách nhấn để tiếp tục, bạn hãy đồng ý với{' '}
        <a href="#">Chính sách bảo mật</a> và <a href="#">Điều khoản</a> của
        chúng tôi.
      </div>
    </div>
  )
}
