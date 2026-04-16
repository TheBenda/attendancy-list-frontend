<script setup lang="ts">
import { ref, computed } from 'vue'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'
import { toast } from 'vue3-toastify'

type AllowedGroupnameDto = components['schemas']['AllowedGroupnamesDto']
type AcademicYearDto = components['schemas']['AcademicYearDto']
type UserDto = components['schemas']['UserDto']

const authStore = userAuthStore()
const emit = defineEmits<{
  (e: 'group-created'): void
}>()

const dialogRef = ref<any>(null)

const groupnames = ref<AllowedGroupnameDto[]>([])
const academicYears = ref<AcademicYearDto[]>([])
const users = ref<UserDto[]>([])
const isLoadingData = ref(false)
const isSubmitting = ref(false)

const selectedGroupnameId = ref<string>('')
const selectedAcademicYearId = ref<string>('')
const selectedResponsibleUserId = ref<string>('')

const searchEmail = ref<string>('')
const showUserList = ref<boolean>(false)

const filteredUsers = computed(() => {
  if (!searchEmail.value) return users.value
  const query = searchEmail.value.toLowerCase()
  return users.value.filter(u => u.email?.toLowerCase().includes(query))
})

const selectUser = (user: UserDto) => {
  selectedResponsibleUserId.value = user.id
  searchEmail.value = user.email || ''
  showUserList.value = false
}

const onBlurSearch = () => {
  setTimeout(() => {
    showUserList.value = false
  }, 200)
}

const fetchData = async () => {
  isLoadingData.value = true
  try {
    const headers = { Authorization: `Bearer ${authStore.accessToken}` }

    const [groupnamesResponse, academicYearsResponse, usersResponse] = await Promise.all([
      client.GET('/api/groups/allowed-groupnames', { headers }),
      client.GET('/api/groups/academic-years', { headers }),
      client.GET('/api/users', { headers })
    ])

    const { data: groupnamesData, error: groupnamesError } = groupnamesResponse
    const { data: academicYearsData, error: academicYearsError } = academicYearsResponse
    const { data: usersData, error: usersError } = usersResponse

    if (groupnamesError) {
      console.error('Error fetching allowed groupnames', groupnamesError)
      toast.error('Failed to load allowed group names')
    } else if (groupnamesData) {
      groupnames.value = groupnamesData.allowedGroupnames || []
    }

    if (academicYearsError) {
      console.error('Error fetching academic years', academicYearsError)
      toast.error('Failed to load academic years')
    } else if (academicYearsData) {
      academicYears.value = academicYearsData || []
    }

    if (usersError) {
      console.error('Error fetching users', usersError)
      toast.error('Failed to load users')
    } else if (usersData) {
      users.value = usersData.users || []
    }
  } catch (err) {
    console.error('Failed to fetch modal data', err)
    toast.error('An error occurred while loading form data.')
  } finally {
    isLoadingData.value = false
  }
}

const openModal = async () => {
  selectedGroupnameId.value = ''
  selectedAcademicYearId.value = ''
  selectedResponsibleUserId.value = ''
  searchEmail.value = ''
  dialogRef.value?.show()
  await fetchData()
}

const closeModal = () => {
  dialogRef.value?.close()
}

const createGroup = async () => {
  if (!selectedGroupnameId.value || !selectedAcademicYearId.value) {
    toast.error('Please select both a group name and an academic year.')
    return
  }

  if (!selectedResponsibleUserId.value) {
    toast.error('Please select a responsible user.')
    return
  }

  const selectedGroupname = groupnames.value.find(g => g.id === selectedGroupnameId.value)
  if (!selectedGroupname) return

  if (!authStore.user?.id) {
    toast.error('You must be logged in to create a group.')
    return
  }

  isSubmitting.value = true
  try {
    const { error } = await client.POST('/api/groups', {
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      },
      body: {
        groupnameId: selectedGroupnameId.value,
        groupName: selectedGroupname.groupName,
        academicYearId: selectedAcademicYearId.value,
        responsibleUserId: selectedResponsibleUserId.value
      }
    })

    if (error) {
      console.error('Error creating group:', error)
      toast.error('Failed to create group. Please try again.')
    } else {
      toast.success('Group created successfully!')
      emit('group-created')
      closeModal()
    }
  } catch (err) {
    console.error('Failed to create group:', err)
    toast.error('An error occurred while creating the group.')
  } finally {
    isSubmitting.value = false
  }
}

// Expose openModal so the parent component can call it
defineExpose({
  openModal
})
</script>

<template>
  <md-dialog ref="dialogRef">
    <div slot="headline">Create New Group</div>

    <div slot="content" class="dialog-content">
      <div v-if="isLoadingData" class="loading-state">
        <md-circular-progress indeterminate></md-circular-progress>
        <div style="margin-top: 12px; color: var(--md-sys-color-on-surface-variant);">Loading data...</div>
      </div>

      <div v-else class="form-container">
        <md-outlined-select label="Group Name" @change="(e: any) => selectedGroupnameId = e.target.value">
          <md-select-option v-for="gn in groupnames" :key="gn.id" :value="gn.id">
            <div slot="headline">{{ gn.groupName }}</div>
          </md-select-option>
        </md-outlined-select>

        <md-outlined-select label="Academic Year" @change="(e: any) => selectedAcademicYearId = e.target.value">
          <md-select-option v-for="ay in academicYears" :key="ay.id" :value="ay.id">
            <div slot="headline">
              {{ new Date(ay.startDate).getFullYear() }} - {{ new Date(ay.endDate).getFullYear() }}
            </div>
          </md-select-option>
        </md-outlined-select>

        <div class="search-field-container">
          <md-outlined-text-field label="Responsible User" :value="searchEmail"
            @input="(e: any) => searchEmail = e.target.value" @focus="showUserList = true" @blur="onBlurSearch"
            class="full-width">
            <md-icon slot="leading-icon">search</md-icon>
          </md-outlined-text-field>

          <div v-if="showUserList && filteredUsers.length > 0" class="autocomplete-list">
            <md-list>
              <md-list-item v-for="user in filteredUsers" :key="user.id" type="button" @click="selectUser(user)">
                <div slot="headline">{{ user.email || 'No email' }}</div>
                <div slot="supporting-text">{{ user.firstName }} {{ user.lastName }}</div>
              </md-list-item>
            </md-list>
          </div>
        </div>
      </div>
    </div>

    <div slot="actions">
      <md-text-button @click="closeModal" :disabled="isSubmitting">Cancel</md-text-button>
      <md-filled-button @click="createGroup"
        :disabled="isSubmitting || !selectedGroupnameId || !selectedAcademicYearId || !selectedResponsibleUserId">
        Create
      </md-filled-button>
    </div>
  </md-dialog>
</template>

<style scoped>
md-dialog {
  min-width: 640px;
  min-height: 360px;
  /* Material Web dialog handles centering automatically, but we can set max limits if needed */
  max-width: 90vw;
  max-height: 90vh;
}

.dialog-content {
  min-width: 600px;
  min-height: 450px;
  display: flex;
  flex-direction: column;
}

.loading-state {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 250px;
}

.form-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding-top: 8px;
}

md-outlined-select,
.full-width {
  width: 100%;
}

.search-field-container {
  position: relative;
  width: 100%;
}

.autocomplete-list {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  background-color: var(--md-sys-color-surface-container, var(--color-background-soft));
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--md-sys-color-outline-variant, var(--color-border));
}

.autocomplete-list md-list-item {
  border-bottom: 1px solid var(--md-sys-color-outline-variant, var(--color-border));
}

.autocomplete-list md-list-item:last-child {
  border-bottom: none;
}
</style>
