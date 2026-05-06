<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'
import { toast } from 'vue3-toastify'

type ChildDto = components['schemas']['GetChildResponse']

const props = defineProps<{
  groupId: string
  isOpen: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'added'): void
}>()

const authStore = userAuthStore()
const availableChildren = ref<ChildDto[]>([])
const selectedChildIds = ref<string[]>([])
const isSaving = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const loadChildren = async () => {
  isSearching.value = true

  const queryParams: { limit: number; name?: string } = { limit: 20 }
  if (searchQuery.value.trim()) {
    queryParams.name = searchQuery.value.trim()
  }

  // Use your existing GET /api/children endpoint here
  const { data, error } = await client.GET('/api/children/search-by-name', {
    headers: { Authorization: `Bearer ${authStore.accessToken}` },
    params: {
      query: queryParams,
    },
  })

  if (data) {
    availableChildren.value = data.items || []
  } else {
    console.error('Unable to load children for AddChildrenToGroupModal: ', error)
    toast.error('An error occured when loading children.')
  }

  isSearching.value = false
}

watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadChildren()
  }, 300)
})

const saveChildrenToGroup = async () => {
  isSaving.value = true
  try {
    const { error } = await client.POST('/api/groups/{groupId}/children', {
      params: { path: { groupId: props.groupId } },
      body: { childIds: selectedChildIds.value },
      headers: { Authorization: `Bearer ${authStore.accessToken}` },
    })

    if (error) {
      console.error('An error occured when adding children to group:', error)
      toast.error('An error occured when adding children to group')
      closeModal()
    }

    toast.success('Children successfully added!')
    emit('added') // Tell parent to refresh data
    closeModal()
  } catch (err) {
    toast.error('Failed to add children.')
  } finally {
    isSaving.value = false
  }
}

const closeModal = () => {
  selectedChildIds.value = [] // Reset selection
  searchQuery.value = ''
  emit('close')
}

onMounted(loadChildren)
</script>

<template>
  <md-dialog :open="isOpen" @closed="closeModal">
    <div slot="headline">Add Children to Group</div>

    <div slot="content" class="dialog-content">
      <md-outlined-text-field
        v-model="searchQuery"
        label="Search children by name"
        class="search-bar"
        :disabled="isSaving"
      ></md-outlined-text-field>

      <div v-if="isSearching" class="loading-state">Loading children...</div>
      <div v-else-if="availableChildren.length === 0" class="empty-state">No children found.</div>

      <md-list v-else>
        <md-list-item v-for="child in availableChildren" :key="child.id">
          <div slot="headline">{{ child.firstName }} {{ child.lastName }}</div>
          <!-- Simplified selection mechanism -->
          <input type="checkbox" :value="child.id" v-model="selectedChildIds" slot="end" />
        </md-list-item>
      </md-list>
    </div>

    <div slot="actions">
      <md-text-button @click="closeModal">Cancel</md-text-button>
      <md-filled-button
        @click="saveChildrenToGroup"
        :disabled="isSaving || selectedChildIds.length === 0"
      >
        <span v-if="isSaving">Saving...</span>
        <span v-else>Add Selected</span>
      </md-filled-button>
    </div>
  </md-dialog>
</template>

<style scoped>
.dialog-content {
  min-width: 400px;
  max-height: 60vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.search-bar {
  width: 100%;
}

.loading-state,
.empty-state {
  padding: 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}
</style>
