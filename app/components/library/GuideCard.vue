<script setup lang="ts">
import type { Guide } from '~/utils/library'

defineProps<{ guide: Guide }>()

// Portada por área: tonos claros con texto oscuro (contraste suficiente)
const COVERS: Record<string, { bg: string; text: string }> = {
  atencion: { bg: '#fff7ed', text: '#9a3412' },
  logica_matematica: { bg: '#fffbeb', text: '#92400e' },
  lectoescritura: { bg: '#eff6ff', text: '#1d4ed8' },
  memoria: { bg: '#fdf2f8', text: '#9d174d' },
  motricidad_fina: { bg: '#f5f3ff', text: '#5b21b6' },
  control_impulsos: { bg: '#ecfdf5', text: '#047857' },
  concentracion: { bg: '#f0f9ff', text: '#075985' },
  diagnostico: { bg: '#eef2ff', text: '#3730a3' },
}
const cover = (category: string) => COVERS[category] ?? { bg: '#f1f5f9', text: '#334155' }
</script>

<template>
  <article class="guide">
    <div class="cover" :style="{ background: cover(guide.category).bg, color: cover(guide.category).text }" aria-hidden="true">
      {{ CATEGORY_SHORT_NAMES[guide.category] ?? 'Guía' }}
    </div>
    <div class="content">
      <span class="type">{{ guide.type }}</span>
      <h3>{{ guide.title }}</h3>
      <p>{{ guide.summary }}</p>
      <NuxtLink :to="`/library/${guide.id}`" class="read">
        {{ guide.type === 'Actividad para casa' ? 'Ver actividad' : 'Leer guía' }}
        <i class="pi pi-arrow-right" aria-hidden="true"></i>
        <span class="sr-only">: {{ guide.title }}</span>
      </NuxtLink>
    </div>
  </article>
</template>

<style scoped lang="scss">
.guide {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.cover {
  height: 96px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.content {
  padding: 1.1rem 1.25rem 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  flex: 1;

  h3 {
    margin: 0;
    font-size: 1rem;
    font-weight: 800;
    color: #1e293b;
    line-height: 1.35;
  }

  p {
    margin: 0;
    font-size: 0.85rem;
    color: #475569;
    line-height: 1.5;
  }
}

.type {
  align-self: flex-start;
  padding: 0.2rem 0.65rem;
  border-radius: 9999px;
  background: #f1f5f9;
  color: #334155;
  font-size: 0.75rem;
  font-weight: 700;
}

.read {
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  min-height: 44px;
  font-size: 0.88rem;
  font-weight: 700;
  color: #4338ca;
  text-decoration: none;

  &:hover {
    color: #312e81;
  }

  &:focus-visible {
    outline: 2px solid #4f46e5;
    outline-offset: 2px;
    border-radius: 6px;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>
