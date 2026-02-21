import { useState, useEffect } from 'react'
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
import TimePicker from '@/components/activity/TimePicker'
import { roundToNearest5 } from '@/lib/timeUtils'
import { DIAPER_TYPE_LABELS, DIAPER_AMOUNT_LABELS } from '@/lib/activityConfig'
import { cn } from '@/lib/utils'
import { useFamilyStore } from '@/stores/familyStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import type { DiaperType, DiaperAmount, DiaperMetadata } from '@/types/database'

interface DiaperSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: DiaperMetadata, recordedAt: Date) => void
  initialData?: { metadata: DiaperMetadata; recordedAt: Date }
}

const DIAPER_TYPES: DiaperType[] = ['pee', 'poo']
const DIAPER_AMOUNTS: DiaperAmount[] = ['little', 'normal', 'much']

const DiaperSheet = ({ open, onOpenChange, onSubmit, initialData }: DiaperSheetProps) => {
  const familyCode = useFamilyStore((s) => s.familyCode)
  const diaperDefaults = useDefaultsStore((s) => s.getDefaults(familyCode ?? '').diaper)
  const [diaperType, setDiaperType] = useState<DiaperType | null>(null)
  const [amount, setAmount] = useState<DiaperAmount | null>(null)
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDiaperType(initialData.metadata.diaper_type)
        setAmount(initialData.metadata.amount)
        setTime(initialData.recordedAt)
      } else {
        setDiaperType(diaperDefaults.diaper_type)
        setAmount(diaperDefaults.amount)
        setTime(roundToNearest5(new Date()))
      }
    }
  }, [open, initialData, diaperDefaults])

  const handleSubmit = () => {
    if (!diaperType || !amount) return
    onSubmit(
      { diaper_type: diaperType, amount },
      time,
    )
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-100 p-2">
              <Droplets className="h-5 w-5 text-emerald-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>{initialData ? '기저귀 수정' : '기저귀 기록'}</SheetTitle>
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
            {initialData ? '수정하기' : '기록하기'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default DiaperSheet
