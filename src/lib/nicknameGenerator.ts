const ADJECTIVES = [
  '귀여운', '사랑스러운', '상냥한', '용감한', '밝은',
  '포근한', '씩씩한', '다정한', '활발한', '깜찍한',
  '느긋한', '행복한', '장난꾸러기', '똑똑한', '명랑한',
]

const ANIMALS = [
  '토끼', '곰돌이', '펭귄', '여우', '고양이',
  '판다', '코알라', '다람쥐', '강아지', '햄스터',
  '수달', '부엉이', '고슴도치', '아기사슴', '물개',
]

export const generateNickname = (existingNicknames: string[] = []): string => {
  const existing = new Set(existingNicknames)
  const maxAttempts = ADJECTIVES.length * ANIMALS.length

  for (let i = 0; i < maxAttempts; i++) {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    const nickname = `${adj} ${animal}`
    if (!existing.has(nickname)) return nickname
  }

  // Fallback: append number, ensure uniqueness
  let fallback: string
  do {
    const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)]
    const animal = ANIMALS[Math.floor(Math.random() * ANIMALS.length)]
    fallback = `${adj} ${animal}${Math.floor(Math.random() * 100)}`
  } while (existing.has(fallback))
  return fallback
}
