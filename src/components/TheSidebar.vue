<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { userAuthStore } from '@/stores/userAuth'

const router = useRouter()
const authStore = userAuthStore()

const navigateTo = (path: string) => {
  router.push(path)
}

const logout = () => {
  authStore.logout()
}

const userDisplayName = computed(() => {
  if (authStore.user) {
    const { firstName, lastName, email } = authStore.user
    if (firstName && lastName) return `${firstName} ${lastName}`
    if (firstName) return firstName
    if (lastName) return lastName
    return email || 'User'
  }
  return ''
})
</script>

<template>
  <aside class="sidebar">
    <div class="sidebar-header">
      <h2>Attendancy List</h2>
    </div>

    <md-list>
      <md-list-item @click="navigateTo('/')" type="button">
        <md-icon slot="start">home</md-icon>
        <div slot="headline">Home</div>
      </md-list-item>

      <template v-if="!authStore.user">
        <md-list-item @click="navigateTo('/login')" type="button">
          <md-icon slot="start">login</md-icon>
          <div slot="headline">Login</div>
        </md-list-item>
      </template>
      <template v-else>
        <md-list-item @click="logout" type="button">
          <md-icon slot="start">logout</md-icon>
          <div slot="headline">Logout ({{ userDisplayName }})</div>
        </md-list-item>
      </template>

      <md-list-item @click="navigateTo('/about')" type="button">
        <md-icon slot="start">info</md-icon>
        <div slot="headline">About</div>
      </md-list-item>
    </md-list>
  </aside>
</template>

<style scoped>
.sidebar {
  width: 256px;
  height: 100vh;
  border-right: 1px solid var(--color-border);
  background-color: var(--color-background-soft);
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 16px 24px;
  min-height: 64px;
  display: flex;
  align-items: center;
}

.sidebar-header h2 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--color-heading);
}

md-list {
  --md-list-container-color: transparent;
}
</style>
