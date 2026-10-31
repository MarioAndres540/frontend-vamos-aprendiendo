<script setup lang="ts">
import type { Guide } from '~/utils/library'

// Pestaña Biblioteca: guías para acompañar en casa, recomendadas según el formulario inicial.
// El contenido vive en app/utils/library.ts (provisional, pendiente de revisión pedagógica).
definePageMeta({
  layout: 'user-panel',
  headerTitle: 'Biblioteca',
  headerSubtitle: 'Guías para acompañar el aprendizaje en casa',
  showsSelectedStudent: true,
  middleware: 'profile-access',
  allowedProfiles: ['tutor', 'adulto', 'tester'],
})

const { ready, assessment, subject, load } = usePanelSubject()
onMounted(load)

// Recomendadas: las categorías a reforzar del formulario y, si hay alerta, la guía para leer el resultado
const recommendedCategoryIds = computed(() =>
  assessment.value
    ? recommendedCategories(assessment.value.answers, assessment.value.primaryCondition).map((r) => r.categoryId)
    : [],
)
const recommendedGuides = computed<Guide[]>(() => {
  const guides = recommendedCategoryIds.value
    .map((id) => GUIDES.find((g) => g.category === id))
    .filter((g): g is Guide => !!g)
  if (assessment.value && assessment.value.riskLevel !== 'bajo') {
    const resultGuide = GUIDES.find((g) => g.category === 'diagnostico')
    if (resultGuide) guides.push(resultGuide)
  }
  return guides
})

// Búsqueda y filtros
const search = ref('')
const filter = ref<string>('all')

const filters = computed(() => [
  { id: 'all', label: 'Todas' },
  ...(recommendedGuides.value.length ? [{ id: 'recommended', label: `Para ${subject.value?.firstName ?? 'ti'}` }] : []),
  ...Object.keys(CATEGORY_SHORT_NAMES).map((id) => ({ id, label: CATEGORY_SHORT_NAMES[id]! })),
])

const normalize = (text: string) =>
  text
    .toLocaleLowerCase('es-CO')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')

const filteredGuides = computed(() => {
  const term = normalize(search.value.trim())
  return GUIDES.filter((g) => {
    if (filter.value === 'recommended' && !recommendedGuides.value.includes(g)) return false
    if (filter.value !== 'all' && filter.value !== 'recommended' && g.category !== filter.value) return false
    if (!term) return true
    return normalize(`${g.title} ${g.summary} ${CATEGORY_NAMES[g.category] ?? ''}`).includes(term)
  })
})

const isFiltering = computed(() => filter.value !== 'all' || search.value.trim() !== '')

const guidesPerCategory = (id: string) => GUIDES.filter((g) => g.category === id).length
const areaIds = Object.keys(CATEGORY_NAMES).filter((id) => id !== 'diagnostico')

const showArea = (id: string) => {
  filter.value = id
  search.value = ''
  nextTick(() => document.getElementById('results-title')?.scrollIntoView({ behavior: 'smooth', block: 'start' }))
}
</script>

<template>
  <main class="panel-body">
    <!-- Búsqueda y filtros -->
    <section class="card" aria-label="Buscar en la biblioteca">
      <label for="library-search" class="search-label">Buscar una guía</label>
      <div class="search">
        <i class="pi pi-search" aria-hidden="true"></i>
        <input
          id="library-search"
          v-model="search"
          type="search"
          class="search-input"
          placeholder="Por ejemplo: atención, números, lectura…"
          autocomplete="off"
        />
      </div>
      <div class="filter-group" role="group" aria-label="Filtrar por tema">
        <button
          v-for="f in filters"
          :key="f.id"
          type="button"
          class="filter-btn"
          :aria-pressed="filter === f.id"
          @click="filter = f.id"
        >
          {{ f.label }}
        </button>
      </div>
    </section>

    <!-- Resultados de búsqueda o filtro -->
    <section v-if="isFiltering" aria-labelledby="results-title" class="block">
      <div class="section-head">
        <h2 id="results-title" class="card-title">
          {{ filteredGuides.length }} {{ filteredGuides.length === 1 ? 'guía' : 'guías' }}
        </h2>
        <button type="button" class="btn-secondary" @click="filter = 'all'; search = ''">Ver todo</button>
      </div>
      <p v-if="filteredGuides.length === 0" class="card state-card muted">
        No encontramos guías con esa búsqueda. Prueba con otra palabra.
      </p>
      <div v-else class="guide-grid">
        <LibraryGuideCard v-for="g in filteredGuides" :key="g.id" :guide="g" />
      </div>
    </section>

    <template v-else>
      <!-- Recomendado -->
      <section v-if="ready && recommendedGuides.length" aria-labelledby="recommended-title" class="block">
        <div class="section-head">
          <h2 id="recommended-title" class="card-title">Recomendado para {{ subject?.firstName }}</h2>
          <span class="muted small">Según su formulario inicial</span>
        </div>
        <div class="guide-grid">
          <LibraryGuideCard v-for="g in recommendedGuides" :key="g.id" :guide="g" />
        </div>
      </section>

      <section class="two-cols">
        <!-- Cómo usar la plataforma -->
        <article class="card" aria-labelledby="howto-title">
          <h2 id="howto-title" class="card-title">Cómo usar Vamos Aprendiendo</h2>
          <ul class="howto">
            <li v-for="h in HOW_TO" :key="h.title">
              <NuxtLink :to="h.to" class="howto-link">
                <span class="howto-text">
                  <span class="howto-title">{{ h.title }}</span>
                  <span class="muted small">{{ h.where }}</span>
                </span>
                <i class="pi pi-chevron-right" aria-hidden="true"></i>
              </NuxtLink>
            </li>
          </ul>
        </article>

        <!-- Guías por área -->
        <article class="card" aria-labelledby="areas-title">
          <h2 id="areas-title" class="card-title">Guías por área</h2>
          <div class="area-grid">
            <button v-for="id in areaIds" :key="id" type="button" class="area-btn" @click="showArea(id)">
              <span class="area-name">{{ CATEGORY_NAMES[id] }}</span>
              <span class="muted small">
                {{ guidesPerCategory(id) }} {{ guidesPerCategory(id) === 1 ? 'guía' : 'guías' }}
              </span>
            </button>
          </div>
        </article>
      </section>

      <!-- Todas -->
      <section aria-labelledby="all-guides-title" class="block">
        <h2 id="all-guides-title" class="card-title">Todas las guías</h2>
        <div class="guide-grid">
          <LibraryGuideCard v-for="g in GUIDES" :key="g.id" :guide="g" />
        </div>
      </section>
    </template>

    <p class="note-box">
      Las guías ofrecen ideas para acompañar en casa; no reemplazan la orientación de un profesional de la salud o de la educación.
    </p>
  </main>
</template>

<style lang="scss" scoped>
@use '~/assets/scss/user-panel' as *;

.search-label {
  font-size: 0.9rem;
  font-weight: 700;
  color: #334155;
}

.search {
  position: relative;

  i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: $text-muted;
  }
}

.search-input {
  width: 100%;
  box-sizing: border-box;
  height: 48px;
  padding: 0 1rem 0 2.75rem;
  border-radius: 14px;
  border: 1px solid $border-subtle;
  background: #f8fafc;
  font: inherit;
  font-size: 0.95rem;
  color: $text-dark;
  color-scheme: light;

  &:focus {
    outline: none;
    background: #ffffff;
    border-color: $brand-indigo;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
  }

  @media (max-width: 640px) {
    font-size: 16px;
  }
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

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.two-cols {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 3fr);
  gap: 1.25rem;

  @media (max-width: 960px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.howto {
  list-style: none;
  margin: 0;
  padding: 0;

  li {
    border-bottom: 1px solid #f1f5f9;
  }
}

.howto-link {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  min-height: 52px;
  text-decoration: none;
  color: $text-dark;

  &:hover .howto-title {
    color: $brand-indigo;
  }

  &:focus-visible {
    outline: 2px solid $brand-indigo;
    outline-offset: 2px;
    border-radius: 8px;
  }

  i {
    color: $text-muted;
    font-size: 0.8rem;
  }
}

.howto-text {
  display: flex;
  flex-direction: column;
  line-height: 1.3;
}

.howto-title {
  font-size: 0.9rem;
  font-weight: 700;
}

.area-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;

  @media (max-width: 480px) {
    grid-template-columns: minmax(0, 1fr);
  }
}

.area-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.2rem;
  min-height: 44px;
  padding: 0.85rem 1rem;
  border-radius: 16px;
  border: 1px solid $border-subtle;
  background: #ffffff;
  font: inherit;
  text-align: left;
  cursor: pointer;

  &:hover {
    border-color: #c7d2fe;
    background: #f8fafc;
  }

  &:focus-visible {
    outline: 2px solid $brand-indigo;
    outline-offset: 2px;
  }
}

.area-name {
  font-size: 0.9rem;
  font-weight: 800;
  color: $text-dark;
}
</style>
