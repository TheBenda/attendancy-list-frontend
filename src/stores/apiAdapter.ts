import type { paths } from '@/stores/api/apiclient'
import createClient from 'openapi-fetch'

export const apiUrl = import.meta.env.VITE_API_HTTP ?? 'http://localhost:5000'

console.log(apiUrl)
const client = createClient<paths>({ baseUrl: apiUrl })

export default client
