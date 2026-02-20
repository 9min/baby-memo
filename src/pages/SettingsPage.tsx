import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const SettingsPage = () => {
  const familyCode = useFamilyStore((s) => s.familyCode)
  const nickname = useFamilyStore((s) => s.nickname)
  const updateNickname = useFamilyStore((s) => s.updateNickname)
  const leave = useFamilyStore((s) => s.leave)
  const navigate = useNavigate()

  const [editNickname, setEditNickname] = useState(nickname ?? '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)

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
    leave()
    navigate('/join', { replace: true })
  }

  return (
    <div className="flex flex-col gap-6 py-6">
      <h2 className="text-xl font-semibold">설정</h2>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <Label>가족 코드</Label>
          <div className="flex gap-2">
            <Input
              value={familyCode ?? ''}
              readOnly
              className="h-10 text-center tracking-widest font-mono"
            />
            <Button variant="outline" size="default" onClick={handleCopyCode}>
              {copied ? '복사됨' : '복사'}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            가족에게 이 코드를 공유하면 같은 방에서 함께 기록할 수 있습니다.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="nickname">기기 닉네임</Label>
          <div className="flex gap-2">
            <Input
              id="nickname"
              value={editNickname}
              onChange={(e) => setEditNickname(e.target.value)}
              placeholder="예: 엄마 폰"
              className="h-10"
            />
            <Button
              variant="outline"
              size="default"
              onClick={handleSaveNickname}
              disabled={saving || !editNickname.trim() || editNickname.trim() === nickname}
            >
              {saving ? '저장 중...' : '저장'}
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t pt-4">
        <Button variant="destructive" onClick={handleLeave} className="w-full">
          가족방 나가기
        </Button>
      </div>
    </div>
  )
}

export default SettingsPage
