import { useState, useEffect } from 'react'
import { Download, Share, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const isIOS = () =>
  /iPad|iPhone|iPod/.test(navigator.userAgent) ||
  (navigator.userAgent.includes('Mac') && 'ontouchend' in document)

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  ('standalone' in navigator && (navigator as unknown as { standalone: boolean }).standalone)

const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showIOSGuide, setShowIOSGuide] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isStandalone()) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // iOS: beforeinstallprompt 미지원, 수동 안내 표시
    if (isIOS()) {
      let hiddenUntil: string | null = null
      try {
        hiddenUntil = localStorage.getItem('baby-memo-install-dismissed')
      } catch {
        // Safari 프라이빗 모드 등에서 QuotaExceededError 방지
      }
      if (!hiddenUntil || Date.now() > Number(hiddenUntil)) {
        setShowIOSGuide(true)
      }
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    await deferredPrompt.userChoice
    setDeferredPrompt(null)
  }

  const handleDismissIOS = () => {
    setShowIOSGuide(false)
    setDismissed(true)
    // 7일간 숨김
    try {
      localStorage.setItem('baby-memo-install-dismissed', String(Date.now() + 7 * 24 * 60 * 60 * 1000))
    } catch {
      // Safari 프라이빗 모드 등에서 QuotaExceededError 방지
    }
  }

  // 이미 앱으로 실행 중이면 숨김
  if (isStandalone()) return null

  // Android: 네이티브 설치 프롬프트
  if (deferredPrompt) {
    return (
      <Button
        variant="outline"
        className="h-10 w-full cursor-pointer gap-1.5 text-sm"
        onClick={handleInstall}
      >
        <Download className="h-4 w-4" />
        앱 설치하기
      </Button>
    )
  }

  // iOS: 수동 안내
  if (showIOSGuide && !dismissed) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="relative flex flex-col gap-2 px-4 py-4">
          <button
            type="button"
            className="absolute top-2 right-2 rounded-full p-1 text-muted-foreground hover:bg-muted"
            onClick={handleDismissIOS}
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2">
            <Download className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">홈 화면에 앱 추가</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Safari에서 하단의 <Share className="inline h-3.5 w-3.5 align-text-bottom" /> 공유 버튼을 누른 후
            <strong> "홈 화면에 추가"</strong>를 선택하세요.
          </p>
        </CardContent>
      </Card>
    )
  }

  return null
}

export default InstallPrompt
