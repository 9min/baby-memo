import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Copy, Check, Plus, Trash2, Pill, UtensilsCrossed, GlassWater, Droplets, Sun, Moon, Monitor, Baby, Download, Loader2, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import { formatBabyAge } from '@/lib/babyUtils'
import { useFamilyStore } from '@/stores/familyStore'
import { useSupplementStore } from '@/stores/supplementStore'
import { useDefaultsStore } from '@/stores/defaultsStore'
import { useThemeStore } from '@/stores/themeStore'
import { useBabyStore } from '@/stores/babyStore'
import { exportActivitiesCSV } from '@/lib/dataExport'
import { DRINK_TYPE_LABELS, DIAPER_TYPE_LABELS, DIAPER_AMOUNT_LABELS } from '@/lib/activityConfig'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import InstallPrompt from '@/components/layout/InstallPrompt'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { DrinkType, DiaperType, DiaperAmount } from '@/types/database'

const DRINK_TYPES: DrinkType[] = ['formula', 'milk', 'water']
const DIAPER_TYPES: DiaperType[] = ['pee', 'poo']
const DIAPER_AMOUNTS: DiaperAmount[] = ['little', 'normal', 'much']

const SettingsPage = () => {
  const familyId = useFamilyStore((s) => s.familyId)
  const familyCode = useFamilyStore((s) => s.familyCode)
  const familyPassword = useFamilyStore((s) => s.familyPassword)
  const updatePassword = useFamilyStore((s) => s.updatePassword)
  const getDeviceCount = useFamilyStore((s) => s.getDeviceCount)
  const leave = useFamilyStore((s) => s.leave)
  const nickname = useFamilyStore((s) => s.nickname)
  const deviceId = useFamilyStore((s) => s.deviceId)
  const setNickname = useFamilyStore((s) => s.setNickname)
  const members = useFamilyStore((s) => s.members)
  const fetchMembers = useFamilyStore((s) => s.fetchMembers)
  const kickMember = useFamilyStore((s) => s.kickMember)
  const navigate = useNavigate()

  const presets = useSupplementStore((s) => s.presets)
  const fetchPresets = useSupplementStore((s) => s.fetchPresets)
  const addPreset = useSupplementStore((s) => s.addPreset)
  const deletePreset = useSupplementStore((s) => s.deletePreset)
  const subscribeSupplement = useSupplementStore((s) => s.subscribe)
  const unsubscribeSupplement = useSupplementStore((s) => s.unsubscribe)

  const theme = useThemeStore((s) => s.theme)
  const setTheme = useThemeStore((s) => s.setTheme)

  const babies = useBabyStore((s) => s.babies)
  const addBaby = useBabyStore((s) => s.addBaby)
  const deleteBaby = useBabyStore((s) => s.deleteBaby)

  const getDefaults = useDefaultsStore((s) => s.getDefaults)
  const setSolidFoodDefaults = useDefaultsStore((s) => s.setSolidFoodDefaults)
  const setDrinkDefaults = useDefaultsStore((s) => s.setDrinkDefaults)
  const setSupplementDefaults = useDefaultsStore((s) => s.setSupplementDefaults)
  const setDiaperDefaults = useDefaultsStore((s) => s.setDiaperDefaults)

  const defaults = getDefaults(familyCode ?? '')

  const [editPassword, setEditPassword] = useState(familyPassword ?? '')
  const [savingPassword, setSavingPassword] = useState(false)
  const [editNickname, setEditNickname] = useState(nickname ?? '')
  const [savingNickname, setSavingNickname] = useState(false)

  useEffect(() => {
    setEditNickname(nickname ?? '')
  }, [nickname])
  const [copied, setCopied] = useState(false)
  const [showLeaveDialog, setShowLeaveDialog] = useState(false)
  const [isLastMember, setIsLastMember] = useState(false)
  const [newSupplementName, setNewSupplementName] = useState('')
  const [addingSupplement, setAddingSupplement] = useState(false)
  const [newBabyName, setNewBabyName] = useState('')
  const [newBabyBirthdate, setNewBabyBirthdate] = useState('')
  const [addingBaby, setAddingBaby] = useState(false)
  const [showDeleteBabyDialog, setShowDeleteBabyDialog] = useState<string | null>(null)
  const [kickTargetId, setKickTargetId] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const [exportDone, setExportDone] = useState(false)
  const [savedSection, setSavedSection] = useState<string | null>(null)
  const savedTimerRef = useRef<ReturnType<typeof setTimeout>>(null)

  const showSaved = useCallback((section: string) => {
    if (savedTimerRef.current) clearTimeout(savedTimerRef.current)
    setSavedSection(section)
    savedTimerRef.current = setTimeout(() => setSavedSection(null), 2000)
  }, [])

  // Local defaults state
  const [defaultFoodName, setDefaultFoodName] = useState(defaults.solidFood.food_name)
  const [defaultDrinkType, setDefaultDrinkType] = useState<DrinkType | null>(defaults.drink.drink_type)
  const [defaultAmountMl, setDefaultAmountMl] = useState(defaults.drink.amount_ml)
  const [defaultSupplementNames, setDefaultSupplementNames] = useState<string[]>(defaults.supplement.supplement_names)
  const [defaultDiaperType, setDefaultDiaperType] = useState<DiaperType | null>(defaults.diaper.diaper_type)
  const [defaultDiaperAmount, setDefaultDiaperAmount] = useState<DiaperAmount | null>(defaults.diaper.amount)

  useEffect(() => {
    if (familyId) {
      fetchPresets(familyId)
      subscribeSupplement(familyId)
      fetchMembers(familyId)
    }
    return () => {
      unsubscribeSupplement()
    }
  }, [familyId, fetchPresets, subscribeSupplement, unsubscribeSupplement, fetchMembers])

  const handleCopyCode = async () => {
    if (!familyCode) return
    await navigator.clipboard.writeText(familyCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '')
    if (value.length <= 4) {
      setEditPassword(value)
    }
  }

  const handleSavePassword = async () => {
    if (!/^\d{4}$/.test(editPassword) || editPassword === familyPassword) return
    setSavingPassword(true)
    try {
      await updatePassword(editPassword)
    } finally {
      setSavingPassword(false)
    }
  }

  const handleSaveNickname = async () => {
    const trimmed = editNickname.trim()
    if (!trimmed || trimmed === nickname) return
    setSavingNickname(true)
    try {
      await setNickname(trimmed)
    } finally {
      setSavingNickname(false)
    }
  }

  const handleAddSupplement = async () => {
    const trimmed = newSupplementName.trim()
    if (!trimmed || !familyId) return
    setAddingSupplement(true)
    try {
      await addPreset(familyId, trimmed)
      setNewSupplementName('')
    } finally {
      setAddingSupplement(false)
    }
  }

  const handleLeave = async () => {
    const count = await getDeviceCount()
    setIsLastMember(count <= 1)
    setShowLeaveDialog(true)
  }

  const handleConfirmLeave = async () => {
    setShowLeaveDialog(false)
    await leave()
    navigate('/join', { replace: true })
  }

  const handleAddBaby = async () => {
    const trimmedName = newBabyName.trim()
    if (!trimmedName || !newBabyBirthdate || !familyId) return
    setAddingBaby(true)
    try {
      await addBaby(familyId, trimmedName, newBabyBirthdate)
      setNewBabyName('')
      setNewBabyBirthdate('')
    } finally {
      setAddingBaby(false)
    }
  }

  const handleDeleteBaby = async (id: string) => {
    setShowDeleteBabyDialog(null)
    await deleteBaby(id)
  }

  const handleExportCSV = async () => {
    if (!familyId) return
    setExporting(true)
    try {
      await exportActivitiesCSV(familyId)
      setExportDone(true)
      setTimeout(() => setExportDone(false), 2000)
    } finally {
      setExporting(false)
    }
  }

  // Save defaults handlers
  const handleSaveSolidFoodDefault = () => {
    if (!familyCode) return
    setSolidFoodDefaults(familyCode, defaultFoodName.trim())
    showSaved('solidFood')
  }

  const handleSaveDrinkDefault = () => {
    if (!familyCode) return
    setDrinkDefaults(familyCode, defaultDrinkType, defaultAmountMl.trim())
    showSaved('drink')
  }

  const handleSaveSupplementDefault = () => {
    if (!familyCode) return
    setSupplementDefaults(familyCode, defaultSupplementNames)
    showSaved('supplement')
  }

  const handleSaveDiaperDefault = () => {
    if (!familyCode) return
    setDiaperDefaults(familyCode, defaultDiaperType, defaultDiaperAmount)
    showSaved('diaper')
  }

  const toggleSupplementDefault = (name: string) => {
    setDefaultSupplementNames((prev) =>
      prev.includes(name)
        ? prev.filter((n) => n !== name)
        : [...prev, name],
    )
  }

  const isRoomOwner = members.length > 0 && members[0].device_id === deviceId

  const handleKickMember = async (targetDeviceId: string) => {
    setKickTargetId(null)
    await kickMember(targetDeviceId)
  }

  const isSolidFoodChanged = defaultFoodName.trim() !== defaults.solidFood.food_name
  const isDrinkChanged = defaultDrinkType !== defaults.drink.drink_type || defaultAmountMl.trim() !== defaults.drink.amount_ml
  const isSupplementChanged = JSON.stringify(defaultSupplementNames.sort()) !== JSON.stringify([...defaults.supplement.supplement_names].sort())
  const isDiaperChanged = defaultDiaperType !== defaults.diaper.diaper_type || defaultDiaperAmount !== defaults.diaper.amount

  return (
    <div className="flex flex-col gap-6 py-4">
      <h2 className="text-lg font-extrabold">설정</h2>

      {/* Family Code & Nickname */}
      <Card>
        <CardContent className="flex flex-col gap-5 px-4 py-5">
          <div className="flex flex-col gap-2">
            <Label className="text-xs text-muted-foreground">가족 코드</Label>
            <div className="flex gap-2">
              <Input
                value={familyCode ?? ''}
                readOnly
                className="h-12 text-center text-lg tracking-[0.3em] font-mono font-semibold caret-transparent"
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
            <Label htmlFor="room-password" className="text-xs text-muted-foreground">
              방 비밀번호
            </Label>
            <div className="flex gap-2">
              <Input
                id="room-password"
                type="text"
                inputMode="numeric"
                value={editPassword}
                onChange={handlePasswordChange}
                placeholder="숫자 4자리"
                className="h-12 text-center text-lg tracking-[0.5em] font-mono font-semibold"
              />
              <Button
                variant="outline"
                className="h-12 min-w-[72px] cursor-pointer"
                onClick={handleSavePassword}
                disabled={savingPassword || !/^\d{4}$/.test(editPassword) || editPassword === familyPassword}
              >
                {savingPassword ? '저장 중...' : '저장'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              다른 가족이 이 방에 참여할 때 필요한 비밀번호입니다.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Label htmlFor="nickname" className="text-xs text-muted-foreground">
              내 닉네임
            </Label>
            <div className="flex gap-2">
              <Input
                id="nickname"
                value={editNickname}
                onChange={(e) => setEditNickname(e.target.value)}
                placeholder="닉네임 입력"
                className="h-12 text-sm font-semibold"
              />
              <Button
                variant="outline"
                className="h-12 min-w-[72px] cursor-pointer"
                onClick={handleSaveNickname}
                disabled={savingNickname || !editNickname.trim() || editNickname.trim() === nickname}
              >
                {savingNickname ? '저장 중...' : '저장'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Family Members */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-indigo-50 p-1.5 dark:bg-indigo-950/40">
              <Users className="h-3.5 w-3.5 text-indigo-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">가족 구성원</Label>
            <span className="text-xs text-muted-foreground">({members.length}명)</span>
          </div>
          {members.length > 0 ? (
            <div className="flex flex-col gap-2">
              {members.map((member, index) => (
                <div
                  key={member.id}
                  className="flex items-center gap-2 rounded-lg border px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium truncate">
                        {member.nickname ?? '이름 없음'}
                      </span>
                      {index === 0 && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">방장</Badge>
                      )}
                      {member.device_id === deviceId && (
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">나</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(member.created_at), 'yyyy.MM.dd 참여', { locale: ko })}
                    </p>
                  </div>
                  {isRoomOwner && member.device_id !== deviceId && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                      onClick={() => setKickTargetId(member.device_id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-xs text-muted-foreground">
              구성원 정보를 불러오는 중...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Baby Profile */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-pink-50 p-1.5 dark:bg-pink-950/40">
              <Baby className="h-3.5 w-3.5 text-pink-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">아기 프로필</Label>
          </div>

          {babies.length > 0 ? (
            <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
              <div className="flex-1">
                <span className="text-sm font-medium">{babies[0].name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {formatBabyAge(babies[0].birthdate)}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                onClick={() => setShowDeleteBabyDialog(babies[0].id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ) : (
            <>
              <p className="text-center text-xs text-muted-foreground">
                등록된 아기가 없습니다
              </p>
              <Separator />
              <div className="flex flex-col gap-2">
                <Input
                  value={newBabyName}
                  onChange={(e) => setNewBabyName(e.target.value)}
                  placeholder="아기 이름"
                  className="h-10 text-sm"
                />
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={newBabyBirthdate}
                    onChange={(e) => setNewBabyBirthdate(e.target.value)}
                    className="h-10 text-sm"
                  />
                  <Button
                    variant="outline"
                    className="h-10 min-w-[56px] cursor-pointer gap-1 text-xs"
                    onClick={handleAddBaby}
                    disabled={addingBaby || !newBabyName.trim() || !newBabyBirthdate}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    추가
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <Label className="text-xs text-muted-foreground">테마</Label>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: 'light' as const, label: '라이트', icon: Sun },
              { value: 'dark' as const, label: '다크', icon: Moon },
              { value: 'system' as const, label: '시스템', icon: Monitor },
            ]).map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                className={cn(
                  'flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-lg border-2 text-sm font-semibold transition-all',
                  theme === value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-foreground',
                )}
                onClick={() => setTheme(value)}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Activity Defaults */}
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">기본값 설정</h3>

      {/* Solid Food Default */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-amber-50 p-1.5 dark:bg-amber-950/40">
              <UtensilsCrossed className="h-3.5 w-3.5 text-amber-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">먹어요</Label>
          </div>
          <div className="flex gap-2">
            <Input
              value={defaultFoodName}
              onChange={(e) => setDefaultFoodName(e.target.value)}
              placeholder="예: 감자죽 반 그릇"
              className="h-10 text-sm"
            />
            <Button
              variant="outline"
              className={cn(
                'h-10 min-w-[56px] cursor-pointer text-xs gap-1',
                savedSection === 'solidFood' && 'border-green-400 bg-green-50 text-green-700',
              )}
              onClick={handleSaveSolidFoodDefault}
              disabled={!isSolidFoodChanged && savedSection !== 'solidFood'}
            >
              {savedSection === 'solidFood' ? <><Check className="h-3.5 w-3.5" />저장됨</> : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Drink Default */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-sky-50 p-1.5 dark:bg-sky-950/40">
              <GlassWater className="h-3.5 w-3.5 text-sky-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">마셔요</Label>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              {DRINK_TYPES.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  className={cn(
                    'flex h-10 cursor-pointer items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all',
                    defaultDrinkType === dt
                      ? 'border-sky-400 bg-sky-100 text-sky-700'
                      : 'border-border bg-background text-foreground',
                  )}
                  onClick={() => setDefaultDrinkType(defaultDrinkType === dt ? null : dt)}
                >
                  {DRINK_TYPE_LABELS[dt]}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="number"
                inputMode="numeric"
                value={defaultAmountMl}
                onChange={(e) => setDefaultAmountMl(e.target.value)}
                placeholder="ml (예: 100)"
                className="h-10 text-sm"
              />
              <Button
                variant="outline"
                className={cn(
                  'h-10 min-w-[56px] cursor-pointer text-xs gap-1',
                  savedSection === 'drink' && 'border-green-400 bg-green-50 text-green-700',
                )}
                onClick={handleSaveDrinkDefault}
                disabled={!isDrinkChanged && savedSection !== 'drink'}
              >
                {savedSection === 'drink' ? <><Check className="h-3.5 w-3.5" />저장됨</> : '저장'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supplement Presets + Default */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-violet-50 p-1.5 dark:bg-violet-950/40">
              <Pill className="h-3.5 w-3.5 text-violet-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">영양제</Label>
          </div>

          {/* Add new preset */}
          <div className="flex gap-2">
            <Input
              value={newSupplementName}
              onChange={(e) => setNewSupplementName(e.target.value)}
              placeholder="영양제 이름 추가"
              className="h-10 text-sm"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddSupplement()
              }}
            />
            <Button
              variant="outline"
              className="h-10 min-w-[56px] cursor-pointer gap-1 text-xs"
              onClick={handleAddSupplement}
              disabled={addingSupplement || !newSupplementName.trim()}
            >
              <Plus className="h-3.5 w-3.5" />
              추가
            </Button>
          </div>

          {/* Preset list with delete + default check */}
          {presets.length > 0 && (
            <>
              <Separator />
              <Label className="text-xs text-muted-foreground">기본 선택 (새 기록 시 자동 체크)</Label>
              <div className="flex flex-col gap-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex items-center gap-2 rounded-lg border px-3 py-2"
                  >
                    <Checkbox
                      checked={defaultSupplementNames.includes(preset.name)}
                      onCheckedChange={() => toggleSupplementDefault(preset.name)}
                      className="cursor-pointer"
                    />
                    <span className="flex-1 text-sm font-medium">{preset.name}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 cursor-pointer text-muted-foreground hover:text-destructive"
                      onClick={() => deletePreset(preset.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                className={cn(
                  'h-10 cursor-pointer text-xs gap-1',
                  savedSection === 'supplement' && 'border-green-400 bg-green-50 text-green-700',
                )}
                onClick={handleSaveSupplementDefault}
                disabled={!isSupplementChanged && savedSection !== 'supplement'}
              >
                {savedSection === 'supplement' ? <><Check className="h-3.5 w-3.5" />저장됨</> : '기본값 저장'}
              </Button>
            </>
          )}

          {presets.length === 0 && (
            <p className="text-center text-xs text-muted-foreground">
              등록된 영양제가 없습니다
            </p>
          )}
        </CardContent>
      </Card>

      {/* Diaper Default */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-emerald-50 p-1.5 dark:bg-emerald-950/40">
              <Droplets className="h-3.5 w-3.5 text-emerald-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">기저귀</Label>
          </div>
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              {DIAPER_TYPES.map((dt) => (
                <button
                  key={dt}
                  type="button"
                  className={cn(
                    'flex h-10 cursor-pointer items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all',
                    defaultDiaperType === dt
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                      : 'border-border bg-background text-foreground',
                  )}
                  onClick={() => setDefaultDiaperType(defaultDiaperType === dt ? null : dt)}
                >
                  {DIAPER_TYPE_LABELS[dt]}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DIAPER_AMOUNTS.map((da) => (
                <button
                  key={da}
                  type="button"
                  className={cn(
                    'flex h-10 cursor-pointer items-center justify-center rounded-lg border-2 text-sm font-semibold transition-all',
                    defaultDiaperAmount === da
                      ? 'border-emerald-400 bg-emerald-100 text-emerald-700'
                      : 'border-border bg-background text-foreground',
                  )}
                  onClick={() => setDefaultDiaperAmount(defaultDiaperAmount === da ? null : da)}
                >
                  {DIAPER_AMOUNT_LABELS[da]}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              className={cn(
                'h-10 cursor-pointer text-xs gap-1',
                savedSection === 'diaper' && 'border-green-400 bg-green-50 text-green-700',
              )}
              onClick={handleSaveDiaperDefault}
              disabled={!isDiaperChanged && savedSection !== 'diaper'}
            >
              {savedSection === 'diaper' ? <><Check className="h-3.5 w-3.5" />저장됨</> : '저장'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardContent className="flex flex-col gap-3 px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-blue-50 p-1.5 dark:bg-blue-950/40">
              <Download className="h-3.5 w-3.5 text-blue-700" strokeWidth={2} />
            </div>
            <Label className="text-sm font-semibold">데이터 내보내기</Label>
          </div>
          <Button
            variant="outline"
            className={cn(
              'h-10 cursor-pointer text-sm gap-1.5',
              exportDone && 'border-green-400 bg-green-50 text-green-700',
            )}
            onClick={handleExportCSV}
            disabled={exporting}
          >
            {exporting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                내보내는 중...
              </>
            ) : exportDone ? (
              <>
                <Check className="h-4 w-4" />
                다운로드 완료
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                CSV 다운로드
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            가족방의 전체 활동 기록을 CSV 파일로 다운로드합니다.
          </p>
        </CardContent>
      </Card>

      <InstallPrompt />

      <Button
        variant="outline"
        className="h-12 cursor-pointer text-base"
        onClick={handleLeave}
      >
        가족방 나가기
      </Button>

      <AlertDialog open={showDeleteBabyDialog !== null} onOpenChange={(open) => { if (!open) setShowDeleteBabyDialog(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>아기 프로필을 삭제하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 아기 프로필이 삭제됩니다. 활동 기록은 유지됩니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">취소</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
              onClick={() => showDeleteBabyDialog && handleDeleteBaby(showDeleteBabyDialog)}
            >
              삭제
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={kickTargetId !== null} onOpenChange={(open) => { if (!open) setKickTargetId(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>구성원을 내보내시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              해당 구성원을 가족방에서 내보냅니다.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">취소</AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive text-white hover:bg-destructive/90"
              onClick={() => kickTargetId && handleKickMember(kickTargetId)}
            >
              내보내기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showLeaveDialog} onOpenChange={setShowLeaveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isLastMember ? '모든 데이터가 삭제됩니다' : '가족방을 나가시겠습니까?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isLastMember
                ? '현재 이 가족방에 남은 멤버가 본인뿐입니다. 나가시면 가족방과 모든 기록 데이터가 영구적으로 삭제되며 복구할 수 없습니다.'
                : '가족방에서 나가면 이 기기에서 더 이상 기록을 볼 수 없습니다. 다른 가족 멤버의 데이터는 유지됩니다.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">취소</AlertDialogCancel>
            <AlertDialogAction
              className={cn(
                'cursor-pointer',
                isLastMember
                  ? 'bg-destructive text-white hover:bg-destructive/90'
                  : '',
              )}
              onClick={handleConfirmLeave}
            >
              나가기
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default SettingsPage
