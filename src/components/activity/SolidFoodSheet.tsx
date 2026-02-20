import { useState, useEffect } from 'react'
import { UtensilsCrossed } from 'lucide-react'
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
import { useFamilyStore } from '@/stores/familyStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import type { SolidFoodMetadata } from '@/types/database'

interface SolidFoodSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: SolidFoodMetadata, recordedAt: Date) => void
  initialData?: { metadata: SolidFoodMetadata; recordedAt: Date }
}

const SolidFoodSheet = ({ open, onOpenChange, onSubmit, initialData }: SolidFoodSheetProps) => {
  const familyCode = useFamilyStore((s) => s.familyCode)
  const solidFoodDefaults = useDefaultsStore((s) => s.getDefaults(familyCode ?? '').solidFood)
  const [foodName, setFoodName] = useState('')
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFoodName(initialData.metadata.food_name)
        setTime(initialData.recordedAt)
      } else {
        setFoodName(solidFoodDefaults.food_name)
        setTime(roundToNearest5(new Date()))
      }
    }
  }, [open, initialData, solidFoodDefaults])

  const handleSubmit = () => {
    if (!foodName.trim()) return
    onSubmit({ food_name: foodName.trim() }, time)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2">
              <UtensilsCrossed className="h-5 w-5 text-amber-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>{initialData ? '먹어요 수정' : '먹어요 기록'}</SheetTitle>
              <SheetDescription>무엇을 먹었나요?</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={time} onChange={setTime} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-name">먹은 것</Label>
            <Input
              id="food-name"
              placeholder="예: 감자죽 반 그릇, 바나나 조금..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            disabled={!foodName.trim()}
            onClick={handleSubmit}
          >
            {initialData ? '수정하기' : '기록하기'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SolidFoodSheet
