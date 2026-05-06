import re

with open('src/modals/children/AddChildrenToGroupModal.vue', 'r') as f:
    content = f.read()

# Imports
content = content.replace("import { ref, onMounted } from 'vue'", "import { ref, onMounted, watch } from 'vue'")

# State
state_replacement = """const authStore = userAuthStore()
const availableChildren = ref<ChildDto[]>([])
const selectedChildIds = ref<string[]>([])
const isSaving = ref(false)
const searchQuery = ref('')
const isSearching = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null"""
content = content.replace("const authStore = userAuthStore()\nconst availableChildren = ref<ChildDto[]>([])\nconst selectedChildIds = ref<string[]>([])\nconst isSaving = ref(false)", state_replacement)

# loadChildren
load_children_old = """const loadChildren = async () => {
  // Use your existing GET /api/children endpoint here
  const { data, error } = await client.GET('/api/children/search-by-name', {
    headers: { Authorization: `Bearer ${authStore.accessToken}` },
    params: {
      query: {
        limit: 20
      }
    }
  })
  if (data) {
    availableChildren.value = data.items || []
  } else {
    console.error('Unable to load children for AddChildrenToGroupModal: ', error)
    toast.error('An error occured when loading children.')
  }
}"""

load_children_new = """const loadChildren = async () => {
  isSearching.value = true
  
  const queryParams: { limit: number; name?: string } = { limit: 20 }
  if (searchQuery.value.trim()) {
    queryParams.name = searchQuery.value.trim()
  }
  
  // Use your existing GET /api/children endpoint here
  const { data, error } = await client.GET('/api/children/search-by-name', {
    headers: { Authorization: `Bearer ${authStore.accessToken}` },
    params: {
      query: queryParams
    }
  })
  
  if (data) {
    availableChildren.value = data.items || []
  } else {
    console.error('Unable to load children for AddChildrenToGroupModal: ', error)
    toast.error('An error occured when loading children.')
  }
  
  isSearching.value = false
}

// Debounce search requests
watch(searchQuery, () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    loadChildren()
  }, 300)
})"""
content = content.replace(load_children_old, load_children_new)

# closeModal
close_modal_old = """const closeModal = () => {
  selectedChildIds.value = [] // Reset selection
  emit('close')
}"""

close_modal_new = """const closeModal = () => {
  selectedChildIds.value = [] // Reset selection
  searchQuery.value = ''
  emit('close')
}"""
content = content.replace(close_modal_old, close_modal_new)

# Template
template_old = """    <div slot="content" class="dialog-content">
      <!-- List of children with checkboxes could go here -->
      <md-list>"""

template_new = """    <div slot="content" class="dialog-content">
      <md-outlined-text-field
        v-model="searchQuery"
        label="Search children by name"
        class="search-bar"
        :disabled="isSaving"
      ></md-outlined-text-field>

      <div v-if="isSearching" class="loading-state">Loading children...</div>
      <div v-else-if="availableChildren.length === 0" class="empty-state">No children found.</div>
      
      <md-list v-else>"""
content = content.replace(template_old, template_new)

# Style
style_old = """.dialog-content {
  min-width: 400px;
  max-height: 60vh;
  overflow-y: auto;
}"""

style_new = """.dialog-content {
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

.loading-state, .empty-state {
  padding: 16px;
  text-align: center;
  color: var(--md-sys-color-on-surface-variant);
}"""
content = content.replace(style_old, style_new)

with open('src/modals/children/AddChildrenToGroupModal.vue', 'w') as f:
    f.write(content)
