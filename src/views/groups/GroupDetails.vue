<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'
import { toast } from 'vue3-toastify'
import AddChildrenToGroupModal from '@/modals/children/AddChildrenToGroupModal.vue'

type GroupDto = components['schemas']['GetGroupResponse']

const route = useRoute()
const router = useRouter()
const authStore = userAuthStore()

const isLoading = ref(true)

const group = ref<GroupDto | null>(null)

group.value?.responsibleUser!.email

const isAddModalOpen = ref(false)

const openAddChildrenModal = () => {
  isAddModalOpen.value = true
}

const handleChildrenAdded = () => {
  fetchGroupDetails(route.params.id)
}

const formatDate = (timestampSeconds: number | string) => {
  if (timestampSeconds == null) return 'Unknown Date'

  const ts =
    typeof timestampSeconds === 'string' ? parseInt(timestampSeconds, 10) : timestampSeconds

  const date = new Date(ts * 1000)
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')

  return `${y}-${m}-${d}`
}

const navigateToGroupsManagement = () => {
  router.push('/groups')
}

const fetchGroupDetails = async (groupId: string | string[] | undefined) => {
  isLoading.value = true

  if (typeof groupId === 'string' && groupId) {
    try {
      const { data, error: apiError } = await client.GET('/api/groups/{groupId}', {
        params: {
          path: { groupId: groupId },
        },
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      })

      if (apiError) {
        console.error('Error fetching group details:', apiError)
        toast.error('Failed to load group details. Please try again.')
      } else if (data) {
        group.value = data
      }
    } catch (err) {
      console.error('Failed to fetch group details:', err)
      toast.error('An error occurred while loading group details.')
    } finally {
      isLoading.value = false
    }
  } else {
    console.error('Failed to fetch group as groupId was not properly set:', groupId)
    toast.error('An error occurred while loading group details.')
    isLoading.value = false
    navigateToGroupsManagement()
  }
}

watch(
  () => route.params.id,
  (newId) => {
    fetchGroupDetails(newId)
  },
  { immediate: true },
)
</script>
<template>
  <main class="group-details-container">
    <div class="header-section">
      <h1 class="md-typescale-display-small">Group Detail</h1>
      <div class="header-actions">
        <md-filled-tonal-button @click="navigateToGroupsManagement" class="back-button">
          <md-icon slot="icon">arrow_back</md-icon>
        </md-filled-tonal-button>
        <md-filled-tonal-button @click="fetchGroupDetails" :disabled="isLoading">
          <md-icon slot="icon">refresh</md-icon>
          Refresh
        </md-filled-tonal-button>
        <md-filled-button @click="openAddChildrenModal">
          <md-icon slot="icon">person_add</md-icon>
          Add Children
        </md-filled-button>
      </div>
    </div>
  </main>

  <div v-if="isLoading" class="loading-state">
    <md-circular-progress indeterminate></md-circular-progress>
    <div class="md-typescale-body-large">Loading group details...</div>
  </div>

  <div v-else-if="group" class="group-details-grid">
    <aside class="meta-section">
      <div class="detail-card">
        <div class="card-header">
          <md-icon>person</md-icon>
          <h3 class="md-typescale-title-medium">Responsible User</h3>
        </div>
        <div class="card-content">
          <p class="md-typescale-body-large">
            {{ group.responsibleUser!.firstName }} {{ group.responsibleUser!.lastName }}
          </p>
          <p class="md-typescale-body-medium text-muted">
            {{ group.responsibleUser!.email || 'No email provided' }}
          </p>
        </div>
      </div>

      <div class="detail-card">
        <div class="card-header">
          <md-icon>calendar_today</md-icon>
          <h3 class="md-typescale-title-medium">Academic Year</h3>
        </div>
        <div class="card-content">
          <p class="md-typescale-body-medium">Start: {{ group.academicYear!.startDate }}</p>
          <p class="md-typescale-body-medium">End: {{ group.academicYear!.endDate }}</p>
        </div>
      </div>

      <div class="detail-card">
        <div class="card-header">
          <md-icon>category</md-icon>
          <h3 class="md-typescale-title-medium">Category</h3>
        </div>
        <div class="card-content">
          <p class="md-typescale-body-large">
            {{ group.allowedGroupName!.groupName }}
          </p>
        </div>
      </div>
    </aside>

    <section class="main-section">
      <div class="detail-card children-card">
        <div class="card-header">
          <md-icon>child_care</md-icon>
          <h2 class="md-typescale-headline-small">
            Enrolled Children
            <span class="count-badge">{{ group.children.length }}</span>
          </h2>
        </div>

        <div v-if="group.children.length === 0" class="empty-state">
          <md-icon class="empty-icon">sentiment_very_dissatisfied</md-icon>
          <div class="md-typescale-body-large">No children found</div>
        </div>

        <md-list v-else class="child-list">
          <md-list-item v-for="child in group.children" :key="child.id" type="button">
            <div slot="start" class="avatar">
              {{ child.firstName ? child.firstName.charAt(0).toUpperCase() : 'C' }}
            </div>

            <div slot="headline">{{ child.firstName }} {{ child.lastName }}</div>

            <div slot="supporting-text">
              <span v-if="child.dateOfBirth != null">
                DOB: {{ formatDate(child.dateOfBirth) }}
              </span>
            </div>

            <md-icon slot="end">chevron_right</md-icon>
          </md-list-item>
        </md-list>
      </div>
    </section>
  </div>

  <div v-else class="error-state">
    <p>Die Gruppendetails konnten nicht geladen werden.</p>
  </div>

  <AddChildrenToGroupModal v-if="group" :group-id="group.id" :is-open="isAddModalOpen" @close="isAddModalOpen = false"
    @added="handleChildrenAdded" />
</template>
<style scoped>
.group-details-container {
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

.back-button {
  --md-icon-button-icon-color: var(--md-sys-color-on-background);
}

.child-list {
  --md-list-container-color: transparent;
  flex-grow: 1;
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

.group-details-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-items: start;
}

@media (min-width: 1024px) {
  .group-details-grid {
    /* Linke Spalte schmaler, rechte breiter */
    grid-template-columns: 350px 1fr;
  }
}

.meta-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* Wiederverwendbares Karten-Styling ähnlich wie .child-card */
.detail-card {
  background-color: var(--md-sys-color-surface-container-low, var(--color-background-soft));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 16px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid var(--md-sys-color-outline-variant, var(--color-border));
  color: var(--md-sys-color-primary);
}

.card-header h2,
.card-header h3 {
  margin: 0;
  color: var(--md-sys-color-on-surface);
}

.card-content {
  padding: 16px 24px;
  color: var(--md-sys-color-on-surface);
}

.card-content p {
  margin: 4px 0;
}

.text-muted {
  color: var(--md-sys-color-on-surface-variant);
}

.children-card {
  height: 100%;
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
</style>
