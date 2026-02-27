export const roundToNearest5 = (date: Date): Date => {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  const remainder = minutes % 5
  if (remainder < 3) {
    rounded.setMinutes(minutes - remainder, 0, 0)
  } else {
    rounded.setMinutes(minutes + (5 - remainder), 0, 0)
  }
  // 5분 단위 ceiling까지 허용 (예: 10:43이면 10:45까지 허용)
  const FIVE_MIN = 5 * 60000
  const maxTime = Math.ceil(Date.now() / FIVE_MIN) * FIVE_MIN
  if (rounded.getTime() > maxTime) {
    rounded.setMinutes(rounded.getMinutes() - 5)
  }
  return rounded
}
