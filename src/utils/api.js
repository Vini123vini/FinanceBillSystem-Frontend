import axios from 'axios'

const api = axios.create({ baseURL: '/api', timeout: 20000 })

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('kk_token')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

api.interceptors.response.use(
  r => r,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kk_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

export const authAPI = {
  login:          d  => api.post('/auth/login', d),
  register:       d  => api.post('/auth/register', d),
  me:             () => api.get('/auth/me'),
  updateProfile:  d  => api.put('/auth/profile', d),
  updatePassword: d  => api.put('/auth/password', d),
}

export const dashAPI     = { stats: () => api.get('/dashboard/stats') }

export const clientsAPI  = {
  list:   p  => api.get('/clients', { params: p }),
  get:    id => api.get(`/clients/${id}`),
  create: d  => api.post('/clients', d),
  update: (id, d) => api.put(`/clients/${id}`, d),
  delete: id => api.delete(`/clients/${id}`),
}

export const invoicesAPI = {
  list:      p  => api.get('/invoices', { params: p }),
  get:       id => api.get(`/invoices/${id}`),
  create:    d  => api.post('/invoices', d),
  update:    (id, d) => api.put(`/invoices/${id}`, d),
  setStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),
  delete:    id => api.delete(`/invoices/${id}`),
}

export const paymentsAPI = {
  list:   p  => api.get('/payments', { params: p }),
  create: d  => api.post('/payments', d),
  delete: id => api.delete(`/payments/${id}`),
}

export const productsAPI = {
  list:   p  => api.get('/products', { params: p }),
  create: d  => api.post('/products', d),
  update: (id, d) => api.put(`/products/${id}`, d),
  delete: id => api.delete(`/products/${id}`),
}

export const expensesAPI = {
  list:   p  => api.get('/expenses', { params: p }),
  create: d  => api.post('/expenses', d),
  update: (id, d) => api.put(`/expenses/${id}`, d),
  delete: id => api.delete(`/expenses/${id}`),
}

export const reportsAPI  = { summary: y => api.get('/reports/summary', { params: { year: y } }) }

export default api
