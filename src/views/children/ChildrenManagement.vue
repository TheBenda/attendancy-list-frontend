<script setup lang="ts">
import { ref, onMounted } from 'vue'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'
import { toast } from 'vue3-toastify'

type ChildDto = components['schemas']['GetChildResponse']
type LocalDate = components['schemas']['LocalDate']

const authStore = userAuthStore()

const children = ref<ChildDto[]>([])
const isLoading = ref(true)
const isLoadingMore = ref(false)
const hasMore = ref(false)
const currentCursor = ref<string | null>(null)
const PAGE_LIMIT = 20

const formatLocalDate = (date: LocalDate) => {
  if (!date.year || !date.month || !date.day) return 'Unknown Date'

  // Create a string like "2023-05-12" to be easily formatted or just format directly
  const y = date.year
  const m = String(date.month).padStart(2, '0')
  const d = String(date.day).padStart(2, '0')

  return `${y}-${m}-${d}` // simple YYYY-MM-DD
}

const fetchChildren = async (reset = false) => {
  if (reset) {
    isLoading.value = true
    children.value = []
    currentCursor.value = null
  } else {
    isLoadingMore.value = true
  }

  try {
    const { data, error: apiError } = await client.GET('/api/children', {
      params: {
        query: {
          cursor: currentCursor.value || undefined,
          limit: PAGE_LIMIT
        }
      },
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })

    if (apiError) {
      console.error('Error fetching children:', apiError)
      toast.error('Failed to load children. Please try again.')
    } else if (data) {
      if (reset) {
        children.value = data.items || []
      } else {
        children.value = [...children.value, ...(data.items || [])]
      }

      hasMore.value = data.hasMore || false
      if (data.cursor && data.cursor.cursor) {
        currentCursor.value = data.cursor.cursor
      } else {
        currentCursor.value = null
      }
    }
  } catch (err) {
    console.error('Failed to fetch children:', err)
    toast.error('An error occurred while loading children.')
  } finally {
    isLoading.value = false
    isLoadingMore.value = false
  }
}

const loadMore = () => {
  if (hasMore.value && !isLoadingMore.value) {
    fetchChildren(false)
  }
}

onMounted(() => {
  fetchChildren(true)
})
</script>

<template>
  <main class="children-management-container">
    <div class="header-section">
      <h1 class="md-typescale-display-small">Children Management</h1>
      <div class="header-actions">
        <md-filled-tonal-button @click="fetchChildren(true)" :disabled="isLoading">
          <md-icon slot="icon">refresh</md-icon>
          Refresh
        </md-filled-tonal-button>
        <md-filled-button>
          <md-icon slot="icon">add</md-icon>
          Register Child
        </md-filled-button>
      </div>
    </div>

    <div v-if="isLoading" class="loading-state">
      <md-circular-progress indeterminate></md-circular-progress>
      <div class="md-typescale-body-large">Loading children...</div>
    </div>

    <div v-else class="children-grid">
      <div class="child-card">
        <h2 class="md-typescale-headline-small child-header">
          <md-icon class="child-icon">child_care</md-icon>
          All Children
          <span class="count-badge">{{ children.length }}</span>
        </h2>

        <div v-if="children.length === 0" class="empty-state">
          <md-icon class="empty-icon">sentiment_very_dissatisfied</md-icon>
          <div class="md-typescale-body-large">No children found</div>
        </div>

        <md-list v-else class="child-list">
          <md-list-item v-for="child in children" :key="child.id" type="button">
            <div slot="start" class="avatar">
              {{ child.firstName ? child.firstName.charAt(0).toUpperCase() : 'C' }}
            </div>

            <div slot="headline">
              {{ child.firstName }} {{ child.lastName }}
            </div>

            <div slot="supporting-text">
              <span v-if="child.dateOfBirth">
                DOB: {{ formatLocalDate(child.dateOfBirth) }}
              </span>
            </div>

            <md-icon slot="end">chevron_right</md-icon>
          </md-list-item>
        </md-list>

        <div v-if="hasMore" class="load-more-container">
          <md-text-button @click="loadMore" :disabled="isLoadingMore">
            <span v-if="isLoadingMore">Loading...</span>
            <span v-else>Load More</span>
          </md-text-button>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.children-management-container {
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

.children-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
}

.child-card {
  background-color: var(--md-sys-color-surface-container-low, var(--color-background-soft));
  border-radius: 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.child-header {
  margin: 0;
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  color: var(--md-sys-color-on-surface);
  border-bottom: 1px solid var(--md-sys-color-outline-variant, var(--color-border));
}

.child-icon {
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

.child-list {
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

.load-more-container {
  display: flex;
  justify-content: center;
  padding: 16px;
  border-top: 1px solid var(--md-sys-color-surface-container-high, var(--color-background));
}
</style>
