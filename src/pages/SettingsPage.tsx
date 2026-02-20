import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check } from 'lucide-react'
import { useFamilyStore } from '@/stores/familyStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

const SettingsPage = () => {
  const familyCode = useFamilyStore((s) => s.familyCode)
  const nickname = useFamilyStore((s) => s.nickname)
  const updateNickname = useFamilyStore((s) => s.updateNickname)
  const leave = useFamilyStore((s) => s.leave)
  const navigate = useNavigate()

  const [editNickname, setEditNickname] = useState(nickname ?? '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [confirmLeave, setConfirmLeave] = useState(false)

  const handleCopyCode = async () => {
    if (!familyCode) return
    await navigator.clipboard.writeText(familyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleSaveNickname = async () => {
    const trimmed = editNickname.trim()
    if (!trimmed || trimmed === nickname) return
    setSaving(true)
    try {
      await updateNickname(trimmed)
    } finally {
      setSaving(false)
    }
  }

  const handleLeave = () => {
    if (!confirmLeave) {
      setConfirmLeave(true)
      setTimeout(() => setConfirmLeave(false), 3000)
      return
    }
    leave()
    navigate('/join', { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="text-lg font-bold">설정</h2>

      <Card>
        <CardContent className="flex flex-col gap-5 px-4 py-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">가족 코드</Label>
            <div className="flex gap-2">
              <Input
                value={familyCode ?? ''}
                readOnly
                className="h-12 text-center text-lg tracking-[0.3em] font-mono font-semibold"
              />
              <Button
                variant="outline"
                className="h-12 min-w-[72px] cursor-pointer gap-1.5"
                onClick={handleCopyCode}
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    복사됨
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    복사
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              가족에게 이 코드를 공유하면 같은 방에서 함께 기록할 수 있습니다.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname" className="text-xs text-muted-foreground">
              기기 닉네임
            </Label>
            <div className="flex gap-2">
              <Input
                id="nickname"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="예: 엄마 폰"
                className="h-12 text-base"
              />
              <Button
                variant="outline"
                className="h-12 min-w-[72px] cursor-pointer"
                onClick={handleSaveNickname}
                disabled={saving || !editNickname.trim() || editNickname.trim() === nickname}
              >
                {saving ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Button
        variant={confirmLeave ? 'destructive' : 'outline'}
        className="h-12 cursor-pointer text-base"
        onClick={handleLeave}
      >
        {confirmLeave ? '정말 나가시겠습니까? 다시 눌러주세요' : '가족방 나가기'}
      </Button>
    </div>
  )
}

export default SettingsPage
