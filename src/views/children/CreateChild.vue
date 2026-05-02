<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import { VueDatePicker } from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import type { components } from '@/stores/api/apiclient'

type UserDto = components['schemas']['UserDto']

const authStore = userAuthStore()
const router = useRouter()

const firstName = ref('')
const lastName = ref('')
const dateOfBirth = ref<Date | null>(null)
const selectedGuardianIds = ref<string[]>([])

const parents = ref<UserDto[]>([])
const isLoadingParents = ref(true)
const isLoading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

onMounted(async () => {
  try {
    const { data, error } = await client.GET('/api/users/by-role', {
      params: {
        query: { userRole: 'Parent' }
      },
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })

    if (error) {
      console.error('Failed to fetch parents', error)
      errorMsg.value = 'Failed to load parents for selection.'
    } else if (data && data.users) {
      parents.value = data.users
    }
  } catch (e) {
    console.error(e)
    errorMsg.value = 'An unexpected error occurred while loading parents.'
  } finally {
    isLoadingParents.value = false
  }
})

const submitForm = async () => {
  if (!firstName.value || !lastName.value || !dateOfBirth.value) {
    errorMsg.value = 'First Name, Last Name, and Date of Birth are required'
    return
  }

  // Parse date to Unix timestamp in seconds
  const timestampSeconds = Math.floor(dateOfBirth.value.getTime() / 1000)

  isLoading.value = true
  errorMsg.value = null
  successMsg.value = null

  try {
    const { error } = await client.POST('/api/children', {
      body: {
        firstName: firstName.value,
        lastName: lastName.value,
        dateOfBirth: timestampSeconds,
        guardianIds: selectedGuardianIds.value
      },
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`
      }
    })

    if (error) {
      console.error('Failed to create child:', error)
      errorMsg.value = 'Failed to create child. Please check the details and try again.'
    } else {
      successMsg.value = 'Child registered successfully!'
      setTimeout(() => {
        router.push('/children')
      }, 1500)
    }
  } catch (err) {
    console.error('Error:', err)
    errorMsg.value = 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}

const goBack = () => {
  router.push('/children')
}
</script>

<template>
  <main class="create-child-container">
    <div class="header-section">
      <div class="title-with-back">
        <md-icon-button @click="goBack" class="back-button">
          <md-icon>arrow_back</md-icon>
        </md-icon-button>
        <h1 class="md-typescale-display-small">Register Child</h1>
      </div>
    </div>

    <div v-if="errorMsg" class="error-container">
      <md-icon>error</md-icon>
      <span class="md-typescale-body-large">{{ errorMsg }}</span>
    </div>

    <div v-if="successMsg" class="success-container">
      <md-icon>check_circle</md-icon>
      <span class="md-typescale-body-large">{{ successMsg }}</span>
    </div>

    <form @submit.prevent="submitForm" class="child-form">
      <md-outlined-text-field
        label="First Name *"
        type="text"
        :value="firstName"
        @input="firstName = $event.target.value"
        required
      ></md-outlined-text-field>

      <md-outlined-text-field
        label="Last Name *"
        type="text"
        :value="lastName"
        @input="lastName = $event.target.value"
        required
      ></md-outlined-text-field>

      <div class="date-picker-container">
        <label for="dob-input" class="md-typescale-body-medium input-label">Date of Birth *</label>
        <VueDatePicker
          id="dob-input"
          v-model="dateOfBirth"
          :enable-time-picker="false"
          auto-apply
          placeholder="Select Date of Birth"
          required
        />
      </div>

      <div class="guardian-selector">
        <label for="guardian-select" class="md-typescale-body-medium input-label">Guardians (Optional)</label>
        <div v-if="isLoadingParents" class="loading-parents">Loading parents...</div>
        <select
          v-else
          id="guardian-select"
          v-model="selectedGuardianIds"
          multiple
          class="native-select"
        >
          <option v-for="parent in parents" :key="parent.id" :value="parent.id">
            {{ parent.firstName }} {{ parent.lastName }} ({{ parent.email }})
          </option>
        </select>
        <div class="helper-text">Hold Ctrl (Windows) or Cmd (Mac) to select multiple.</div>
      </div>

      <div class="form-actions">
        <md-text-button type="button" @click="goBack" :disabled="isLoading">
          Cancel
        </md-text-button>
        <md-filled-button type="submit" :disabled="isLoading">
          Register
        </md-filled-button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.create-child-container {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.header-section {
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
  margin-bottom: 24px;
}

.success-container {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: var(--md-sys-color-primary-container);
  color: var(--md-sys-color-on-primary-container);
  border-radius: 12px;
  margin-bottom: 24px;
}

.child-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  background-color: var(--md-sys-color-surface-container-low, var(--color-background-soft));
  padding: 32px;
  border-radius: 16px;
}

md-outlined-text-field {
  width: 100%;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  color: var(--md-sys-color-on-surface-variant);
}

.date-picker-container {
  display: flex;
  flex-direction: column;
}

.native-date-input {
  padding: 16px;
  font-family: inherit;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  background-color: transparent;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  outline: none;
}

.native-date-input:focus {
  border-color: var(--md-sys-color-primary, #6750a4);
  border-width: 2px;
  padding: 15px; /* offset for thicker border */
}

.guardian-selector {
  display: flex;
  flex-direction: column;
}

.loading-parents {
  padding: 16px;
  color: var(--md-sys-color-on-surface-variant);
  font-style: italic;
}

.native-select {
  padding: 8px;
  font-family: inherit;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  background-color: transparent;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  outline: none;
  min-height: 120px;
}

.native-select:focus {
  border-color: var(--md-sys-color-primary, #6750a4);
  border-width: 2px;
  padding: 7px; /* offset for thicker border */
}

.native-select option {
  padding: 8px;
}

.helper-text {
  margin-top: 6px;
  font-size: 0.875rem;
  color: var(--md-sys-color-on-surface-variant);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 16px;
}
</style>
