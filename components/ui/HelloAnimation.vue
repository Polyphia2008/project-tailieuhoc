<script setup lang="ts">
/**
 * HelloAnimation — hieu ung chao mung sau khi dang ky lan dau.
 *
 * Timeline:
 *   0.00s  background gradient fade-in
 *   0.30s  check icon: vien tron ve + dau tich scale/rotate
 *   0.50s  confetti ban ra tu tam icon (3 dot)
 *   1.38s  chu "hello" (Dancing Script) fade-in + translateY(2px -> 0)
 *   1.90s  tieu de + mo ta + nut CTA
 */
const props = withDefaults(
  defineProps<{
    name?: string
    title?: string
    desc?: string
    cta?: string
    confetti?: boolean
  }>(),
  { name: 'bạn', title: '', desc: '', cta: 'Khám phá ngay', confetti: true }
)
const emit = defineEmits<{ cta: [] }>()

const canvasEl = ref<HTMLCanvasElement | null>(null)
let raf = 0
let timers: number[] = []
let onResize: (() => void) | null = null

/** Confetti nhe bang canvas 2D, khong can thu vien ngoai */
function runConfetti() {
  const cv = canvasEl.value
  if (!cv || !props.confetti) return
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  const resize = () => {
    cv.width = cv.clientWidth * dpr
    cv.height = cv.clientHeight * dpr
  }
  resize()
  onResize = resize
  window.addEventListener('resize', resize)

  const ctx = cv.getContext('2d')
  if (!ctx) return

  const COLORS = ['#60a5fa', '#34d399', '#fbbf24', '#f472b6', '#a78bfa', '#ffffff']
  const cx = cv.width / 2
  const cy = cv.height * 0.36
  type P = { x: number; y: number; vx: number; vy: number; r: number; c: string; rot: number; vr: number; life: number }
  const parts: P[] = []

  function burst(count: number, power: number) {
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2
      const sp = (0.6 + Math.random()) * power * dpr
      parts.push({
        x: cx, y: cy,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1.4 * dpr,
        r: (2.2 + Math.random() * 3) * dpr,
        c: COLORS[(Math.random() * COLORS.length) | 0],
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.28,
        life: 1
      })
    }
  }

  // Ban theo 3 dot cho tu nhien
  timers = [
    window.setTimeout(() => burst(70, 4.4), 500),
    window.setTimeout(() => burst(45, 3.4), 780),
    window.setTimeout(() => burst(35, 2.8), 1100)
  ]

  const tick = () => {
    ctx.clearRect(0, 0, cv.width, cv.height)
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i]
      p.vy += 0.052 * dpr        // gravity
      p.vx *= 0.992              // drag
      p.vy *= 0.992
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      p.life -= 0.0058
      if (p.life <= 0 || p.y > cv.height + 24) { parts.splice(i, 1); continue }
      ctx.save()
      ctx.globalAlpha = Math.max(0, Math.min(1, p.life))
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.fillStyle = p.c
      ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r)
      ctx.restore()
    }
    raf = requestAnimationFrame(tick)
  }
  raf = requestAnimationFrame(tick)
}

onMounted(runConfetti)
onBeforeUnmount(() => {
  timers.forEach((t) => clearTimeout(t))
  if (raf) cancelAnimationFrame(raf)
  if (onResize) window.removeEventListener('resize', onResize)
})
</script>

<template>
  <div class="hello-screen">
    <!-- Nen gradient toi + hai vung sang -->
    <div class="hello-bg" aria-hidden="true">
      <span class="hello-bg__glow hello-bg__glow--a" />
      <span class="hello-bg__glow hello-bg__glow--b" />
      <span class="hello-bg__grid" />
    </div>

    <!-- Confetti -->
    <canvas ref="canvasEl" class="hello-confetti" aria-hidden="true" />

    <div class="hello-inner">
      <!-- Icon check -->
      <div class="hello-icon">
        <svg viewBox="0 0 52 52" class="hello-icon__svg" role="img" aria-label="Thành công">
          <circle class="hello-circle" cx="26" cy="26" r="24" />
          <path class="hello-check" d="M14.5 27 L22 34.2 L38 18" />
        </svg>
        <span class="hello-icon__ring" aria-hidden="true" />
      </div>

      <!-- Chu "hello" viet tay -->
      <svg viewBox="0 0 800 190" class="hello-svg" role="img" aria-label="hello">
        <text class="success-hello-stroke" x="400" y="135" text-anchor="middle">hello</text>
        <text class="success-hello-fill" x="400" y="135" text-anchor="middle">hello</text>
      </svg>

      <!-- Noi dung -->
      <div class="hello-text">
        <h1 class="hello-title">{{ title || `Chào mừng ${name}!` }}</h1>
        <p class="hello-desc">{{ desc || 'Tài khoản của bạn đã được tạo thành công. Hãy bắt đầu khám phá kho tài liệu học tập của MapDocs.' }}</p>
        <button type="button" class="hello-btn group" @click="emit('cta')">
          {{ cta }}
          <AppIcon name="fa-arrow-right" class="transition-transform group-hover:translate-x-1" />
        </button>
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.hello-screen {
  position: fixed;
  inset: 0;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 1.5rem;
  font-family: 'Inter', 'Be Vietnam Pro', ui-sans-serif, system-ui, sans-serif;
}

/* ---------- Background ---------- */
.hello-bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(120% 90% at 50% 0%, #10243f 0%, #0b1120 42%, #09090b 100%);
  animation: bgIn 0.6s ease both;
}
@keyframes bgIn { from { opacity: 0; } to { opacity: 1; } }
.hello-bg__glow {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  pointer-events: none;
}
.hello-bg__glow--a {
  top: -12%; left: 8%;
  width: 30rem; height: 30rem;
  background: rgba(59, 130, 246, 0.3);
  animation: floatA 12s ease-in-out infinite;
}
.hello-bg__glow--b {
  bottom: -18%; right: 4%;
  width: 26rem; height: 26rem;
  background: rgba(16, 185, 129, 0.22);
  animation: floatB 14s ease-in-out infinite;
}
@keyframes floatA { 50% { transform: translate(30px, 26px) scale(1.06); } }
@keyframes floatB { 50% { transform: translate(-26px, -22px) scale(1.08); } }
.hello-bg__grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.045) 1px, transparent 1px);
  background-size: 46px 46px;
  mask-image: radial-gradient(ellipse 70% 55% at 50% 40%, #000 30%, transparent 78%);
  -webkit-mask-image: radial-gradient(ellipse 70% 55% at 50% 40%, #000 30%, transparent 78%);
}

.hello-confetti {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 2;
}

.hello-inner {
  position: relative;
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
  max-width: 42rem;
}

/* ---------- Icon check ---------- */
.hello-icon {
  position: relative;
  width: 5rem;
  height: 5rem;
  opacity: 0;
  animation: iconPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
}
@keyframes iconPop {
  0% { opacity: 0; transform: scale(0) rotate(-30deg); }
  70% { opacity: 1; transform: scale(1.14) rotate(6deg); }
  100% { opacity: 1; transform: scale(1) rotate(0); }
}
.hello-icon__svg { width: 100%; height: 100%; overflow: visible; }
.hello-circle {
  fill: rgba(16, 185, 129, 0.14);
  stroke: #34d399;
  stroke-width: 2.2;
  stroke-dasharray: 152;
  stroke-dashoffset: 152;
  animation: circleDraw 0.62s ease 0.32s forwards;
}
@keyframes circleDraw { to { stroke-dashoffset: 0; } }
.hello-check {
  fill: none;
  stroke: #34d399;
  stroke-width: 3.4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 46;
  stroke-dashoffset: 46;
  animation: checkDraw 0.42s ease 0.72s forwards;
}
@keyframes checkDraw { to { stroke-dashoffset: 0; } }
.hello-icon__ring {
  position: absolute;
  inset: -0.35rem;
  border-radius: 999px;
  border: 1.5px solid rgba(52, 211, 153, 0.5);
  opacity: 0;
  animation: ringOut 1.1s ease 0.6s 2;
}
@keyframes ringOut {
  0% { opacity: 0.8; transform: scale(0.86); }
  100% { opacity: 0; transform: scale(1.5); }
}

/* ---------- Chu hello ---------- */
.hello-svg {
  width: min(100%, 34rem);
  height: auto;
  margin-top: -0.25rem;
  overflow: visible;
}

/* ---------- Text + CTA ---------- */
.hello-text {
  opacity: 0;
  animation: textIn 0.6s ease 1.9s forwards;
}
@keyframes textIn {
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
}
.hello-title {
  font-size: clamp(1.5rem, 4vw, 2.125rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fff;
}
.hello-desc {
  margin: 0.625rem auto 0;
  max-width: 30rem;
  font-size: 0.9375rem;
  line-height: 1.65;
  color: #a1a1aa;
}
.hello-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.75rem;
  height: 2.875rem;
  padding: 0 1.5rem;
  border-radius: 999px;
  font-size: 0.9375rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 60%, #10b981 140%);
  box-shadow: 0 10px 30px rgba(37, 99, 235, 0.4);
  transition: transform 0.18s ease, box-shadow 0.18s ease;
}
.hello-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 38px rgba(37, 99, 235, 0.5);
}
.hello-btn:active { transform: translateY(0); }

@media (max-width: 640px) {
  .hello-icon { width: 4rem; height: 4rem; }
}
@media (prefers-reduced-motion: reduce) {
  .hello-bg, .hello-icon, .hello-text { animation: none; opacity: 1; }
  .hello-bg__glow--a, .hello-bg__glow--b, .hello-icon__ring { animation: none; }
  .hello-circle, .hello-check { animation: none; stroke-dashoffset: 0; }
  .hello-btn:hover { transform: none; }
}
</style>
