<script setup lang="ts">
export interface TeacherActivityItem {
  id: string
  text: string
  highlight: string
  time: string
  icon: string
  color: string
  bgColor: string
}

// Actividad reciente de los estudiantes de la institución. El backend aún no la entrega (GET /teacher/dashboard
// solo trae los estudiantes), por eso se muestra vacía: nunca nombres ni logros de ejemplo.
withDefaults(defineProps<{ items?: TeacherActivityItem[] }>(), { items: () => [] })
</script>

<template>
  <section class="card">
    <div class="card-header">
      <div>
        <h2 class="card-title">Actividad reciente</h2>
        <p class="card-subtitle">Lo último que hicieron tus estudiantes.</p>
      </div>
    </div>

    <p v-if="items.length === 0" class="empty-state">Todavía no hay actividad para mostrar.</p>

    <div v-else class="activity-feed">
      <div v-for="item in items" :key="item.id" class="feed-item">
        <span class="feed-icon" :style="{ backgroundColor: item.bgColor, color: item.color }">
          <i :class="item.icon"></i>
        </span>
        <div>
          <p class="feed-text">
            {{ item.text }} <strong>{{ item.highlight }}</strong>
          </p>
          <span class="feed-time">{{ item.time }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
@use '../../assets/scss/panel' as *;

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.feed-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.feed-icon {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  flex-shrink: 0;
}

.feed-text {
  margin: 0 0 2px;
  font-size: 14px;
  line-height: 1.3;
  color: #1e293b;

  strong {
    color: #1e1b4b;
  }
}

.feed-time {
  font-size: 12px;
  color: #64748b;
}
</style>
