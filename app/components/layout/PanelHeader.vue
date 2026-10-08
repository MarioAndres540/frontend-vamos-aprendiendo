<script setup lang="ts">
import avatarImg from '~/assets/img/avatar.png'

// Encabezado común de los paneles por rol (profesor, administrador)
defineProps<{
  badge: string
  userName?: string
}>()

const { logout } = useAuth()
</script>

<template>
  <header class="panel-header">
    <div class="brand">
      <img :src="avatarImg" alt="Vamos Aprendiendo" class="brand-logo" />
      <div class="brand-text">
        <span class="brand-top">Vamos</span>
        <span class="brand-sub">Aprendiendo</span>
      </div>
      <span class="role-badge">{{ badge }}</span>
    </div>

    <div class="user-area">
      <span v-if="userName" class="user-name">{{ userName }}</span>
      <button type="button" class="logout-button" aria-label="Cerrar sesión" @click="logout">
        <i class="pi pi-sign-out"></i>
        <span class="logout-label">Cerrar sesión</span>
      </button>
    </div>
  </header>
</template>

<style scoped lang="scss">
.panel-header {
  width: 100%;
  max-width: 1320px;
  margin: 0 auto;
  padding: 18px clamp(16px, 4vw, 48px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.brand-logo {
  width: clamp(44px, 5vw, 60px);
  height: clamp(44px, 5vw, 60px);
  object-fit: contain;
}

.brand-text {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
  font-size: clamp(15px, 1.5vw, 18px);
  font-weight: 700;
}

.brand-top {
  color: #1e1b4b;
}

.brand-sub {
  color: #3b50df;
}

.role-badge {
  padding: 4px 12px;
  border-radius: 9999px;
  background: #eef0fd;
  color: #3b50df;
  font-size: 12px;
  font-weight: 700;
  white-space: nowrap;
}

.user-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
  color: #334155;

  @media (max-width: 640px) {
    display: none;
  }
}

.logout-button {
  min-height: 44px;
  padding: 0 16px;
  border-radius: 9999px;
  border: 1px solid #e2e8f0;
  background: rgba(255, 255, 255, 0.92);
  color: #475569;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  transition: background 0.2s ease, border-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: #ffffff;
    border-color: #fecaca;
    color: #b91c1c;
  }

  @media (max-width: 480px) {
    padding: 0 12px;

    .logout-label {
      display: none;
    }
  }
}
</style>
