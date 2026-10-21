/**
 * Bộ mã hoá QR Code (Model 2) tối giản cho link gọi món tại bàn.
 *
 * - Chế độ byte (UTF-8), mức sửa lỗi M, phiên bản 1–10 (tối đa 213 byte) — đủ cho URL
 *   `/dine/{token}`. Thuật toán theo chuẩn ISO/IEC 18004, tham khảo cách triển khai
 *   của Project Nayuki (MIT).
 * - Sinh hoàn toàn trên trình duyệt để token bàn không bị gửi tới dịch vụ bên thứ ba.
 */

const ECC_CODEWORDS_PER_BLOCK_M = [-1, 10, 16, 26, 18, 24, 16, 18, 22, 22, 26]
const NUM_BLOCKS_M = [-1, 1, 1, 1, 2, 2, 4, 4, 4, 5, 5]
const FORMAT_BITS_M = 0
const MAX_VERSION = 10

const getBit = (value, index) => ((value >>> index) & 1) !== 0

const numRawDataModules = (version) => {
  let result = (16 * version + 128) * version + 64
  if (version >= 2) {
    const numAlign = Math.floor(version / 7) + 2
    result -= (25 * numAlign - 10) * numAlign - 55
    if (version >= 7) result -= 36
  }
  return result
}

const numDataCodewords = (version) =>
  Math.floor(numRawDataModules(version) / 8) - ECC_CODEWORDS_PER_BLOCK_M[version] * NUM_BLOCKS_M[version]

const alignmentPositions = (version, size) => {
  if (version === 1) return []
  const numAlign = Math.floor(version / 7) + 2
  const step = Math.ceil((version * 4 + 4) / (numAlign * 2 - 2)) * 2
  const result = [6]
  for (let position = size - 7; result.length < numAlign; position -= step) result.splice(1, 0, position)
  return result
}

const gfMultiply = (x, y) => {
  let z = 0
  for (let i = 7; i >= 0; i -= 1) {
    z = (z << 1) ^ ((z >>> 7) * 0x11d)
    z ^= ((y >>> i) & 1) * x
  }
  return z & 0xff
}

const reedSolomonDivisor = (degree) => {
  const result = new Array(degree).fill(0)
  result[degree - 1] = 1
  let root = 1
  for (let i = 0; i < degree; i += 1) {
    for (let j = 0; j < result.length; j += 1) {
      result[j] = gfMultiply(result[j], root)
      if (j + 1 < result.length) result[j] ^= result[j + 1]
    }
    root = gfMultiply(root, 0x02)
  }
  return result
}

const reedSolomonRemainder = (data, divisor) => {
  const result = divisor.map(() => 0)
  data.forEach((byte) => {
    const factor = byte ^ result.shift()
    result.push(0)
    divisor.forEach((coefficient, index) => {
      result[index] ^= gfMultiply(coefficient, factor)
    })
  })
  return result
}

const encodeData = (bytes, version) => {
  const bits = []
  const push = (value, length) => {
    for (let i = length - 1; i >= 0; i -= 1) bits.push((value >>> i) & 1)
  }
  push(0b0100, 4)
  push(bytes.length, version < 10 ? 8 : 16)
  bytes.forEach((byte) => push(byte, 8))

  const capacityBits = numDataCodewords(version) * 8
  push(0, Math.min(4, capacityBits - bits.length))
  push(0, (8 - (bits.length % 8)) % 8)

  const codewords = []
  for (let i = 0; i < bits.length; i += 8) {
    codewords.push(bits.slice(i, i + 8).reduce((value, bit) => (value << 1) | bit, 0))
  }
  for (let pad = 0xec; codewords.length < numDataCodewords(version); pad ^= 0xec ^ 0x11) codewords.push(pad)
  return codewords
}

const addEccAndInterleave = (data, version) => {
  const numBlocks = NUM_BLOCKS_M[version]
  const blockEccLength = ECC_CODEWORDS_PER_BLOCK_M[version]
  const rawCodewords = Math.floor(numRawDataModules(version) / 8)
  const numShortBlocks = numBlocks - (rawCodewords % numBlocks)
  const shortBlockLength = Math.floor(rawCodewords / numBlocks)
  const divisor = reedSolomonDivisor(blockEccLength)
  const blocks = []

  for (let i = 0, offset = 0; i < numBlocks; i += 1) {
    const block = data.slice(offset, offset + shortBlockLength - blockEccLength + (i < numShortBlocks ? 0 : 1))
    offset += block.length
    const ecc = reedSolomonRemainder(block, divisor)
    if (i < numShortBlocks) block.push(0)
    blocks.push(block.concat(ecc))
  }

  const result = []
  for (let i = 0; i < blocks[0].length; i += 1) {
    blocks.forEach((block, j) => {
      if (i !== shortBlockLength - blockEccLength || j >= numShortBlocks) result.push(block[i])
    })
  }
  return result
}

const MASKS = [
  (x, y) => (x + y) % 2 === 0,
  (x, y) => y % 2 === 0,
  (x) => x % 3 === 0,
  (x, y) => (x + y) % 3 === 0,
  (x, y) => (Math.floor(x / 3) + Math.floor(y / 2)) % 2 === 0,
  (x, y) => ((x * y) % 2) + ((x * y) % 3) === 0,
  (x, y) => (((x * y) % 2) + ((x * y) % 3)) % 2 === 0,
  (x, y) => (((x + y) % 2) + ((x * y) % 3)) % 2 === 0,
]

class QrBuilder {
  constructor(version) {
    this.version = version
    this.size = version * 4 + 17
    this.modules = Array.from({ length: this.size }, () => new Array(this.size).fill(false))
    this.isFunction = Array.from({ length: this.size }, () => new Array(this.size).fill(false))
  }

  setFunction(x, y, isDark) {
    this.modules[y][x] = isDark
    this.isFunction[y][x] = true
  }

  drawFunctionPatterns() {
    const { size } = this
    for (let i = 0; i < size; i += 1) {
      this.setFunction(6, i, i % 2 === 0)
      this.setFunction(i, 6, i % 2 === 0)
    }
    this.drawFinder(3, 3)
    this.drawFinder(size - 4, 3)
    this.drawFinder(3, size - 4)

    const positions = alignmentPositions(this.version, size)
    const count = positions.length
    for (let i = 0; i < count; i += 1) {
      for (let j = 0; j < count; j += 1) {
        const isFinderCorner = (i === 0 && j === 0) || (i === 0 && j === count - 1) || (i === count - 1 && j === 0)
        if (!isFinderCorner) this.drawAlignment(positions[i], positions[j])
      }
    }
    this.drawFormatBits(0)
    this.drawVersion()
  }

  drawFinder(x, y) {
    for (let dy = -4; dy <= 4; dy += 1) {
      for (let dx = -4; dx <= 4; dx += 1) {
        const distance = Math.max(Math.abs(dx), Math.abs(dy))
        const xx = x + dx
        const yy = y + dy
        if (xx >= 0 && xx < this.size && yy >= 0 && yy < this.size) this.setFunction(xx, yy, distance !== 2 && distance !== 4)
      }
    }
  }

  drawAlignment(x, y) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) this.setFunction(x + dx, y + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1)
    }
  }

  drawFormatBits(mask) {
    const data = (FORMAT_BITS_M << 3) | mask
    let remainder = data
    for (let i = 0; i < 10; i += 1) remainder = (remainder << 1) ^ ((remainder >>> 9) * 0x537)
    const bits = ((data << 10) | remainder) ^ 0x5412
    const { size } = this

    for (let i = 0; i <= 5; i += 1) this.setFunction(8, i, getBit(bits, i))
    this.setFunction(8, 7, getBit(bits, 6))
    this.setFunction(8, 8, getBit(bits, 7))
    this.setFunction(7, 8, getBit(bits, 8))
    for (let i = 9; i < 15; i += 1) this.setFunction(14 - i, 8, getBit(bits, i))

    for (let i = 0; i < 8; i += 1) this.setFunction(size - 1 - i, 8, getBit(bits, i))
    for (let i = 8; i < 15; i += 1) this.setFunction(8, size - 15 + i, getBit(bits, i))
    this.setFunction(8, size - 8, true)
  }

  drawVersion() {
    if (this.version < 7) return
    let remainder = this.version
    for (let i = 0; i < 12; i += 1) remainder = (remainder << 1) ^ ((remainder >>> 11) * 0x1f25)
    const bits = (this.version << 12) | remainder
    for (let i = 0; i < 18; i += 1) {
      const bit = getBit(bits, i)
      const a = this.size - 11 + (i % 3)
      const b = Math.floor(i / 3)
      this.setFunction(a, b, bit)
      this.setFunction(b, a, bit)
    }
  }

  drawCodewords(codewords) {
    const { size } = this
    let bitIndex = 0
    for (let right = size - 1; right >= 1; right -= 2) {
      if (right === 6) right = 5
      for (let vertical = 0; vertical < size; vertical += 1) {
        for (let j = 0; j < 2; j += 1) {
          const x = right - j
          const upward = ((right + 1) & 2) === 0
          const y = upward ? size - 1 - vertical : vertical
          if (!this.isFunction[y][x] && bitIndex < codewords.length * 8) {
            this.modules[y][x] = getBit(codewords[bitIndex >>> 3], 7 - (bitIndex & 7))
            bitIndex += 1
          }
        }
      }
    }
  }

  applyMask(mask) {
    const test = MASKS[mask]
    for (let y = 0; y < this.size; y += 1) {
      for (let x = 0; x < this.size; x += 1) {
        if (!this.isFunction[y][x] && test(x, y)) this.modules[y][x] = !this.modules[y][x]
      }
    }
  }

  /** Điểm phạt rút gọn (luật 1, 2, 4) để chọn mặt nạ dễ quét nhất. */
  penalty() {
    const { size, modules } = this
    let score = 0
    for (let y = 0; y < size; y += 1) {
      let runX = 1
      let runY = 1
      for (let x = 1; x < size; x += 1) {
        if (modules[y][x] === modules[y][x - 1]) {
          runX += 1
          if (runX === 5) score += 3
          else if (runX > 5) score += 1
        } else runX = 1
        if (modules[x][y] === modules[x - 1][y]) {
          runY += 1
          if (runY === 5) score += 3
          else if (runY > 5) score += 1
        } else runY = 1
      }
    }
    let dark = 0
    for (let y = 0; y < size; y += 1) {
      for (let x = 0; x < size; x += 1) {
        if (modules[y][x]) dark += 1
        if (x < size - 1 && y < size - 1) {
          const color = modules[y][x]
          if (color === modules[y][x + 1] && color === modules[y + 1][x] && color === modules[y + 1][x + 1]) score += 3
        }
      }
    }
    const total = size * size
    score += (Math.ceil(Math.abs(dark * 20 - total * 10) / total) - 1) * 10
    return score
  }
}

/**
 * @param {string} text
 * @returns {{ size: number, modules: boolean[][] }}
 */
export const createQrMatrix = (text) => {
  const bytes = Array.from(new TextEncoder().encode(text))
  let version = 1
  while (version <= MAX_VERSION && (4 + (version < 10 ? 8 : 16) + bytes.length * 8) > numDataCodewords(version) * 8) version += 1
  if (version > MAX_VERSION) throw new Error('Nội dung quá dài để tạo mã QR.')

  const codewords = addEccAndInterleave(encodeData(bytes, version), version)
  let best = null
  let bestPenalty = Infinity

  for (let mask = 0; mask < MASKS.length; mask += 1) {
    const builder = new QrBuilder(version)
    builder.drawFunctionPatterns()
    builder.drawCodewords(codewords)
    builder.applyMask(mask)
    builder.drawFormatBits(mask)
    const penalty = builder.penalty()
    if (penalty < bestPenalty) {
      best = builder
      bestPenalty = penalty
    }
  }

  return { size: best.size, modules: best.modules }
}
