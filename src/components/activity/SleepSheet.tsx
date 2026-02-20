import { useState, useEffect } from 'react'
import { Moon, Plus, X } from 'lucide-react'
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
import TimePicker, { roundToNearest5 } from '@/components/activity/TimePicker'
import type { SleepMetadata } from '@/types/database'

interface SleepSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: SleepMetadata, recordedAt: Date) => void
  initialData?: { metadata: SleepMetadata; recordedAt: Date }
}

const SleepSheet = ({ open, onOpenChange, onSubmit, initialData }: SleepSheetProps) => {
  const [note, setNote] = useState('')
  const [startTime, setStartTime] = useState(() => roundToNearest5(new Date()))
  const [endTime, setEndTime] = useState<Date | null>(null)

  useEffect(() => {
    if (open) {
      if (initialData) {
        setNote(initialData.metadata.note)
        setStartTime(initialData.recordedAt)
        setEndTime(initialData.metadata.end_time ? new Date(initialData.metadata.end_time) : null)
      } else {
        setNote('')
        setStartTime(roundToNearest5(new Date()))
        setEndTime(null)
      }
    }
  }, [open, initialData])

  const handleSubmit = () => {
    onSubmit(
      { note: note.trim(), end_time: endTime ? endTime.toISOString() : null },
      startTime,
    )
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-indigo-100 p-2">
              <Moon className="h-5 w-5 text-indigo-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>{initialData ? '잠자요 수정' : '잠자요 기록'}</SheetTitle>
              <SheetDescription>취침 시간을 기록해요</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={startTime} onChange={setStartTime} label="시작 시간" />

          {endTime ? (
            <div className="relative">
              <TimePicker value={endTime} onChange={setEndTime} label="종료 시간" />
              <button
                type="button"
                className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                onClick={() => setEndTime(null)}
                aria-label="종료 시간 제거"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              className="h-11 cursor-pointer gap-1.5 text-sm text-muted-foreground"
              onClick={() => setEndTime(roundToNearest5(new Date()))}
            >
              <Plus className="h-4 w-4" />
              종료 시간 추가
            </Button>
          )}

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sleep-note">메모 (선택)</Label>
            <Input
              id="sleep-note"
              placeholder="예: 낮잠"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            onClick={handleSubmit}
          >
            {initialData ? '수정하기' : '기록하기'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SleepSheet
