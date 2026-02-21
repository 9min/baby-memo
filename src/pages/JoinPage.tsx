import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Baby } from 'lucide-react'
import { useFamilyStore } from '@/stores/familyStore'
import { APP_NAME, MIN_CODE_LENGTH, MAX_CODE_LENGTH } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const JoinPage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const initialized = useFamilyStore((s) => s.initialized)
  const checkFamilyExists = useFamilyStore((s) => s.checkFamilyExists)
  const joinOrCreate = useFamilyStore((s) => s.joinOrCreate)
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [password, setPassword] = useState('')
  const [needsPassword, setNeedsPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (initialized && familyId) {
    navigate('/', { replace: true })
    return null
  }

  const isCodeValid = code.length >= MIN_CODE_LENGTH && code.length <= MAX_CODE_LENGTH
  const isPasswordValid = /^\d{4}$/.test(password)

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= MAX_CODE_LENGTH) {
      setCode(value)
      setError(null)
    }
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setPassword(value)
      setError(null)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isCodeValid || loading) return

    setLoading(true)
    setError(null)

    try {
      const exists = await checkFamilyExists(code)
      if (exists) {
        setNeedsPassword(true)
        setPassword('')
      } else {
        // New room — create directly
        await joinOrCreate(code)
        navigate('/', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '입장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isPasswordValid || loading) return

    setLoading(true)
    setError(null)

    try {
      await joinOrCreate(code, password)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '입장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    setNeedsPassword(false)
    setPassword('')
    setError(null)
  }

  if (needsPassword) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
              <Baby className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
            <p className="text-base text-muted-foreground">
              기존 가족방에 참여합니다
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="w-full flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <Label>가족 코드</Label>
              <div className="h-14 flex items-center justify-center rounded-md border bg-muted/50 text-xl tracking-[0.3em] font-semibold font-mono">
                {code}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="password">방 비밀번호</Label>
              <Input
                id="password"
                type="text"
                inputMode="numeric"
                placeholder="숫자 4자리"
                value={password}
                onChange={handlePasswordChange}
                className="h-14 text-center text-xl tracking-[0.5em] font-semibold font-mono"
                autoFocus
              />
            </div>

            {error && (
              <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-center">
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              className="h-14 cursor-pointer text-base font-semibold"
              disabled={!isPasswordValid || loading}
            >
              {loading ? '입장 중...' : '입장하기'}
            </Button>

            <Button
              type="button"
              variant="ghost"
              className="h-12 cursor-pointer text-sm"
              onClick={handleBack}
            >
              뒤로가기
            </Button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Baby className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="text-base text-muted-foreground">
            아기 활동을 가족과 함께 기록해요
          </p>
        </div>

        <form onSubmit={handleCodeSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="family-code">가족 코드</Label>
            <Input
              id="family-code"
              type="text"
              placeholder="예: BABY01"
              value={code}
              onChange={handleCodeChange}
              className="h-14 text-center text-xl tracking-[0.3em] uppercase font-semibold"
              autoFocus
            />
            <p className="text-xs text-muted-foreground leading-relaxed">
              영문 대문자와 숫자 {MIN_CODE_LENGTH}~{MAX_CODE_LENGTH}자리.
              새 코드를 입력하면 가족방이 만들어지고, 기존 코드를 입력하면 참여합니다.
            </p>
          </div>

          {error && (
            <div className="rounded-lg bg-destructive/10 px-3 py-2.5 text-center">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            className="h-14 cursor-pointer text-base font-semibold"
            disabled={!isCodeValid || loading}
          >
            {loading ? '확인 중...' : '시작하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default JoinPage
