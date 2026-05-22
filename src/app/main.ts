import { createApp } from 'vue'
import App from './App.vue'
import { installProviders } from './providers'
import '@/shared/styles/main.scss'

const app = createApp(App)

installProviders(app)

app.mount('#app')
