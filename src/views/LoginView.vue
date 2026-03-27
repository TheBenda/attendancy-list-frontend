<script setup lang="ts">
import { ref, reactive } from 'vue'
import userAuth from '@/stores/userAuth'
import { useRouter } from 'vue-router'

const login = reactive({
  email: 'john.doe@company.com',
  password: '•••••••••',
})

const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const router = useRouter()

const onSubmit = async () => {
  const authStore = userAuth()
  errorMessage.value = null

  if (!login.email || !login.password) {
    errorMessage.value = 'Please enter both email and password.'
    return
  }

  try {
    isLoading.value = true
    await authStore.login(login.email, login.password)
    router.push('/')
  } catch (err: any) {
    errorMessage.value = err?.message ?? 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="login-wrapper">
    <div class="login-card">
      <h2 class="login-title">Login</h2>
      <form @submit.prevent="onSubmit" class="login-form">
        <!-- Email -->
        <md-outlined-text-field
          id="email"
          label="Email address"
          type="email"
          autocomplete="email"
          :value="login.email"
          @input="login.email = $event.target.value"
          :error="!!errorMessage"
          required
        ></md-outlined-text-field>

        <!-- Password -->
        <md-outlined-text-field
          id="password"
          label="Password"
          type="password"
          autocomplete="current-password"
          :value="login.password"
          @input="login.password = $event.target.value"
          :error="!!errorMessage"
          :error-text="errorMessage || ''"
          required
        ></md-outlined-text-field>

        <!-- Submit -->
        <md-filled-button type="submit" class="submit-button" :disabled="isLoading">
          {{ isLoading ? 'Logging in…' : 'Login' }}
        </md-filled-button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 1.5rem;
}

.login-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 400px;
  padding: 2.5rem 2rem;
  background-color: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.login-title {
  margin: 0 0 1.5rem 0;
  font-size: 1.75rem;
  font-weight: 600;
  text-align: center;
  color: var(--color-heading);
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

md-outlined-text-field,
.submit-button {
  width: 100%;
}

.submit-button {
  margin-top: 0.5rem;
  --md-filled-button-container-height: 48px;
}
</style>
