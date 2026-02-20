import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { APP_NAME, MIN_CODE_LENGTH, MAX_CODE_LENGTH } from '@/lib/constants'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const JoinPage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const initialized = useFamilyStore((s) => s.initialized)
  const joinOrCreate = useFamilyStore((s) => s.joinOrCreate)
  const navigate = useNavigate()

  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (initialized && familyId) {
    navigate('/', { replace: true })
    return null
  }

  const isValid = code.length >= MIN_CODE_LENGTH && code.length <= MAX_CODE_LENGTH

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (value.length <= MAX_CODE_LENGTH) {
      setCode(value)
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || loading) return

    setLoading(true)
    setError(null)

    try {
      await joinOrCreate(code)
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '입장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm flex flex-col items-center gap-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">{APP_NAME}</h1>
          <p className="mt-2 text-base text-muted-foreground">
            아기 활동을 간편하게 기록하세요
          </p>
        </div>

        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="family-code">가족 코드</Label>
            <Input
              id="family-code"
              type="text"
              placeholder="예: BABY01"
              value={code}
              onChange={handleChange}
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
            disabled={!isValid || loading}
          >
            {loading ? '입장 중...' : '시작하기'}
          </Button>
        </form>
      </div>
    </div>
  )
}

export default JoinPage
