<script setup lang="ts">
import { createArtScene, type ArtScene, type ArtVariant } from '~/utils/loading-art'

// Arte generativo que llena a su contenedor (debe tener position: relative) mientras llega la información.
// Cada pestaña usa su propio estudio (variant) y cada carga una semilla nueva. Ver docs/algorithmic-loading-art.md
const props = defineProps<{ variant: ArtVariant; seed?: number }>()

// Contador compartido: cada vez que se muestra un arte, la semilla cambia (1, 2, 3…) y la composición es distinta
const seedCounter = useState('loading-art-seed', () => 0)

const canvas = ref<HTMLCanvasElement | null>(null)
let observer: ResizeObserver | null = null
let frame = 0
let scene: ArtScene | null = null
let ctx: CanvasRenderingContext2D | null = null
let seed = 1
let startedAt = 0
let reducedMotion = false

const stop = () => {
  if (frame) cancelAnimationFrame(frame)
  frame = 0
}

const loop = (now: number) => {
  if (!scene || !ctx) return
  // En una pestaña en segundo plano no se gasta batería dibujando
  if (!document.hidden) scene.draw(ctx, (now - startedAt) / 1000)
  frame = requestAnimationFrame(loop)
}

const setup = () => {
  const el = canvas.value
  if (!el) return
  const width = el.clientWidth
  const height = el.clientHeight
  if (!width || !height) return
  stop()

  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  el.width = Math.round(width * dpr)
  el.height = Math.round(height * dpr)
  ctx = el.getContext('2d')
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  scene = createArtScene(props.variant, width, height, seed)

  if (reducedMotion) {
    // Sin movimiento: se deja avanzar la escena un momento para que las estelas se formen y se muestra una sola imagen
    for (let i = 0; i < 90; i++) scene.draw(ctx, i / 30)
    return
  }
  startedAt = performance.now()
  frame = requestAnimationFrame(loop)
}

onMounted(() => {
  seedCounter.value += 1
  seed = props.seed ?? seedCounter.value
  reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  observer = new ResizeObserver(setup)
  if (canvas.value) observer.observe(canvas.value)
})

onBeforeUnmount(() => {
  stop()
  observer?.disconnect()
})
</script>

<template>
  <canvas ref="canvas" class="loading-art" aria-hidden="true"></canvas>
</template>

<style scoped lang="scss">
.loading-art {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}
</style>
