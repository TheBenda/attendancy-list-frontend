<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<template>
  <main class="unauthorized-view">
    <div class="unauthorized-content">
      <md-icon class="error-icon">gpp_bad</md-icon>
      <h1>Access Denied</h1>
      <p>You do not have the required permissions to access this page.</p>
      <md-filled-button @click="router.push('/')">Return to Home</md-filled-button>
    </div>
  </main>
</template>

<style scoped>
.unauthorized-view {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 64px);
  padding: 2rem;
}

.unauthorized-content {
  text-align: center;
  max-width: 400px;
}

.error-icon {
  font-size: 4rem;
  width: 4rem;
  height: 4rem;
  color: var(--color-error, #cf6679);
  margin-bottom: 1rem;
}

h1 {
  margin-bottom: 1rem;
  color: var(--color-heading);
}

p {
  color: var(--color-text);
  margin-bottom: 2rem;
}
</style>
