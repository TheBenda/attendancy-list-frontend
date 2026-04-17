<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'
import { toast } from 'vue3-toastify'

type AllowedGroupnameDto = components['schemas']['AllowedGroupnamesDto']

const router = useRouter()
const authStore = userAuthStore()

const allowedGroupnames = ref<AllowedGroupnameDto[]>([])
const isLoading = ref(true)
const isSubmitting = ref(false)

const createModalRef = ref<any>(null)
const newGroupname = ref('')

const fetchAllowedGroupnames = async () => {
  isLoading.value = true

  try {
    const { data, error: apiError } = await client.GET('/api/groups/allowed-groupnames', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })

    if (apiError) {
      console.error('Error fetching allowed groupnames:', apiError)
      toast.error('Failed to load allowed group names. Please try again.')
    } else if (data) {
      allowedGroupnames.value = data.allowedGroupnames || []
    }
  } catch (err) {
    console.error('Failed to fetch allowed groupnames:', err)
    toast.error('An error occurred while loading allowed group names.')
  } finally {
    isLoading.value = false
  }
}

const openCreateModal = () => {
  newGroupname.value = ''
  createModalRef.value?.show()
}

const closeCreateModal = () => {
  createModalRef.value?.close()
}

const createAllowedGroupname = async () => {
  if (!newGroupname.value.trim()) {
    toast.error('Group name is required.')
    return
  }

  isSubmitting.value = true
  try {
    const { error } = await client.POST('/api/groups/allowed-groupnames', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      },
      body: {
        groupName: newGroupname.value.trim()
      }
    })

    if (error) {
      console.error('Error creating allowed groupname:', error)
      toast.error('Failed to create allowed group name. Please try again.')
    } else {
      toast.success('Allowed group name created successfully!')
      closeCreateModal()
      fetchAllowedGroupnames()
    }
  } catch (err) {
    console.error('Failed to create allowed groupname:', err)
    toast.error('An error occurred while creating the allowed group name.')
  } finally {
    isSubmitting.value = false
  }
}

const goBack = () => {
  router.push('/groups')
}

onMounted(() => {
  fetchAllowedGroupnames()
})
</script>

<template>
  <main class="group-management-container">
    <div class="header-section">
      <div class="title-with-back">
        <md-icon-button @click="goBack" class="back-button">
          <md-icon>arrow_back</md-icon>
        </md-icon-button>
        <h1 class="md-typescale-display-small">Allowed Group Names</h1>
      </div>
      <div class="header-actions">
        <md-filled-tonal-button @click="fetchAllowedGroupnames" :disabled="isLoading">
          <md-icon slot="icon">refresh</md-icon>
          Refresh
        </md-filled-tonal-button>
        <md-filled-button @click="openCreateModal">
          <md-icon slot="icon">add</md-icon>
          Create New
        </md-filled-button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <md-circular-progress indeterminate></md-circular-progress>
      <div class="md-typescale-body-large">Loading group names...</div>
    </div>

    <div v-else class="groups-grid">
      <div class="group-card">
        <h2 class="md-typescale-headline-small group-header">
          <md-icon class="group-icon">format_list_bulleted</md-icon>
          All Allowed Group Names
          <span class="count-badge">{{ allowedGroupnames.length }}</span>
        </h2>

        <div v-if="allowedGroupnames.length === 0" class="empty-state">
          <md-icon class="empty-icon">format_list_bulleted</md-icon>
          <div class="md-typescale-body-large">No allowed group names found</div>
        </div>

        <md-list v-else class="group-list">
          <md-list-item v-for="group in allowedGroupnames" :key="group.id">
            <div slot="start" class="avatar">
              {{ group.groupName ? group.groupName.charAt(0).toUpperCase() : 'G' }}
            </div>

            <div slot="headline">
              {{ group.groupName }}
            </div>
          </md-list-item>
        </md-list>
      </div>
    </div>

    <md-dialog ref="createModalRef">
      <div slot="headline">Create Allowed Group Name</div>

      <div slot="content" class="dialog-content">
        <div class="form-container">
          <md-outlined-text-field
            label="Group Name"
            :value="newGroupname"
            @input="(e: any) => newGroupname = e.target.value"
            @keyup.enter="createAllowedGroupname"
            class="full-width"
          ></md-outlined-text-field>
        </div>
      </div>

      <div slot="actions">
        <md-text-button @click="closeCreateModal" :disabled="isSubmitting">Cancel</md-text-button>
        <md-filled-button @click="createAllowedGroupname" :disabled="isSubmitting || !newGroupname.trim()">
          Create
        </md-filled-button>
      </div>
    </md-dialog>
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

.title-with-back {
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-button {
  --md-icon-button-icon-color: var(--md-sys-color-on-background);
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
    grid-template-columns: 1fr;
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

/* Dialog styles */
md-dialog {
  min-width: 400px;
  max-width: 90vw;
}

.dialog-content {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.full-width {
  width: 100%;
}
</style>
