<script setup lang="ts">
import type { components } from '@/stores/api/apiclient'

type ChildDto = components['schemas']['GetChildResponse']

defineProps<{
  children: ChildDto[]
  hasMore: boolean
  isLoadingMore: boolean
}>()

const emit = defineEmits<{
  (e: 'load-more'): void
  (e: 'child-click', childId: string | number): void
}>()

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
</script>

<template>
  <div>
    <!-- Empty State -->
    <div v-if="children.length === 0" class="empty-state">
      <md-icon class="empty-icon">sentiment_very_dissatisfied</md-icon>
      <div class="md-typescale-body-large">No children found</div>
    </div>

    <!-- Liste -->
    <md-list v-else class="child-list">
      <md-list-item
        v-for="child in children"
        :key="child.id"
        type="button"
        @click="emit('child-click', child.id)"
      >
        <div slot="start" class="avatar">
          {{ child.firstName ? child.firstName.charAt(0).toUpperCase() : 'C' }}
        </div>

        <div slot="headline">{{ child.firstName }} {{ child.lastName }}</div>

        <div slot="supporting-text">
          <span v-if="child.dateOfBirth != null"> DOB: {{ formatDate(child.dateOfBirth) }} </span>
        </div>

        <md-icon slot="end">chevron_right</md-icon>
      </md-list-item>
    </md-list>

    <!-- Load More Button -->
    <div v-if="hasMore" class="load-more-container">
      <md-text-button @click="emit('load-more')" :disabled="isLoadingMore">
        <span v-if="isLoadingMore">Loading...</span>
        <span v-else>Load More</span>
      </md-text-button>
    </div>
  </div>
</template>

<style scoped>
/* Hier fügst du die spezifischen CSS-Klassen für die Liste aus [1] ein: */
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
