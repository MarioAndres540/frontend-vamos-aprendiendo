// Arte generativo para las esperas: cada pestaña del panel tiene su propio estudio, dibujado con semilla mientras
// llega la información del backend. Filosofía y variantes: docs/algorithmic-loading-art.md
//
// Se usa Canvas 2D directo (no p5.js): el brillo debe aparecer al instante al cambiar de pestaña y cargar una
// librería de más de 1 MB iría en contra de ese objetivo. Las técnicas son las mismas: azar con semilla (misma
// semilla = misma composición), ruido de valor suavizado, campos de flujo y partículas.

export type ArtVariant = 'inicio' | 'diagnosticos' | 'actividades' | 'analiticas' | 'biblioteca' | 'configuracion'

export interface ArtScene {
  /** Dibuja el fotograma del segundo `t`. El lienzo es transparente: el fondo lo pone el contenedor. */
  draw(ctx: CanvasRenderingContext2D, t: number): void
}

// Paleta del producto (morado de marca, cielo, naranja de acento, verde, rosa, lila)
const PALETTE = ['#5b50d6', '#38bdf8', '#f5a000', '#22c55e', '#ec4899', '#a78bfa', '#4f46e5']
const TAU = Math.PI * 2
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16)
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 }
}
const rgba = (hex: string, alpha: number) => {
  const { r, g, b } = hexToRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`
}

// Mismo resultado siempre para la misma semilla
const mulberry32 = (seed: number) => {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// Ruido de valor 2D con interpolación suave, sembrado con la misma función de azar
const makeNoise = (rand: () => number) => {
  const base = Array.from({ length: 256 }, (_, i) => i)
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[base[i], base[j]] = [base[j]!, base[i]!]
  }
  const perm = new Uint8Array(512)
  for (let i = 0; i < 512; i++) perm[i] = base[i & 255]!
  const lattice = (x: number, y: number) => perm[perm[x & 255]! + (y & 255)]! / 255
  const fade = (t: number) => t * t * (3 - 2 * t)
  return (x: number, y: number) => {
    const xi = Math.floor(x)
    const yi = Math.floor(y)
    const u = fade(x - xi)
    const v = fade(y - yi)
    const a = lattice(xi, yi)
    const b = lattice(xi + 1, yi)
    const c = lattice(xi, yi + 1)
    const d = lattice(xi + 1, yi + 1)
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
  }
}

type Rand = () => number
type Noise = (x: number, y: number) => number
type SceneFactory = (w: number, h: number, rand: Rand, noise: Noise) => ArtScene

// ---------- Inicio · Constelación: puntos que derivan con el ruido y se enlazan al acercarse ----------
const constellation: SceneFactory = (w, h, rand, noise) => {
  const count = Math.round(clamp(w / 20, 28, 72))
  const link = clamp(Math.min(w, 520) * 0.2, 70, 120)
  const nodes = Array.from({ length: count }, (_, i) => ({
    x: rand() * w,
    y: rand() * h,
    phase: rand() * TAU,
    size: 1.6 + rand() * 2.4,
    color: PALETTE[i % PALETTE.length]!,
  }))
  return {
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) {
        const angle = noise(n.x * 0.004, n.y * 0.004 + t * 0.05) * TAU * 2
        n.x += Math.cos(angle) * 0.35
        n.y += Math.sin(angle) * 0.35
        if (n.x < -10) n.x = w + 10
        if (n.x > w + 10) n.x = -10
        if (n.y < -10) n.y = h + 10
        if (n.y > h + 10) n.y = -10
      }
      ctx.lineWidth = 1
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]!
          const b = nodes[j]!
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d > link) continue
          ctx.strokeStyle = rgba('#5b50d6', (1 - d / link) * 0.32)
          ctx.beginPath()
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(b.x, b.y)
          ctx.stroke()
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = rgba(n.color, 0.85)
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.size * (1 + 0.3 * Math.sin(t * 2 + n.phase)), 0, TAU)
        ctx.fill()
      }
    },
  }
}

// ---------- Diagnósticos · Interferencia: ondas que nacen de tres fuentes y se suman en una rejilla de puntos ----------
const interference: SceneFactory = (w, h, rand) => {
  const step = 12
  const sources = Array.from({ length: 3 }, (_, i) => ({
    cx: w * (0.2 + 0.3 * i) + (rand() - 0.5) * w * 0.06,
    cy: h * (0.35 + rand() * 0.3),
    phase: rand() * TAU,
    speed: 0.25 + rand() * 0.2,
  }))
  const wave = 0.05 + rand() * 0.02
  return {
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      const pos = sources.map((s) => ({
        x: s.cx + Math.sin(t * s.speed + s.phase) * w * 0.07,
        y: s.cy + Math.cos(t * s.speed * 0.8 + s.phase) * h * 0.18,
      }))
      for (let x = step / 2; x < w; x += step) {
        for (let y = step / 2; y < h; y += step) {
          let sum = 0
          for (const p of pos) sum += Math.sin(Math.hypot(x - p.x, y - p.y) * wave - t * 2.2)
          const v = (sum / pos.length + 1) / 2 // 0..1
          if (v < 0.22) continue
          ctx.fillStyle = rgba(v > 0.72 ? '#f5a000' : v > 0.5 ? '#5b50d6' : '#38bdf8', 0.18 + v * 0.62)
          ctx.beginPath()
          ctx.arc(x, y, v * 4.4, 0, TAU)
          ctx.fill()
        }
      }
    },
  }
}

// ---------- Actividades · Flujo: partículas que siguen un campo de ruido y dejan estela ----------
const flow: SceneFactory = (w, h, rand, noise) => {
  const count = Math.round(clamp((w * h) / 420, 90, 260))
  const spawn = () => ({ x: rand() * w, y: rand() * h, life: 120 + rand() * 200, hue: Math.floor(rand() * PALETTE.length) })
  const particles = Array.from({ length: count }, spawn)
  return {
    draw(ctx, t) {
      // la estela se desvanece hacia transparente, no hacia un color
      ctx.globalCompositeOperation = 'destination-out'
      ctx.fillStyle = 'rgba(0, 0, 0, 0.045)'
      ctx.fillRect(0, 0, w, h)
      ctx.globalCompositeOperation = 'source-over'
      ctx.lineWidth = 1.8
      ctx.lineCap = 'round'
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]!
        const angle = noise(p.x * 0.004, p.y * 0.004 + t * 0.04) * TAU * 2
        const nx = p.x + Math.cos(angle) * 2.1
        const ny = p.y + Math.sin(angle) * 2.1
        ctx.strokeStyle = rgba(PALETTE[p.hue]!, 0.8)
        ctx.beginPath()
        ctx.moveTo(p.x, p.y)
        ctx.lineTo(nx, ny)
        ctx.stroke()
        p.x = nx
        p.y = ny
        p.life -= 1
        if (p.life <= 0 || nx < -5 || nx > w + 5 || ny < -5 || ny > h + 5) particles[i] = spawn()
      }
    },
  }
}

// ---------- Analíticas · Pulso de datos: columnas que respiran con el ruido y una línea que las recorre ----------
const pulse: SceneFactory = (w, h, rand, noise) => {
  const barW = 12
  const gap = 12
  const n = Math.max(6, Math.floor(w / (barW + gap)))
  const offset = (w - n * (barW + gap) + gap) / 2
  const seedY = rand() * 50
  // De izquierda a derecha: morado, cielo y lila
  const colorAt = (i: number) => PALETTE[[0, 1, 5][Math.min(2, Math.floor((i / n) * 3))]!]!
  return {
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      const tops: { x: number; y: number }[] = []
      for (let i = 0; i < n; i++) {
        const v = 0.2 + 0.72 * noise(i * 0.22, t * 0.35 + seedY)
        const bh = v * h * 0.92
        const x = offset + i * (barW + gap)
        const y = h - bh
        ctx.fillStyle = rgba(colorAt(i), 0.38)
        ctx.beginPath()
        // roundRect no existe en navegadores antiguos: ahí las columnas salen rectas
        if (ctx.roundRect) ctx.roundRect(x, y, barW, bh, [6, 6, 0, 0])
        else ctx.rect(x, y, barW, bh)
        ctx.fill()
        tops.push({ x: x + barW / 2, y })
      }
      ctx.strokeStyle = rgba('#f5a000', 0.9)
      ctx.lineWidth = 2.2
      ctx.lineJoin = 'round'
      ctx.beginPath()
      tops.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y - 8) : ctx.moveTo(p.x, p.y - 8)))
      ctx.stroke()
      const cursor = ((t * 0.18) % 1) * (w + 60) - 30
      ctx.fillStyle = rgba('#f5a000', 0.95)
      ctx.beginPath()
      ctx.arc(cursor, tops.length ? tops[clamp(Math.round(((cursor - offset) / (w - 2 * offset)) * (n - 1)), 0, n - 1)]!.y - 8 : h / 2, 4.5, 0, TAU)
      ctx.fill()
    },
  }
}

// ---------- Biblioteca · Filotaxia: semillas en ángulo áureo, como una flor que se abre ----------
const phyllotaxis: SceneFactory = (w, h, rand) => {
  const spirals = [0.2, 0.5, 0.8].map((fx, i) => ({
    cx: w * fx,
    cy: h / 2,
    dir: i % 2 ? -1 : 1,
    shift: rand() * TAU,
  }))
  const maxR = Math.min(h * 0.46, w * 0.15)
  const count = 150
  return {
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      for (const s of spirals) {
        for (let i = 1; i < count; i++) {
          const f = i / count
          const a = i * GOLDEN_ANGLE + s.shift + t * 0.18 * s.dir
          const r = maxR * Math.sqrt(f)
          const size = (0.9 + f * 3.4) * (1 + 0.28 * Math.sin(t * 2 - i * 0.09))
          ctx.fillStyle = rgba(PALETTE[i % PALETTE.length]!, 0.78)
          ctx.beginPath()
          ctx.arc(s.cx + Math.cos(a) * r, s.cy + Math.sin(a) * r, size, 0, TAU)
          ctx.fill()
        }
      }
    },
  }
}

// ---------- Configuración · Órbitas: hipotrocoides (como engranes) que dejan su trazo ----------
const orbits: SceneFactory = (w, h, rand) => {
  const ratios = [
    [5, 3],
    [7, 4],
    [8, 3],
    [9, 5],
  ]
  const pick = () => ratios[Math.floor(rand() * ratios.length)]!
  const rings = [0.3, 0.7].map((fx, i) => {
    const [big, small] = pick()
    return { cx: w * fx, cy: h / 2, big, small, d: 0.55 + rand() * 0.35, color: PALETTE[i === 0 ? 0 : 2]!, speed: 0.5 + rand() * 0.3 }
  })
  const radius = Math.min(h * 0.44, w * 0.2)
  const trail = 360
  return {
    draw(ctx, t) {
      ctx.clearRect(0, 0, w, h)
      for (const r of rings) {
        const k = r.big - r.small
        const scale = radius / (k + r.d * r.small)
        let prev: { x: number; y: number } | null = null
        for (let s = trail; s >= 0; s--) {
          const a = t * r.speed - s * 0.035
          const x = r.cx + scale * (k * Math.cos(a) + r.d * r.small * Math.cos((k / r.small) * a))
          const y = r.cy + scale * (k * Math.sin(a) - r.d * r.small * Math.sin((k / r.small) * a))
          if (prev) {
            ctx.strokeStyle = rgba(r.color, (1 - s / trail) * 0.75)
            ctx.lineWidth = 1 + (1 - s / trail) * 1.8
            ctx.beginPath()
            ctx.moveTo(prev.x, prev.y)
            ctx.lineTo(x, y)
            ctx.stroke()
          }
          prev = { x, y }
        }
        if (prev) {
          ctx.fillStyle = rgba('#f5a000', 0.95)
          ctx.beginPath()
          ctx.arc(prev.x, prev.y, 4, 0, TAU)
          ctx.fill()
        }
      }
    },
  }
}

const SCENES: Record<ArtVariant, SceneFactory> = {
  inicio: constellation,
  diagnosticos: interference,
  actividades: flow,
  analiticas: pulse,
  biblioteca: phyllotaxis,
  configuracion: orbits,
}

/** Crea la escena de una pestaña para un tamaño y una semilla. La misma semilla da siempre la misma composición. */
export const createArtScene = (variant: ArtVariant, width: number, height: number, seed: number): ArtScene => {
  const rand = mulberry32(seed * 2654435761 + variant.length)
  return SCENES[variant](Math.max(40, width), Math.max(40, height), rand, makeNoise(rand))
}
