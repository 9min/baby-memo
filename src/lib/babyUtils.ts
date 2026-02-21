import { differenceInDays } from 'date-fns'

export const formatBabyAge = (birthdate: string): string => {
  const birth = new Date(birthdate)
  const now = new Date()
  const totalDays = differenceInDays(now, birth)

  if (totalDays < 0) return ''

  return `D+${totalDays + 1}`
}
