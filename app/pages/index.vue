<script setup lang="ts">
const token = useCookie('auth_token')

if (token.value) {
  await navigateTo('/home')
} else {
  await navigateTo('/login')
}
</script>

<template>
  <div></div>
</template>
