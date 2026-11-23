import { useEffect, useRef } from 'react'

const SUN_THEMES = {
  morning: { bgGradient: 'from-[#0c2d57] via-[#19578f] to-[#4fa3d1]', sunPos: { x: 0.78, y: 0.24 }, coreColor: [255, 253, 240], coronaColor: [254, 215, 102], rayColor: [255, 243, 176], bokehColors: [[254, 240, 138], [186, 230, 253], [253, 186, 116]], cloudTint: [255, 248, 225] },
  noon: { bgGradient: 'from-[#072247] via-[#0e4b87] to-[#2884b8]', sunPos: { x: 0.74, y: 0.16 }, coreColor: [255, 255, 250], coronaColor: [253, 224, 71], rayColor: [254, 249, 195], bokehColors: [[254, 240, 138], [125, 211, 252], [253, 224, 71]], cloudTint: [255, 253, 245] },
  sunset: { bgGradient: 'from-[#1f1135] via-[#6e2142] to-[#d96b27]', sunPos: { x: 0.82, y: 0.34 }, coreColor: [255, 247, 237], coronaColor: [251, 146, 60], rayColor: [253, 186, 116], bokehColors: [[251, 191, 36], [244, 114, 182], [253, 186, 116]], cloudTint: [254, 215, 170] },
}

const FLARE_NODES = [
  { t: 0.28, r: 18, type: 'circle', colorIdx: 0, alpha: 0.22 },
  { t: 0.46, r: 34, type: 'hex', colorIdx: 1, alpha: 0.16 },
  { t: 0.65, r: 14, type: 'circle', colorIdx: 2, alpha: 0.28 },
  { t: 0.85, r: 52, type: 'ring', colorIdx: 0, alpha: 0.14 },
  { t: 1.12, r: 26, type: 'hex', colorIdx: 2, alpha: 0.2 },
  { t: 1.38, r: 68, type: 'hex', colorIdx: 1, alpha: 0.12 },
  { t: 1.62, r: 19, type: 'circle', colorIdx: 0, alpha: 0.24 },
]

const drawHexagon = (ctx, x, y, radius, rotation = 0) => {
  ctx.beginPath()
  for (let i = 0; i < 6; i++) {
    const angle = rotation + (i * Math.PI) / 3
    const px = x + radius * Math.cos(angle), py = y + radius * Math.sin(angle)
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
  }
  ctx.closePath()
}

/**
 * Component Nền Canvas Trời Nắng Tia God Rays, Bokeh & Hạt Nắng (ShinyCardAnimate)
 * - High-DPI HTML5 Canvas với Screen Blending: 16 tia nắng Volumetric God Rays
 * - Quả cầu Mặt Trời + Tia ngang Anamorphic + Sóng bùng nổ ánh nắng (Solar Pulse)
 * - Quang học Lens Flare & Bokeh lục giác tương tác chuột Parallax + Hạt nắng vàng 3 tầng
 * - Độ dài < 235 dòng
 */
export default function ShinyCardAnimate({
  active = true, themeKey = 'noon', rayIntensity = 0.88, rayAngleOffset = -28,
  moteCount = 105, breezeSpeed = 1.0, enableLensFlare = true, autoSolarPulse = true, children,
}) {
  const canvasRef = useRef(null), containerRef = useRef(null), requestRef = useRef(null)
  const pointerRef = useRef({ targetX: 0.35, targetY: 0.55, currentX: 0.35, currentY: 0.55, isHovering: false })
  const theme = SUN_THEMES[themeKey] || SUN_THEMES.noon

  useEffect(() => {
    if (!active) return
    const canvas = canvasRef.current, container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    let width = 860, height = 340, dpr = Math.min(window.devicePixelRatio || 1, 2)
    let motes = [], godRays = [], clouds = [], solarWaves = []
    let solarBoost = 0, nextPulseTimer = 4.2 + Math.random() * 3.0

    const createMote = (randomPos = true) => {
      const rand = Math.random(), layer = rand < 0.45 ? 0 : rand < 0.82 ? 1 : 2
      const specs = [
        { rMin: 1.2, rMax: 2.3, speedX: 14, speedY: -7, alpha: 0.32 },
        { rMin: 2.4, rMax: 4.2, speedX: 24, speedY: -12, alpha: 0.58 },
        { rMin: 4.8, rMax: 8.5, speedX: 36, speedY: -18, alpha: 0.45 },
      ][layer]
      return {
        layer, x: randomPos ? Math.random() * width : -20, y: randomPos ? Math.random() * height : Math.random() * height,
        radius: specs.rMin + Math.random() * (specs.rMax - specs.rMin),
        vx: specs.speedX * (0.7 + Math.random() * 0.6), vy: specs.speedY * (0.6 + Math.random() * 0.8),
        baseAlpha: specs.alpha * (0.65 + Math.random() * 0.5), twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.5 + Math.random() * 2.8, waveOffset: Math.random() * Math.PI * 2,
      }
    }

    const updateSize = () => {
      const rect = container.getBoundingClientRect()
      width = Math.max(280, rect.width); height = Math.max(180, rect.height); dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr); canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (godRays.length === 0) {
        godRays = Array.from({ length: 16 }, (_, idx) => ({
          spreadOffset: ((idx / 15 - 0.5) * 2) * 36 + (Math.random() - 0.5) * 4.5,
          nearWidth: 6 + Math.random() * 14, farWidth: 55 + Math.random() * 115,
          lengthRatio: 1.15 + Math.random() * 0.55, baseAlpha: 0.055 + Math.random() * 0.085,
          phase: Math.random() * Math.PI * 2, speed: 0.55 + Math.random() * 0.85,
        }))
      }
      if (clouds.length === 0) {
        clouds = Array.from({ length: 5 }, (_, i) => ({
          x: (width / 4) * i, y: height * (0.14 + (i % 3) * 0.22),
          rx: 150 + Math.random() * 130, ry: 28 + Math.random() * 24,
          speed: 8 + Math.random() * 12, alpha: 0.055 + Math.random() * 0.05,
        }))
      }
      if (motes.length === 0) motes = Array.from({ length: moteCount }, () => createMote(true))
    }

    updateSize()
    const resizeObserver = new ResizeObserver(updateSize)
    resizeObserver.observe(container)

    let lastTime = performance.now()
    const render = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05); lastTime = now
      const elapsed = now * 0.001, ptr = pointerRef.current
      if (!ptr.isHovering) {
        ptr.targetX = 0.32 + Math.sin(elapsed * 0.45) * 0.14; ptr.targetY = 0.58 + Math.cos(elapsed * 0.35) * 0.1
      }
      ptr.currentX += (ptr.targetX - ptr.currentX) * Math.min(1, dt * 4.5)
      ptr.currentY += (ptr.targetY - ptr.currentY) * Math.min(1, dt * 4.5)
      const sunX = width * theme.sunPos.x + (ptr.currentX - 0.5) * -28, sunY = height * theme.sunPos.y + (ptr.currentY - 0.5) * -18

      if (autoSolarPulse) {
        nextPulseTimer -= dt
        if (nextPulseTimer <= 0) {
          solarBoost = 0.78; solarWaves.push({ radius: 12, maxRadius: Math.max(width, height) * 1.15, alpha: 0.45 })
          nextPulseTimer = 4.5 + Math.random() * 3.5
        }
      }
      if (solarBoost > 0.001) solarBoost = Math.max(0, solarBoost - dt * 0.85)
      ctx.clearRect(0, 0, width, height)
      const [cr, cg, cb] = theme.coreColor, [corR, corG, corB] = theme.coronaColor
      const [rayR, rayG, rayB] = theme.rayColor, [cldR, cldG, cldB] = theme.cloudTint

      for (let i = 0; i < clouds.length; i++) {
        const c = clouds[i]
        c.x += c.speed * breezeSpeed * dt; if (c.x - c.rx > width) c.x = -c.rx
        const cGrad = ctx.createRadialGradient(c.x, c.y, 10, c.x, c.y, c.rx), boostAlpha = c.alpha + solarBoost * 0.04
        cGrad.addColorStop(0, `rgba(${cldR}, ${cldG}, ${cldB}, ${boostAlpha})`)
        cGrad.addColorStop(0.55, `rgba(${corR}, ${corG}, ${corB}, ${boostAlpha * 0.45})`)
        cGrad.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`)
        ctx.fillStyle = cGrad; ctx.beginPath(); ctx.ellipse(c.x, c.y, c.rx, c.ry, 0, 0, Math.PI * 2); ctx.fill()
      }

      ctx.save(); ctx.globalCompositeOperation = 'screen'
      const bigGlowRadius = Math.max(width, height) * (0.72 + solarBoost * 0.18)
      const bigGlow = ctx.createRadialGradient(sunX, sunY, 4, sunX, sunY, bigGlowRadius)
      bigGlow.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${0.55 + solarBoost * 0.25})`)
      bigGlow.addColorStop(0.18, `rgba(${corR}, ${corG}, ${corB}, ${0.34 + solarBoost * 0.18})`)
      bigGlow.addColorStop(0.48, `rgba(${rayR}, ${rayG}, ${rayB}, ${0.12 + solarBoost * 0.08})`)
      bigGlow.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`)
      ctx.fillStyle = bigGlow; ctx.fillRect(0, 0, width, height)

      const baseAngleDeg = 125 + rayAngleOffset, maxRayLen = Math.hypot(width, height) * 1.15
      for (let i = 0; i < godRays.length; i++) {
        const ray = godRays[i], breathe = 0.65 + 0.35 * Math.sin(elapsed * ray.speed + ray.phase)
        const angleRad = ((baseAngleDeg + ray.spreadOffset) * Math.PI) / 180, rayLength = maxRayLen * ray.lengthRatio
        const cosA = Math.cos(angleRad), sinA = Math.sin(angleRad), perpX = -sinA, perpY = cosA
        const nearW = ray.nearWidth, farW = ray.farWidth * (0.9 + 0.2 * breathe)
        const endCenterX = sunX + cosA * rayLength, endCenterY = sunY + sinA * rayLength
        const alpha = ray.baseAlpha * breathe * rayIntensity * (1 + solarBoost * 0.85)
        const rayGrad = ctx.createLinearGradient(sunX, sunY, endCenterX, endCenterY)
        rayGrad.addColorStop(0, `rgba(${cr}, ${cg}, ${cb}, ${alpha * 1.35})`)
        rayGrad.addColorStop(0.28, `rgba(${rayR}, ${rayG}, ${rayB}, ${alpha})`)
        rayGrad.addColorStop(0.68, `rgba(${corR}, ${corG}, ${corB}, ${alpha * 0.35})`)
        rayGrad.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`)
        ctx.fillStyle = rayGrad; ctx.beginPath()
        ctx.moveTo(sunX + perpX * nearW, sunY + perpY * nearW); ctx.lineTo(sunX - perpX * nearW, sunY - perpY * nearW)
        ctx.lineTo(endCenterX - perpX * farW, endCenterY - perpY * farW); ctx.lineTo(endCenterX + perpX * farW, endCenterY + perpY * farW)
        ctx.closePath(); ctx.fill()
      }

      const streakWidth = width * (0.55 + solarBoost * 0.25)
      const streakGrad = ctx.createLinearGradient(sunX - streakWidth, sunY, sunX + streakWidth, sunY)
      streakGrad.addColorStop(0, `rgba(${corR}, ${corG}, ${corB}, 0)`)
      streakGrad.addColorStop(0.42, `rgba(${rayR}, ${rayG}, ${rayB}, ${0.18 + solarBoost * 0.15})`)
      streakGrad.addColorStop(0.5, `rgba(255, 255, 255, ${0.65 + solarBoost * 0.25})`)
      streakGrad.addColorStop(0.58, `rgba(${rayR}, ${rayG}, ${rayB}, ${0.18 + solarBoost * 0.15})`)
      streakGrad.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`)
      ctx.fillStyle = streakGrad; ctx.beginPath(); ctx.ellipse(sunX, sunY, streakWidth, 3.2 + solarBoost * 2.5, 0, 0, Math.PI * 2); ctx.fill()

      const coreRadius = 68 * (1 + 0.05 * Math.sin(elapsed * 2.4) + solarBoost * 0.22)
      const sunCoreGrad = ctx.createRadialGradient(sunX, sunY, 2, sunX, sunY, coreRadius)
      sunCoreGrad.addColorStop(0, 'rgba(255, 255, 255, 1)'); sunCoreGrad.addColorStop(0.26, `rgba(${cr}, ${cg}, ${cb}, 0.92)`)
      sunCoreGrad.addColorStop(0.6, `rgba(${corR}, ${corG}, ${corB}, 0.42)`); sunCoreGrad.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`)
      ctx.fillStyle = sunCoreGrad; ctx.beginPath(); ctx.arc(sunX, sunY, coreRadius, 0, Math.PI * 2); ctx.fill()

      for (let i = solarWaves.length - 1; i >= 0; i--) {
        const w = solarWaves[i]; w.radius += dt * 520; w.alpha -= dt * 0.52
        if (w.alpha <= 0 || w.radius > w.maxRadius) { solarWaves.splice(i, 1); continue }
        const ringGrad = ctx.createRadialGradient(sunX, sunY, Math.max(1, w.radius - 45), sunX, sunY, w.radius + 45)
        ringGrad.addColorStop(0, `rgba(${corR}, ${corG}, ${corB}, 0)`)
        ringGrad.addColorStop(0.5, `rgba(255, 250, 220, ${w.alpha * 0.45})`)
        ringGrad.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`)
        ctx.fillStyle = ringGrad; ctx.beginPath(); ctx.arc(sunX, sunY, w.radius + 45, 0, Math.PI * 2); ctx.fill()
      }

      if (enableLensFlare) {
        const axisDX = width * ptr.currentX - sunX, axisDY = height * ptr.currentY - sunY
        FLARE_NODES.forEach((node, idx) => {
          const fx = sunX + axisDX * node.t, fy = sunY + axisDY * node.t
          const [br, bg, bb] = theme.bokehColors[node.colorIdx % theme.bokehColors.length]
          const nodeAlpha = node.alpha * (0.85 + solarBoost * 0.65) * rayIntensity
          const g = ctx.createRadialGradient(fx, fy, node.type === 'ring' ? node.r * 0.65 : 1.5, fx, fy, node.r)
          if (node.type === 'circle') {
            g.addColorStop(0, `rgba(255, 255, 255, ${nodeAlpha})`); g.addColorStop(0.6, `rgba(${br}, ${bg}, ${bb}, ${nodeAlpha * 0.55})`)
            g.addColorStop(1, `rgba(${br}, ${bg}, ${bb}, 0)`); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, node.r, 0, Math.PI * 2); ctx.fill()
          } else if (node.type === 'ring') {
            g.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, 0)`); g.addColorStop(0.8, `rgba(${br}, ${bg}, ${bb}, ${nodeAlpha * 0.85})`)
            g.addColorStop(0.92, `rgba(255, 255, 255, ${nodeAlpha})`); g.addColorStop(1, `rgba(${br}, ${bg}, ${bb}, 0)`)
            ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, node.r, 0, Math.PI * 2); ctx.fill()
          } else {
            g.addColorStop(0, `rgba(${br}, ${bg}, ${bb}, ${nodeAlpha * 0.35})`); g.addColorStop(0.78, `rgba(${br}, ${bg}, ${bb}, ${nodeAlpha * 0.85})`)
            g.addColorStop(1, `rgba(${br}, ${bg}, ${bb}, 0)`); ctx.fillStyle = g; drawHexagon(ctx, fx, fy, node.r, elapsed * 0.15 + idx); ctx.fill()
          }
        })
      }

      for (let i = 0; i < motes.length; i++) {
        const m = motes[i]
        m.x += m.vx * breezeSpeed * dt; m.y += (m.vy + Math.sin(elapsed * 1.4 + m.waveOffset) * 10) * breezeSpeed * dt
        if (m.x - m.radius > width + 20) m.x = -20; if (m.x + m.radius < -25) m.x = width + 20
        if (m.y + m.radius < -20) m.y = height + 20; if (m.y - m.radius > height + 20) m.y = -20
        const sunProx = Math.max(0, 1 - Math.hypot(m.x - sunX, m.y - sunY) / (width * 0.65))
        const twinkle = 0.55 + 0.45 * Math.sin(elapsed * m.twinkleSpeed + m.twinklePhase)
        const finalAlpha = Math.min(0.95, m.baseAlpha * twinkle * (1 + sunProx * 0.9 + solarBoost * 0.6))
        const moteGrad = ctx.createRadialGradient(m.x, m.y, 0.2, m.x, m.y, m.radius)
        moteGrad.addColorStop(0, `rgba(255, 255, 255, ${finalAlpha})`); moteGrad.addColorStop(0.45, `rgba(${rayR}, ${rayG}, ${rayB}, ${finalAlpha * 0.75})`)
        moteGrad.addColorStop(1, `rgba(${corR}, ${corG}, ${corB}, 0)`); ctx.fillStyle = moteGrad; ctx.beginPath(); ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2); ctx.fill()
      }

      ctx.restore()
      requestRef.current = requestAnimationFrame(render)
    }

    requestRef.current = requestAnimationFrame(render)
    return () => { if (requestRef.current) cancelAnimationFrame(requestRef.current); resizeObserver.disconnect() }
  }, [active, theme, rayIntensity, rayAngleOffset, moteCount, breezeSpeed, enableLensFlare, autoSolarPulse])

  const handleMouseMove = (e) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    pointerRef.current.targetX = Math.max(0.05, Math.min(0.95, (e.clientX - rect.left) / rect.width))
    pointerRef.current.targetY = Math.max(0.05, Math.min(0.95, (e.clientY - rect.top) / rect.height))
    pointerRef.current.isHovering = true
  }

  return (
    <div ref={containerRef} onMouseMove={handleMouseMove} onMouseLeave={() => { pointerRef.current.isHovering = false }} className={`relative w-full overflow-hidden bg-gradient-to-br ${theme.bgGradient} transition-colors duration-700`}>
      {active && (
        <>
          <div className="pointer-events-none absolute -top-24 right-10 h-64 w-64 rounded-full bg-amber-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 left-12 h-56 w-72 rounded-full bg-sky-300/10 blur-3xl" />
          <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full z-10" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-amber-200/60 to-transparent z-20" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/45 to-transparent z-10" />
        </>
      )}
      <div className="relative z-20">{children}</div>
    </div>
  )
}
