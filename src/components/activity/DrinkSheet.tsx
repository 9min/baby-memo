import { useState } from 'react'
import { GlassWater } from 'lucide-react'
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
import { DRINK_TYPE_LABELS } from '@/lib/activityConfig'
import { cn } from '@/lib/utils'
import type { DrinkType, DrinkMetadata } from '@/types/database'

interface DrinkSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: DrinkMetadata, recordedAt: Date) => void
}

const DRINK_TYPES: DrinkType[] = ['milk', 'water']

const DrinkSheet = ({ open, onOpenChange, onSubmit }: DrinkSheetProps) => {
  const [drinkType, setDrinkType] = useState<DrinkType | null>(null)
  const [amountMl, setAmountMl] = useState('')
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setDrinkType(null)
      setAmountMl('')
      setTime(roundToNearest5(new Date()))
    }
    onOpenChange(next)
  }

  const handleSubmit = () => {
    if (!drinkType) return
    onSubmit(
      { drink_type: drinkType, amount_ml: Number(amountMl) || 0 },
      time,
    )
    handleOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-sky-100 p-2">
              <GlassWater className="h-5 w-5 text-sky-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>마셔요 기록</SheetTitle>
              <SheetDescription>무엇을 얼마나 마셨나요?</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={time} onChange={setTime} />

          <div className="flex flex-col gap-1.5">
            <Label>종류</Label>
            <div className="grid grid-cols-2 gap-3">
              {DRINK_TYPES.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  className={cn(
                    'flex h-14 cursor-pointer items-center justify-center rounded-xl border-2 text-base font-semibold transition-all duration-200',
                    drinkType === dt
                      ? 'border-sky-400 bg-sky-100 text-sky-700 shadow-sm'
                      : 'border-border bg-background text-foreground hover:border-sky-200 hover:bg-sky-50',
                  )}
                  onClick={() => setDrinkType(dt)}
                >
                  {DRINK_TYPE_LABELS[dt]}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="drink-amount">마신 양 (ml)</Label>
            <Input
              id="drink-amount"
              type="number"
              inputMode="numeric"
              placeholder="예: 100"
              value={amountMl}
              onChange={(e) => setAmountMl(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            disabled={!drinkType}
            onClick={handleSubmit}
          >
            기록하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default DrinkSheet
