import { useState, useEffect } from 'react'
import { StickyNote } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import TimePicker from '@/components/activity/TimePicker'
import { roundToNearest5 } from '@/lib/timeUtils'
import type { MemoMetadata } from '@/types/database'

interface MemoSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: MemoMetadata, recordedAt: Date) => void
  initialData?: { metadata: MemoMetadata; recordedAt: Date }
}

const MemoSheet = ({ open, onOpenChange, onSubmit, initialData }: MemoSheetProps) => {
  const [content, setContent] = useState('')
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  useEffect(() => {
    if (open) {
      if (initialData) {
        setContent(initialData.metadata.content)
        setTime(initialData.recordedAt)
      } else {
        setContent('')
        setTime(roundToNearest5(new Date()))
      }
    }
  }, [open, initialData])

  const handleSubmit = () => {
    if (!content.trim()) return
    onSubmit({ content: content.trim() }, time)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-rose-100 p-2">
              <StickyNote className="h-5 w-5 text-rose-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>{initialData ? '메모 수정' : '메모 기록'}</SheetTitle>
              <SheetDescription>메모를 남겨보세요</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={time} onChange={setTime} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="memo-content">내용</Label>
            <Input
              id="memo-content"
              placeholder="예: 컨디션 좋음, 체온 36.5도..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            disabled={!content.trim()}
            onClick={handleSubmit}
          >
            {initialData ? '수정하기' : '기록하기'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default MemoSheet
