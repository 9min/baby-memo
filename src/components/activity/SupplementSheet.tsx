import { useState, useEffect } from 'react'
import { Pill } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import TimePicker, { roundToNearest5 } from '@/components/activity/TimePicker'
import { useSupplementStore } from '@/stores/supplementStore'
import { useFamilyStore } from '@/stores/familyStore'
import { cn } from '@/lib/utils'
import { useDefaultsStore } from '@/stores/defaultsStore'
import type { SupplementMetadata } from '@/types/database'

interface SupplementSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (metadata: SupplementMetadata, recordedAt: Date) => void
  initialData?: { metadata: SupplementMetadata; recordedAt: Date }
}

const SupplementSheet = ({ open, onOpenChange, onSubmit, initialData }: SupplementSheetProps) => {
  const familyId = useFamilyStore((s) => s.familyId)
  const familyCode = useFamilyStore((s) => s.familyCode)
  const presets = useSupplementStore((s) => s.presets)
  const fetchPresets = useSupplementStore((s) => s.fetchPresets)
  const supplementDefaults = useDefaultsStore((s) => s.getDefaults(familyCode ?? '').supplement)

  const [selected, setSelected] = useState<string[]>([])
  const [time, setTime] = useState(() => roundToNearest5(new Date()))

  useEffect(() => {
    if (open && familyId) {
      fetchPresets(familyId)
    }
  }, [open, familyId, fetchPresets])

  useEffect(() => {
    if (open) {
      if (initialData) {
        setSelected(initialData.metadata.supplement_names)
        setTime(initialData.recordedAt)
      } else {
        setSelected(supplementDefaults.supplement_names)
        setTime(roundToNearest5(new Date()))
      }
    }
  }, [open, initialData, supplementDefaults])

  const togglePreset = (name: string) => {
    setSelected((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    )
  }

  const handleSubmit = () => {
    if (selected.length === 0) return
    onSubmit({ supplement_names: selected }, time)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader>
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-violet-100 p-2">
              <Pill className="h-5 w-5 text-violet-700" strokeWidth={2} />
            </div>
            <div>
              <SheetTitle>{initialData ? '영양제 수정' : '영양제 기록'}</SheetTitle>
              <SheetDescription>어떤 영양제를 먹었나요?</SheetDescription>
            </div>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-4 px-4 pb-8">
          <TimePicker value={time} onChange={setTime} />

          <div className="flex flex-col gap-1.5">
            <Label>영양제 선택</Label>
            {presets.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-6 text-center">
                <p className="text-sm text-muted-foreground">
                  등록된 영양제가 없습니다
                </p>
                <p className="mt-1 text-xs text-muted-foreground/70">
                  설정에서 영양제를 먼저 등록해주세요
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className={cn(
                      'flex h-14 cursor-pointer items-center gap-3 rounded-xl border-2 px-4 text-base font-semibold transition-all duration-200',
                      selected.includes(preset.name)
                        ? 'border-violet-400 bg-violet-100 text-violet-700 shadow-sm'
                        : 'border-border bg-background text-foreground hover:border-violet-200 hover:bg-violet-50',
                    )}
                    onClick={() => togglePreset(preset.name)}
                  >
                    <Checkbox
                      checked={selected.includes(preset.name)}
                      className="pointer-events-none"
                    />
                    {preset.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          <Button
            className="mt-2 h-14 cursor-pointer text-base font-semibold"
            disabled={selected.length === 0}
            onClick={handleSubmit}
          >
            {initialData ? '수정하기' : '기록하기'}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

export default SupplementSheet
