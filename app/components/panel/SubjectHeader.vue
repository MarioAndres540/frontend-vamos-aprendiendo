<script setup lang="ts">
// Encabezado con la persona de la que se muestran los datos (hijo elegido o el propio usuario)
defineProps<{
  name: string
  details?: string
}>()
</script>

<template>
  <section class="subject" aria-label="Persona">
    <div class="who">
      <span class="avatar" aria-hidden="true">{{ initials(name) }}</span>
      <div class="text">
        <h2>{{ name }}</h2>
        <span v-if="details" class="details">{{ details }}</span>
      </div>
    </div>
    <slot />
  </section>
</template>

<style scoped lang="scss">
.subject {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 24px;
  padding: 1.15rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.who {
  display: flex;
  align-items: center;
  gap: 1rem;
  min-width: 0;
}

.avatar {
  flex-shrink: 0;
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: linear-gradient(135deg, #e0e7ff, #f5f3ff);
  color: #4f46e5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
}

.text {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 1.2rem;
    font-weight: 800;
    color: #1e293b;
    overflow-wrap: anywhere;
  }
}

.details {
  font-size: 0.88rem;
  font-weight: 700;
  color: #047857;
}
</style>
