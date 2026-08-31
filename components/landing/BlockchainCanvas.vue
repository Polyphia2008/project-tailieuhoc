<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    density?: number
    speed?: number
    linkDistance?: number
  }>(),
  { density: 72, speed: 0.14, linkDistance: 2.4 }
)

const host = ref<HTMLDivElement | null>(null)
const supported = ref(true)
const { isDark } = useTheme()

let stop: (() => void) | null = null
let setDark: ((v: boolean) => void) | null = null

function hasWebgl(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

async function boot() {
  const el = host.value
  if (!el) return

  if (!hasWebgl()) {
    supported.value = false
    return
  }

  const THREE = await import('three')

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 120)
  camera.position.set(0, 0, 15)

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.6))
  renderer.setClearColor(0x000000, 0)
  renderer.domElement.style.width = '100%'
  renderer.domElement.style.height = '100%'
  renderer.domElement.style.display = 'block'
  el.appendChild(renderer.domElement)

  const group = new THREE.Group()
  scene.add(group)

  const COUNT = props.density
  const RANGE = 11
  const positions = new Float32Array(COUNT * 3)
  const velocities = new Float32Array(COUNT * 3)

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3] = (Math.random() - 0.5) * RANGE * 1.7
    positions[i * 3 + 1] = (Math.random() - 0.5) * RANGE
    positions[i * 3 + 2] = (Math.random() - 0.5) * RANGE * 0.7
    velocities[i * 3] = (Math.random() - 0.5) * 0.011
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.011
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.007
  }

  const nodeGeo = new THREE.BufferGeometry()
  nodeGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const sprite = (() => {
    const c = document.createElement('canvas')
    c.width = 64
    c.height = 64
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
    grad.addColorStop(0, 'rgba(255,255,255,1)')
    grad.addColorStop(0.34, 'rgba(255,255,255,.72)')
    grad.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = grad
    g.fillRect(0, 0, 64, 64)
    const t = new THREE.CanvasTexture(c)
    t.needsUpdate = true
    return t
  })()

  const nodeMat = new THREE.PointsMaterial({
    size: 0.33,
    map: sprite,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    color: new THREE.Color(0x38bdf8),
    opacity: 0.9
  })
  const points = new THREE.Points(nodeGeo, nodeMat)
  group.add(points)

  const MAX_LINKS = COUNT * 8
  const linkPos = new Float32Array(MAX_LINKS * 6)
  const linkGeo = new THREE.BufferGeometry()
  linkGeo.setAttribute('position', new THREE.BufferAttribute(linkPos, 3))
  const linkMat = new THREE.LineBasicMaterial({
    color: new THREE.Color(0x0ea5e9),
    transparent: true,
    opacity: 0.24,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  })
  const links = new THREE.LineSegments(linkGeo, linkMat)
  group.add(links)

  const sphereGeo = new THREE.IcosahedronGeometry(5.4, 2)
  const sphereWire = new THREE.WireframeGeometry(sphereGeo)
  const sphereMat = new THREE.LineBasicMaterial({ color: new THREE.Color(0x0ea5e9), transparent: true, opacity: 0.08 })
  const sphere = new THREE.LineSegments(sphereWire, sphereMat)
  group.add(sphere)

  const cubeGeo = new THREE.BoxGeometry(1, 1, 1)
  const edgeGeo = new THREE.EdgesGeometry(cubeGeo)
  const blocks: any[] = []
  const BLOCK_SPOTS = [
    [-8.2, 2.6, -1.6, 1.35],
    [7.6, 3.1, -2.2, 1.1],
    [-5.6, -3.6, 0.4, 0.95],
    [8.2, -2.6, -0.8, 1.25],
    [1.6, 4.6, -3.2, 0.85],
    [-2, -4.8, -2.4, 1.05]
  ]

  BLOCK_SPOTS.forEach(([x, y, z, s], i) => {
    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(i % 2 ? 0x7dd3fc : 0x0ea5e9),
      transparent: true,
      opacity: 0.5
    })
    const cube = new THREE.LineSegments(edgeGeo, mat)
    cube.position.set(x, y, z)
    cube.scale.setScalar(s)
    cube.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0)
    group.add(cube)
    blocks.push({ mesh: cube, mat, rx: 0.0015 + i * 0.0004, ry: 0.002 + i * 0.0003, base: y, phase: i * 1.1 })
  })

  const pointer = { x: 0, y: 0, tx: 0, ty: 0 }

  function onPointer(e: PointerEvent) {
    const r = el.getBoundingClientRect()
    pointer.tx = ((e.clientX - r.left) / r.width - 0.5) * 2
    pointer.ty = ((e.clientY - r.top) / r.height - 0.5) * 2
  }

  function resize() {
    const w = el.clientWidth || 1
    const h = el.clientHeight || 1
    camera.aspect = w / h
    camera.updateProjectionMatrix()
    renderer.setSize(w, h, false)
  }

  const ro = new ResizeObserver(resize)
  ro.observe(el)
  resize()

  window.addEventListener('pointermove', onPointer, { passive: true })

  let onScreen = true
  const io = new IntersectionObserver((entries) => {
    onScreen = entries[0]?.isIntersecting ?? true
  })
  io.observe(el)

  let tabVisible = document.visibilityState !== 'hidden'
  function onVisibility() {
    tabVisible = document.visibilityState !== 'hidden'
  }
  document.addEventListener('visibilitychange', onVisibility)

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  setDark = (dark: boolean) => {
    nodeMat.color.set(dark ? 0x67e8f9 : 0x0284c7)
    nodeMat.opacity = dark ? 0.92 : 0.72
    linkMat.color.set(dark ? 0x22d3ee : 0x0ea5e9)
    linkMat.opacity = dark ? 0.26 : 0.16
    sphereMat.color.set(dark ? 0x38bdf8 : 0x0369a1)
    sphereMat.opacity = dark ? 0.1 : 0.07
    blocks.forEach((b, i) => {
      b.mat.color.set(dark ? (i % 2 ? 0x7dd3fc : 0x22d3ee) : i % 2 ? 0x0284c7 : 0x0369a1)
      b.mat.opacity = dark ? 0.52 : 0.36
    })
  }
  setDark(isDark.value)

  let raf = 0
  let t = 0

  function frame() {
    raf = requestAnimationFrame(frame)
    if (!onScreen || !tabVisible) return

    t += 0.01
    const posAttr = nodeGeo.getAttribute('position') as any
    const arr = posAttr.array as Float32Array
    const sp = reduce ? 0 : props.speed

    if (sp > 0) {
      for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3
        arr[i3] += velocities[i3] * sp * 60
        arr[i3 + 1] += velocities[i3 + 1] * sp * 60
        arr[i3 + 2] += velocities[i3 + 2] * sp * 60

        if (arr[i3] > RANGE * 0.95 || arr[i3] < -RANGE * 0.95) velocities[i3] *= -1
        if (arr[i3 + 1] > RANGE * 0.55 || arr[i3 + 1] < -RANGE * 0.55) velocities[i3 + 1] *= -1
        if (arr[i3 + 2] > RANGE * 0.4 || arr[i3 + 2] < -RANGE * 0.4) velocities[i3 + 2] *= -1
      }
      posAttr.needsUpdate = true
    }

    let n = 0
    const maxD = props.linkDistance
    for (let i = 0; i < COUNT && n < MAX_LINKS; i++) {
      const ax = arr[i * 3]
      const ay = arr[i * 3 + 1]
      const az = arr[i * 3 + 2]
      for (let j = i + 1; j < COUNT && n < MAX_LINKS; j++) {
        const dx = ax - arr[j * 3]
        const dy = ay - arr[j * 3 + 1]
        const dz = az - arr[j * 3 + 2]
        if (dx * dx + dy * dy + dz * dz < maxD * maxD) {
          const o = n * 6
          linkPos[o] = ax
          linkPos[o + 1] = ay
          linkPos[o + 2] = az
          linkPos[o + 3] = arr[j * 3]
          linkPos[o + 4] = arr[j * 3 + 1]
          linkPos[o + 5] = arr[j * 3 + 2]
          n++
        }
      }
    }
    linkGeo.setDrawRange(0, n * 2)
    ;(linkGeo.getAttribute('position') as any).needsUpdate = true

    if (!reduce) {
      blocks.forEach((b) => {
        b.mesh.rotation.x += b.rx
        b.mesh.rotation.y += b.ry
        b.mesh.position.y = b.base + Math.sin(t + b.phase) * 0.34
      })
      sphere.rotation.y += 0.0009
      sphere.rotation.x += 0.0005
    }

    pointer.x += (pointer.tx - pointer.x) * 0.045
    pointer.y += (pointer.ty - pointer.y) * 0.045
    group.rotation.y = pointer.x * 0.2 + Math.sin(t * 0.11) * 0.05
    group.rotation.x = -pointer.y * 0.13

    renderer.render(scene, camera)
  }

  frame()

  stop = () => {
    cancelAnimationFrame(raf)
    ro.disconnect()
    io.disconnect()
    window.removeEventListener('pointermove', onPointer)
    document.removeEventListener('visibilitychange', onVisibility)
    nodeGeo.dispose()
    linkGeo.dispose()
    edgeGeo.dispose()
    cubeGeo.dispose()
    sphereGeo.dispose()
    sphereWire.dispose()
    nodeMat.dispose()
    linkMat.dispose()
    sphereMat.dispose()
    sprite.dispose()
    blocks.forEach((b) => b.mat.dispose())
    scene.remove(group)
    renderer.dispose()
    renderer.forceContextLoss?.()
    if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
  }
}

watch(isDark, (v) => setDark?.(v))

onMounted(() => {
  boot().catch(() => {
    supported.value = false
  })
})

onBeforeUnmount(() => {
  stop?.()
  stop = null
  setDark = null
})
</script>

<template>
  <div ref="host" class="blockchain-canvas" aria-hidden="true">
    <div v-if="!supported" class="blockchain-fallback" />
  </div>
</template>

<style scoped>
.blockchain-canvas {
  position: absolute;
  inset: 0;
  max-width: 100%;
  overflow: hidden;
  pointer-events: none;
  z-index: 0;
}

.blockchain-fallback {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 26%, rgba(56, 189, 248, .22), transparent 42%),
    radial-gradient(circle at 82% 34%, rgba(34, 211, 238, .18), transparent 45%),
    radial-gradient(circle at 50% 78%, rgba(3, 105, 161, .16), transparent 48%);
}
</style>
