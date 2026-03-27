import { defineStore } from 'pinia'

export const alertStore = defineStore('alert', {
  state: () => ({
    alert: null as UserAlert | null,
  }),
  actions: {
    success(message: string) {
      this.alert = { message, type: AlertType.success }
    },
    error(message: string) {
      this.alert = { message, type: AlertType.danger }
    },
    clear() {
      this.alert = null
    },
  },
})

export default alertStore

export interface UserAlert {
  message: string
  type: AlertType
}

export enum AlertType {
  success,
  danger,
}
