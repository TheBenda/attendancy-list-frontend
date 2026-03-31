<script setup lang="ts">
import { ref } from 'vue'
import client from '@/stores/apiAdapter'
import { userAuthStore } from '@/stores/userAuth'
import type { components } from '@/stores/api/apiclient'

type UserRole = components['schemas']['UserRole']

const authStore = userAuthStore()

const email = ref('')
const password = ref('')
const firstName = ref('')
const lastName = ref('')
const selectedRole = ref<UserRole | ''>('')

const roles: UserRole[] = ['Admin', 'CoAdmin', 'Team', 'Parent']

const isLoading = ref(false)
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)

const submitForm = async () => {
  if (!email.value || !password.value || !selectedRole.value) {
    errorMsg.value = 'Email, password, and role are required'
    return
  }

  isLoading.value = true
  errorMsg.value = null
  successMsg.value = null

  try {
    const { data, error } = await client.POST('/api/users', {
      body: {
        email: email.value,
        password: password.value,
        firstName: firstName.value || null,
        lastName: lastName.value || null,
      },
      headers: {
        Authorization: `Bearer ${authStore.accessToken}`,
      },
    })

    if (error) {
      console.error('Failed to create user:', error)
      errorMsg.value = 'Failed to create user. Please check the details and try again.'
    } else if (data && data.id) {
      // User created successfully, now assign role
      const { error: roleError } = await client.POST('/api/users/{userId}/roles', {
        params: {
          path: {
            userId: data.id,
          },
        },
        body: {
          role: selectedRole.value,
        },
        headers: {
          Authorization: `Bearer ${authStore.accessToken}`,
        },
      })

      if (roleError) {
        console.error('Failed to assign role:', roleError)
        errorMsg.value = 'User was created, but failed to assign the role.'
      } else {
        successMsg.value = 'User created and role assigned successfully!'
        // Reset form
        email.value = ''
        password.value = ''
        firstName.value = ''
        lastName.value = ''
        selectedRole.value = ''
      }
    }
  } catch (err) {
    console.error('Error:', err)
    errorMsg.value = 'An unexpected error occurred.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <main class="create-user-container">
    <div class="header-section">
      <h1 class="md-typescale-display-small">Create New User</h1>
    </div>

    <div v-if="errorMsg" class="error-container">
      <md-icon>error</md-icon>
      <span class="md-typescale-body-large">{{ errorMsg }}</span>
    </div>

    <div v-if="successMsg" class="success-container">
      <md-icon>check_circle</md-icon>
      <span class="md-typescale-body-large">{{ successMsg }}</span>
    </div>

    <form @submit.prevent="submitForm" class="user-form">
      <md-outlined-text-field
        label="Email *"
        type="email"
        :value="email"
        @input="email = $event.target.value"
        required
      ></md-outlined-text-field>

      <md-outlined-text-field
        label="Password *"
        type="password"
        :value="password"
        @input="password = $event.target.value"
        required
      ></md-outlined-text-field>

      <md-outlined-text-field
        label="First Name"
        type="text"
        :value="firstName"
        @input="firstName = $event.target.value"
      ></md-outlined-text-field>

      <md-outlined-text-field
        label="Last Name"
        type="text"
        :value="lastName"
        @input="lastName = $event.target.value"
      ></md-outlined-text-field>

      <div class="role-selector">
        <label for="role-select" class="md-typescale-body-medium" style="margin-bottom: 8px; display: block; color: var(--md-sys-color-on-surface-variant);">Role *</label>
        <select
          id="role-select"
          v-model="selectedRole"
          required
          class="native-select"
        >
          <option value="" disabled>Select a role</option>
          <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>

      <div class="form-actions">
        <md-filled-button type="submit" @click="submitForm" :disabled="isLoading || !selectedRole">
          Submit
        </md-filled-button>
      </div>
    </form>
  </main>
</template>

<style scoped>
.create-user-container {
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
}

.header-section {
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

.user-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: var(--md-sys-color-surface-container-low, var(--color-background-soft));
  padding: 32px;
  border-radius: 16px;
}

md-outlined-text-field {
  width: 100%;
}

.role-selector {
  display: flex;
  flex-direction: column;
}

.native-select {
  padding: 16px;
  font-family: inherit;
  font-size: 1rem;
  border-radius: 4px;
  border: 1px solid var(--md-sys-color-outline, #79747e);
  background-color: transparent;
  color: var(--md-sys-color-on-surface, #1c1b1f);
  outline: none;
  appearance: none;
  cursor: pointer;
}

.native-select:focus {
  border-color: var(--md-sys-color-primary, #6750a4);
  border-width: 2px;
  padding: 15px; /* offset for thicker border */
}

.native-select:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
