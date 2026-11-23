import { useEffect, useRef } from 'react'

const LAYER_SPECS = [
  { speedMin: 560, speedMax: 740, lenMin: 26, lenMax: 44, widthMin: 0.75, widthMax: 1.15, alphaMin: 0.14, alphaMax: 0.28 },
  { speedMin: 820, speedMax: 1080, lenMin: 48, lenMax: 78, widthMin: 1.2, widthMax: 1.75, alphaMin: 0.32, alphaMax: 0.56 },
  { speedMin: 1180, speedMax: 1520, lenMin: 82, lenMax: 128, widthMin: 1.85, widthMax: 2.55, alphaMin: 0.55, alphaMax: 0.85 },
]

/**
 * Hàm sinh tia sét phân nhánh mềm mại bằng thuật toán Midpoint Displacement
 */
const generateBoltSegments = (x1, y1, x2, y2, displace, thickness) => {
  const segments = []
  const subdivide = (ax, ay, bx, by, disp, thick) => {
    if (disp < 4) {
      segments.push({ x1: ax, y1: ay, x2: bx, y2: by, thickness: thick })
      return
    }
    const midX = (ax + bx) * 0.5 + (Math.random() - 0.5) * disp
    const midY = (ay + by) * 0.5 + (Math.random() - 0.5) * (disp * 0.32)
    subdivide(ax, ay, midX, midY, disp * 0.54, thick)
    subdivide(midX, midY, bx, by, disp * 0.54, thick * 0.95)
  }
  subdivide(x1, y1, x2, y2, displace, thickness)
  return segments
}

/**
 * Component Nền Canvas Mưa Nghiêng 3 Lớp & Sấm Chớp Phân Nhánh (StormCardAnimate)
 * - High-DPI HTML5 Canvas: Mưa Vector LinearGradient 3 tầng + Nước bắn đáy + Mây mù
 * - Tia sét phân nhánh Midpoint Displacement + Quầng chớp bầu trời (Double-flicker)
 * - Tối ưu Batch Path Drawing 60 FPS, < 245 dòng
 */
export default function StormCardAnimate({
  active = true,
  windAngle = 28,
  rainCount = 210,
  rainSpeed = 1.15,
  lightningInterval = 1.5,
  showSplashes = true,
  children,
}) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)
  const requestRef = useRef(null)

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current, container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    let width = 800, height = 320, dpr = Math.min(window.devicePixelRatio || 1, 2)
    let drops = [], splashes = [], lightnings = [], mistClouds = []
    let skyFlashOpacity = 0, flashCenter = { x: 0.65, y: 0.1 }
    let nextLightningTimer = 0.6 + Math.random() * lightningInterval

    const createDrop = (randomY = true) => {
      const rand = Math.random()
      const layer = rand < 0.45 ? 0 : rand < 0.85 ? 1 : 2
      const spec = LAYER_SPECS[layer]
      const margin = Math.abs(Math.tan((windAngle * Math.PI) / 180) * height) + 200
      return {
        layer,
        x: -margin + Math.random() * (width + margin * 2),
        y: randomY ? Math.random() * (height + 140) - 100 : -40 - Math.random() * 120,
        speed: spec.speedMin + Math.random() * (spec.speedMax - spec.speedMin),
        length: spec.lenMin + Math.random() * (spec.lenMax - spec.lenMin),
        lineWidth: spec.widthMin + Math.random() * (spec.widthMax - spec.widthMin),
        alpha: spec.alphaMin + Math.random() * (spec.alphaMax - spec.alphaMin),
      }
    }

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect()
      width = Math.max(280, rect.width); height = Math.max(180, rect.height)
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (drops.length === 0) drops = Array.from({ length: rainCount }, () => createDrop(true))
      if (mistClouds.length === 0) {
        mistClouds = Array.from({ length: 4 }, (_, i) => ({
          x: (width / 3) * i, y: 20 + (i % 3) * 40,
          radiusX: 170 + Math.random() * 120, radiusY: 42 + Math.random() * 30,
          speed: 14 + Math.random() * 16, alpha: 0.04 + Math.random() * 0.04,
        }))
      }
    }

    updateCanvasSize()
    const resizeObserver = new ResizeObserver(updateCanvasSize)
    resizeObserver.observe(container)

    const spawnLightning = () => {
      const startX = width * (0.16 + Math.random() * 0.68)
      const endX = startX + Math.sin((windAngle * Math.PI) / 180) * 85 + (Math.random() - 0.5) * 130
      const endY = height * (0.65 + Math.random() * 0.32)
      const mainSegments = generateBoltSegments(startX, -10, endX, endY, 74, 2.5 + Math.random() * 0.7)
      const branches = []
      for (let i = 0, count = 2 + Math.floor(Math.random() * 3); i < count; i++) {
        const anchor = mainSegments[Math.floor(mainSegments.length * (0.15 + Math.random() * 0.6))]
        if (anchor) {
          const bEndX = anchor.x1 + (Math.random() > 0.5 ? 1 : -1) * (45 + Math.random() * 90)
          const bEndY = anchor.y1 + 50 + Math.random() * 85
          branches.push(...generateBoltSegments(anchor.x1, anchor.y1, bEndX, bEndY, 34, anchor.thickness * 0.55))
        }
      }
      lightnings.push({ mainSegments, branches, age: 0, maxAge: 0.42 + Math.random() * 0.2, flickerSeed: Math.random() * 100 })
      skyFlashOpacity = 0.78 + Math.random() * 0.22
      flashCenter = { x: startX / width, y: 0.08 }
    }

    let lastTime = performance.now()
    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05)
      lastTime = now
      ctx.clearRect(0, 0, width, height)

      // 1. Mây mù chuyển động ngang
      const windDir = windAngle >= 0 ? 1 : -1
      for (let i = 0; i < mistClouds.length; i++) {
        const m = mistClouds[i]
        m.x += m.speed * windDir * dt * rainSpeed
        if (m.x - m.radiusX > width) m.x = -m.radiusX
        if (m.x + m.radiusX < 0) m.x = width + m.radiusX
        const mistGrad = ctx.createRadialGradient(m.x, m.y, 10, m.x, m.y, m.radiusX)
        mistGrad.addColorStop(0, `rgba(186, 218, 255, ${m.alpha + skyFlashOpacity * 0.16})`)
        mistGrad.addColorStop(1, 'rgba(15, 23, 42, 0)')
        ctx.fillStyle = mistGrad; ctx.beginPath(); ctx.ellipse(m.x, m.y, m.radiusX, m.radiusY, 0, 0, Math.PI * 2); ctx.fill()
      }

      // 2. Bộ đếm sấm chớp tự động
      nextLightningTimer -= dt
      if (nextLightningTimer <= 0) {
        spawnLightning()
        nextLightningTimer = lightningInterval * (0.65 + Math.random() * 0.7)
      }

      // 3. Quầng chớp sáng bầu trời (Double-Flicker)
      if (skyFlashOpacity > 0.005) {
        const flicker = 0.78 + 0.22 * Math.sin(now * 0.065) * Math.cos(now * 0.032)
        const currentFlash = Math.min(1, skyFlashOpacity * flicker)
        const flashGrad = ctx.createRadialGradient(width * flashCenter.x, height * flashCenter.y, 10, width * flashCenter.x, height * flashCenter.y, width * 0.95)
        flashGrad.addColorStop(0, `rgba(224, 242, 254, ${currentFlash * 0.58})`)
        flashGrad.addColorStop(0.45, `rgba(147, 197, 253, ${currentFlash * 0.26})`)
        flashGrad.addColorStop(1, `rgba(30, 58, 138, ${currentFlash * 0.05})`)
        ctx.fillStyle = flashGrad; ctx.fillRect(0, 0, width, height)
        skyFlashOpacity = Math.max(0, skyFlashOpacity - dt * 2.4)
      }

      // 4. Vẽ tia sét phân nhánh (Batch Path 3 lớp: nhánh phụ, hào quang, lõi trắng)
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const bolt = lightnings[i]
        bolt.age += dt
        if (bolt.age >= bolt.maxAge) { lightnings.splice(i, 1); continue }
        const progress = bolt.age / bolt.maxAge
        const pulse = Math.sin(bolt.age * 75 + bolt.flickerSeed) > -0.25 ? 1 : 0.35
        const alpha = (1 - Math.pow(progress, 1.6)) * pulse

        ctx.save()
        ctx.lineCap = 'round'; ctx.lineJoin = 'round'
        ctx.shadowColor = 'rgba(147, 197, 253, 0.85)'; ctx.shadowBlur = 10
        ctx.strokeStyle = `rgba(191, 219, 254, ${alpha * 0.55})`; ctx.lineWidth = 1.2
        ctx.beginPath()
        for (let b = 0; b < bolt.branches.length; b++) {
          ctx.moveTo(bolt.branches[b].x1, bolt.branches[b].y1); ctx.lineTo(bolt.branches[b].x2, bolt.branches[b].y2)
        }
        ctx.stroke()

        ctx.shadowColor = 'rgba(96, 165, 250, 0.95)'; ctx.shadowBlur = 20
        ctx.strokeStyle = `rgba(224, 242, 254, ${alpha * 0.95})`; ctx.lineWidth = 2.6
        ctx.beginPath()
        for (let m = 0; m < bolt.mainSegments.length; m++) {
          ctx.moveTo(bolt.mainSegments[m].x1, bolt.mainSegments[m].y1); ctx.lineTo(bolt.mainSegments[m].x2, bolt.mainSegments[m].y2)
        }
        ctx.stroke()

        ctx.shadowBlur = 3; ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`; ctx.lineWidth = 1.15
        ctx.stroke()
        ctx.restore()
      }

      // 5. Hạt mưa nghiêng Vector LinearGradient 3 tầng
      const angleRad = (windAngle * Math.PI) / 180
      const sinA = Math.sin(angleRad), cosA = Math.cos(angleRad)
      const margin = Math.abs(Math.tan(angleRad) * height) + 200
      ctx.save()
      ctx.lineCap = 'round'
      for (let i = 0; i < drops.length; i++) {
        const d = drops[i]
        const actualSpeed = d.speed * rainSpeed
        d.x += sinA * actualSpeed * dt; d.y += cosA * actualSpeed * dt
        const tailX = d.x - sinA * d.length, tailY = d.y - cosA * d.length
        const headAlpha = Math.min(0.95, d.alpha + skyFlashOpacity * 0.35)
        const grad = ctx.createLinearGradient(tailX, tailY, d.x, d.y)
        grad.addColorStop(0, 'rgba(186, 230, 253, 0)')
        grad.addColorStop(0.55, `rgba(186, 230, 253, ${headAlpha * 0.42})`)
        grad.addColorStop(1, `rgba(240, 249, 255, ${headAlpha})`)
        ctx.strokeStyle = grad; ctx.lineWidth = d.lineWidth
        ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(d.x, d.y); ctx.stroke()

        if (d.y - d.length > height) {
          if (showSplashes && d.layer >= 1 && d.x > 0 && d.x < width && splashes.length < 60 && Math.random() < 0.4) {
            splashes.push({ x: d.x, y: height - 2, vx: (Math.random() - 0.5) * 60 + sinA * 32, vy: -(42 + Math.random() * 60), radius: 0.9 + Math.random(), alpha: 0.45 + Math.random() * 0.28 })
          }
          d.x = -margin + Math.random() * (width + margin * 2); d.y = -20 - Math.random() * 85
        }
      }
      ctx.restore()

      // 6. Hạt nước bắn nhẹ ở đáy Card
      if (showSplashes && splashes.length > 0) {
        for (let i = splashes.length - 1; i >= 0; i--) {
          const sp = splashes[i]
          sp.x += sp.vx * dt; sp.y += sp.vy * dt; sp.vy += 260 * dt; sp.alpha -= dt * 1.45
          if (sp.alpha <= 0 || sp.y > height + 4) { splashes.splice(i, 1); continue }
          ctx.fillStyle = `rgba(224, 242, 254, ${sp.alpha})`
          ctx.beginPath(); ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2); ctx.fill()
        }
      }
      requestRef.current = requestAnimationFrame(render)
    }

    requestRef.current = requestAnimationFrame(render)
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      resizeObserver.disconnect()
    }
  }, [active, windAngle, rainCount, rainSpeed, lightningInterval, showSplashes])

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden bg-gradient-to-br from-[#090f1d] via-[#0f1b33] to-[#081226] transition-all duration-300">
      {active && (
        <>
          <div className="pointer-events-none absolute -top-24 left-1/4 h-64 w-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 right-10 h-56 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full z-10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/35 to-transparent z-20" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-slate-950/65 to-transparent z-10" />
        </>
      )}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
