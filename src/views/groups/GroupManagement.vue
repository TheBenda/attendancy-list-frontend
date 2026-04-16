<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'
import { toast } from 'vue3-toastify'
import CreateGroup from '@/components/groups/CreateGroup.vue'

type GroupDto = components['schemas']['GetGroupResponse']

const authStore = userAuthStore()

const groups = ref<GroupDto[]>([])
const isLoading = ref(true)

const createGroupModal = ref<InstanceType<typeof CreateGroup> | null>(null)

const openCreateGroupModal = () => {
  createGroupModal.value?.openModal()
}

const fetchGroups = async () => {
  isLoading.value = true

  try {
    const { data, error: apiError } = await client.GET('/api/groups', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })

    if (apiError) {
      console.error('Error fetching groups:', apiError)
      toast.error('Failed to load groups. Please try again.')
    } else if (data) {
      groups.value = data.groups || []
    }
  } catch (err) {
    console.error('Failed to fetch groups:', err)
    toast.error('An error occurred while loading groups.')
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchGroups()
})
</script>

<template>
  <main class="group-management-container">
    <div class="header-section">
      <h1 class="md-typescale-display-small">Group Management</h1>
      <div class="header-actions">
        <md-filled-tonal-button @click="fetchGroups" :disabled="isLoading">
          <md-icon slot="icon">refresh</md-icon>
          Refresh
        </md-filled-tonal-button>
        <md-filled-button @click="openCreateGroupModal">
          <md-icon slot="icon">add</md-icon>
          Create Group
        </md-filled-button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <md-circular-progress indeterminate></md-circular-progress>
      <div class="md-typescale-body-large">Loading groups...</div>
    </div>

    <div v-else class="groups-grid">
      <div class="group-card">
        <h2 class="md-typescale-headline-small group-header">
          <md-icon class="group-icon">domain</md-icon>
          All Groups
          <span class="count-badge">{{ groups.length }}</span>
        </h2>

        <div v-if="groups.length === 0" class="empty-state">
          <md-icon class="empty-icon">domain_disabled</md-icon>
          <div class="md-typescale-body-large">No groups found</div>
        </div>

        <md-list v-else class="group-list">
          <md-list-item v-for="group in groups" :key="group.id" type="button">
            <div slot="start" class="avatar">
              {{ group.groupName ? group.groupName.charAt(0).toUpperCase() : 'G' }}
            </div>

            <div slot="headline">
              {{ group.groupName || 'Unnamed Group' }}
            </div>

            <md-icon slot="end">chevron_right</md-icon>
          </md-list-item>
        </md-list>
      </div>
    </div>

    <CreateGroup ref="createGroupModal" @group-created="fetchGroups" />
  </main>
</template>

<style scoped>
.group-management-container {
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

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

h1 {
  margin: 0;
  color: var(--md-sys-color-on-background);
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

.groups-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

@media (min-width: 1024px) {
  .groups-grid {
    grid-template-columns: 1fr; /* Keep it single column for now, can change if needed */
  }
}

.group-card {
  background-color: var(--md-sys-color-surface-container-low, var(--color-background-soft));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.group-header {
  margin: 0;
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--md-sys-color-on-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, var(--color-border));
}

.group-icon {
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

.group-list {
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

md-list-item {
  border-bottom: 1px solid var(--md-sys-color-surface-container-high, var(--color-background));
}

md-list-item:last-child {
  border-bottom: none;
}
</style>
