import { useState } from 'react'
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
import type { SolidFoodMetadata } from '@/types/database'

interface SolidFoodSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: SolidFoodMetadata, recordedAt: Date) => void
}

const SolidFoodSheet = ({ open, onOpenChange, onSubmit }: SolidFoodSheetProps) => {
  const [foodName, setFoodName] = useState('')
  const [amount, setAmount] = useState('')
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  const handleOpenChange = (next: boolean) => {
    if (next) {
      setFoodName('')
      setAmount('')
      setTime(roundToNearest5(new Date()))
    }
    onOpenChange(next)
  }

  const handleSubmit = () => {
    if (!foodName.trim()) return
    onSubmit(
      { food_name: foodName.trim(), amount: amount.trim() },
      time,
    )
    handleOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-100 p-2">
              <UtensilsCrossed className="h-5 w-5 text-amber-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>먹어요 기록</SheetTitle>
              <SheetDescription>무엇을 얼마나 먹었나요?</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={time} onChange={setTime} />

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-name">음식 이름</Label>
            <Input
              id="food-name"
              placeholder="예: 감자죽, 소고기퓨레, 바나나..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="h-12 text-base"
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="food-amount">먹은 양</Label>
            <Input
              id="food-amount"
              placeholder="예: 반 그릇, 50ml, 조금..."
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="h-12 text-base"
            />
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            disabled={!foodName.trim()}
            onClick={handleSubmit}
          >
            기록하기
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SolidFoodSheet
