<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/stores/apiAdapter'
import type { components } from '@/stores/api/apiclient'

type UserDto = components['schemas']['UserDto']
type UserRole = components['schemas']['UserRole']

const roles: UserRole[] = ['Admin', 'CoAdmin', 'Team', 'Parent']

const usersByRole = ref<Record<string, UserDto[]>>({
  Admin: [],
  CoAdmin: [],
  Team: [],
  Parent: [],
})

const isLoading = ref(true)
const error = ref<string | null>(null)

const fetchUsersByRoles = async () => {
  isLoading.value = true
  error.value = null

  try {
    for (const role of roles) {
      const { data, error: apiError } = await client.GET('/api/users/by-role', {
        params: {
          query: {
            userRole: role,
          },
        },
      })

      if (apiError) {
        console.error(`Error fetching users for role ${role}:`, apiError)
        // Optionally continue to fetch other roles or break
        continue
      }

      if (data && data.users) {
        usersByRole.value[role] = data.users
      }
    }
  } catch (err) {
    console.error('Failed to fetch users:', err)
    error.value = 'Failed to load users. Please try again later.'
  } finally {
    isLoading.value = false
  }
}

const getInitials = (user: UserDto) => {
  if (user.firstName && user.lastName) {
    return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
  }
  if (user.firstName) return user.firstName[0].toUpperCase()
  if (user.lastName) return user.lastName[0].toUpperCase()
  if (user.email) return user.email[0].toUpperCase()
  return 'U'
}

onMounted(() => {
  fetchUsersByRoles()
})
</script>

<template>
  <main class="users-by-roles-container">
    <div class="header-section">
      <h1 class="md-typescale-display-small">Users by Role</h1>
      <md-filled-tonal-button @click="fetchUsersByRoles" :disabled="isLoading">
        <md-icon slot="icon">refresh</md-icon>
        Refresh
      </md-filled-tonal-button>
    </div>

    <div v-if="error" class="error-container">
      <md-icon>error</md-icon>
      <span class="md-typescale-body-large">{{ error }}</span>
    </div>

    <div v-if="isLoading" class="loading-state">
      <md-circular-progress indeterminate></md-circular-progress>
      <div class="md-typescale-body-large">Loading users...</div>
    </div>

    <div v-else class="roles-grid">
      <div v-for="role in roles" :key="role" class="role-card">
        <h2 class="md-typescale-headline-small role-header">
          <md-icon class="role-icon" v-if="role === 'Admin'">admin_panel_settings</md-icon>
          <md-icon class="role-icon" v-else-if="role === 'CoAdmin'">security</md-icon>
          <md-icon class="role-icon" v-else-if="role === 'Team'">groups</md-icon>
          <md-icon class="role-icon" v-else>family_restroom</md-icon>
          {{ role }}s
          <span class="count-badge">{{ usersByRole[role].length }}</span>
        </h2>

        <div v-if="usersByRole[role].length === 0" class="empty-state">
          <md-icon class="empty-icon">person_off</md-icon>
          <div class="md-typescale-body-large">No {{ role }}s found</div>
        </div>

        <md-list v-else class="user-list">
          <md-list-item v-for="user in usersByRole[role]" :key="user.id" type="button">
            <div slot="start" class="avatar">
              {{ getInitials(user) }}
            </div>

            <div slot="headline">
              {{ user.firstName || '' }} {{ user.lastName || '' }}
              <span v-if="!user.firstName && !user.lastName" class="text-muted">No Name Provided</span>
            </div>

            <div slot="supporting-text">
              <span class="contact-info">
                <md-icon class="small-icon">mail</md-icon> {{ user.email || 'No email' }}
              </span>
              <span v-if="user.phoneNumber" class="contact-info">
                <md-icon class="small-icon">phone</md-icon> {{ user.phoneNumber }}
              </span>
            </div>

            <md-icon slot="end">chevron_right</md-icon>
          </md-list-item>
        </md-list>
      </div>
    </div>
  </main>
</template>

<style scoped>
.users-by-roles-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

h1 {
  margin: 0;
  color: var(--md-sys-color-on-background);
}

.error-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: var(--md-sys-color-error-container);
  color: var(--md-sys-color-on-error-container);
  border-radius: 12px;
  margin-bottom: 32px;
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  gap: 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.roles-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .roles-grid {
    grid-template-columns: 1fr 1fr;
  }
}

.role-card {
  background-color: var(--md-sys-color-surface-container-low, var(--color-background-soft));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.role-header {
  margin: 0;
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--md-sys-color-on-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, var(--color-border));
}

.role-icon {
  color: var(--md-sys-color-primary);
}

.count-badge {
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 16px;
  padding: 2px 10px;
  font-size: 0.875rem;
  font-weight: 500;
  margin-left: auto;
}

.empty-state {
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.empty-icon {
  font-size: 48px;
  width: 48px;
  height: 48px;
  opacity: 0.5;
}

.user-list {
  --md-list-container-color: transparent;
  flex-grow: 1;
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: var(--md-sys-color-secondary-container);
  color: var(--md-sys-color-on-secondary-container);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.125rem;
}

.contact-info {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-right: 16px;
  color: var(--md-sys-color-on-surface-variant);
}

.small-icon {
  font-size: 16px;
  width: 16px;
  height: 16px;
}

.text-muted {
  font-style: italic;
  opacity: 0.7;
}

md-list-item {
  border-bottom: 1px solid var(--md-sys-color-surface-container-high, var(--color-background));
}

md-list-item:last-child {
  border-bottom: none;
}
</style>
