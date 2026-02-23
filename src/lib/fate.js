// 简单的伪随机数生成器，结合用户熵
export function generateLine(seedInput) {
  // 模拟复杂的哈希计算
  let hash = 0
  for (let i = 0; i < seedInput.length; i++) {
    hash = (hash << 5) - hash + seedInput.charCodeAt(i)
    hash |= 0
  }
  // 结合时间戳微秒级
  const timeEntropy = new Date().getTime()
  const result = Math.abs(hash + timeEntropy) % 2
  // 0 为阴 (Yin), 1 为阳 (Yang)
  return result
}
