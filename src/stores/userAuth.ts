import { defineStore } from 'pinia'
import client from '@/stores/apiAdapter'
import router from '@/router'
import { ref } from 'vue'
import type { components } from '@/stores/api/apiclient'

export const userAuthStore = defineStore('user-auth', {
  state: () => ({
    user: ref<components>().value?.schemas.UserDto,
    accessToken: undefined as string | undefined,
    refreshToken: undefined as string | undefined,
  }),
  actions: {
    logout() {
      this.user = undefined
      this.accessToken = undefined
      this.refreshToken = undefined
      router.push('/')
    },
    async login(email: string, password: string) {
      console.log('login for ${email} with ${password}')
      try {
        const { data, error } = await client.POST('/api/auth/login', {
          body: {
            email: email,
            password: password,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        })

        if (error) {
          console.error(error)
        } else {
          console.info('Post erfolgreich')

          this.user = data.user
          this.accessToken = data.accessToken
        }

        router.push('/')
      } catch (error) {
        console.error(error)
      }
    },
  },
})

export default userAuthStore
