<script setup lang="ts">
// Detalle de una guía de la Biblioteca (contenido en app/utils/library.ts)
definePageMeta({
  layout: 'user-panel',
  headerTitle: 'Biblioteca',
  headerSubtitle: 'Guías para acompañar el aprendizaje en casa',
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const route = useRoute()
const guide = computed(() => findGuide(String(route.params.id)))
const related = computed(() =>
  guide.value ? GUIDES.filter((g) => g.id !== guide.value!.id && g.category === guide.value!.category) : [],
)
const others = computed(() => GUIDES.filter((g) => g.id !== guide.value?.id).slice(0, 3))

useHead(() => ({ title: guide.value ? `${guide.value.title} · Biblioteca` : 'Biblioteca' }))
</script>

<template>
  <main class="panel-body">
    <NuxtLink to="/library" class="back">
      <i class="pi pi-arrow-left" aria-hidden="true"></i> Volver a la Biblioteca
    </NuxtLink>

    <div v-if="!guide" class="card state-card">
      <p class="muted">No encontramos esta guía.</p>
      <NuxtLink to="/library" class="btn-primary">Ver todas las guías</NuxtLink>
    </div>

    <template v-else>
      <article class="card guide" aria-labelledby="guide-title">
        <div class="meta">
          <span class="pill tone-neutral">{{ guide.type }}</span>
          <span class="muted small">{{ CATEGORY_NAMES[guide.category] }}</span>
        </div>
        <h2 id="guide-title" class="guide-title">{{ guide.title }}</h2>
        <p class="intro">{{ guide.intro }}</p>

        <h3 class="tips-title">{{ guide.type === 'Actividad para casa' ? 'Qué pueden hacer' : 'Ideas para la casa' }}</h3>
        <ol class="tips">
          <li v-for="tip in guide.tips" :key="tip">{{ tip }}</li>
        </ol>

        <p class="note-box">
          Estas ideas son de apoyo general y no reemplazan la orientación de un profesional de la salud o de la educación.
        </p>
      </article>

      <section v-if="(related.length ? related : others).length" aria-labelledby="more-title" class="block">
        <h2 id="more-title" class="card-title">{{ related.length ? 'Más del área' : 'Otras guías' }}</h2>
        <div class="guide-grid">
          <LibraryGuideCard v-for="g in related.length ? related : others" :key="g.id" :guide="g" />
        </div>
      </section>
    </template>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/user-panel' as *;

.panel-body {
  max-width: 960px;
}

.back {
  align-self: flex-start;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  min-height: 44px;
  font-size: 0.9rem;
  font-weight: 700;
  color: #4338ca;
  text-decoration: none;

  &:focus-visible {
    outline: 2px solid $brand-indigo;
    outline-offset: 2px;
    border-radius: 6px;
  }
}

.guide {
  gap: 0.9rem;
}

.meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.guide-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: $text-dark;
  line-height: 1.25;
}

.intro {
  margin: 0;
  font-size: 1rem;
  color: #334155;
  line-height: 1.6;
}

.tips-title {
  margin: 0.5rem 0 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: $text-dark;
}

.tips {
  margin: 0;
  padding-left: 1.3rem;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
  font-size: 0.95rem;
  color: #334155;
  line-height: 1.55;
}

.block {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
