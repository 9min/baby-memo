import { useState } from 'react'
import { Droplets } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import TimePicker, { roundToNearest5 } from '@/components/activity/TimePicker'
import { DIAPER_TYPE_LABELS, DIAPER_AMOUNT_LABELS } from '@/lib/activityConfig'
import { cn } from '@/lib/utils'
import type { DiaperType, DiaperAmount, DiaperMetadata } from '@/types/database'

interface DiaperSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: DiaperMetadata, recordedAt: Date) => void
}

const DIAPER_TYPES: DiaperType[] = ['pee', 'poo']
const DIAPER_AMOUNTS: DiaperAmount[] = ['little', 'normal', 'much']

const DiaperSheet = ({ open, onOpenChange, onSubmit }: DiaperSheetProps) => {
  const [diaperType, setDiaperType] = useState<DiaperType | null>(null)
  const [amount, setAmount] = useState<DiaperAmount | null>(null)
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDiaperType(null)
      setAmount(null)
      setTime(roundToNearest5(new Date()))
    }
    onOpenChange(next)
  }

  const handleSubmit = () => {
    if (!diaperType || !amount) return
    onSubmit(
      { diaper_type: diaperType, amount },
      time,
    )
    handleOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2">
              <Droplets className="h-5 w-5 text-emerald-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>기저귀 기록</SheetTitle>
              <SheetDescription>어떤 기저귀를 갈았나요?</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={time} onChange={setTime} />

          <div className="flex flex-col gap-1.5">
            <Label>종류</Label>
            <div className="grid grid-cols-2 gap-3">
              {DIAPER_TYPES.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  className={cn(
                    'flex h-14 cursor-pointer items-center justify-center rounded-xl border-2 text-base font-semibold transition-all duration-200',
                    diaperType === dt
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-700 shadow-sm'
                      : 'border-border bg-background text-foreground hover:border-emerald-200 hover:bg-emerald-50',
                  )}
                  onClick={() => setDiaperType(dt)}
                >
                  {DIAPER_TYPE_LABELS[dt]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label>양</Label>
            <div className="grid grid-cols-3 gap-3">
              {DIAPER_AMOUNTS.map((da) => (
                <button
                  key={da}
                  type="button"
                  className={cn(
                    'flex h-14 cursor-pointer items-center justify-center rounded-xl border-2 text-base font-semibold transition-all duration-200',
                    amount === da
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-700 shadow-sm'
                      : 'border-border bg-background text-foreground hover:border-emerald-200 hover:bg-emerald-50',
                  )}
                  onClick={() => setAmount(da)}
                >
                  {DIAPER_AMOUNT_LABELS[da]}
                </button>
              ))}
            </div>
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            disabled={!diaperType || !amount}
            onClick={handleSubmit}
          >
            기록하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default DiaperSheet
