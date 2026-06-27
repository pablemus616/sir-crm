import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>
}) {
  const { redirect } = await searchParams
  const target = redirect && redirect.startsWith('/') ? redirect : '/dashboard'
  return <LoginForm redirectTo={target} />
}
