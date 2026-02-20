import { Navigate, Outlet } from 'react-router-dom'
import { useFamilyStore } from '@/stores/familyStore'

const FamilyGuard = () => {
  const initialized = useFamilyStore((s) => s.initialized)
  const familyId = useFamilyStore((s) => s.familyId)

  if (!initialized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground">로딩 중...</p>
      </div>
    )
  }

  if (!familyId) {
    return <Navigate to="/join" replace />
  }

  return <Outlet />
}

export default FamilyGuard
