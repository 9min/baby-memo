export const roundToNearest5 = (date: Date): Date => {
  const rounded = new Date(date)
  const minutes = rounded.getMinutes()
  const remainder = minutes % 5
  if (remainder < 3) {
    rounded.setMinutes(minutes - remainder, 0, 0)
  } else {
    rounded.setMinutes(minutes + (5 - remainder), 0, 0)
  }
  if (rounded > new Date()) {
    rounded.setMinutes(rounded.getMinutes() - 5)
  }
  return rounded
}
