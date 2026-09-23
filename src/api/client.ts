import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 60_000,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.response?.data?.result || error.message
    return Promise.reject(new Error(message || '请求失败'))
  },
)
