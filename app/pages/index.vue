<script setup lang="ts">
const token = useCookie('auth_token')

if (token.value) {
  await navigateTo('/dashboard')
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div></div>
</template>
