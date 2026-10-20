import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import BaseButton from './components/BaseButton.vue'
import BaseCard from './components/BaseCard.vue'
import { initTasks } from './composables/useTasks.js'
import { initGoals } from './composables/useGoals.js'

initTasks()
initGoals()

const app = createApp(App)

app.component('BaseButton', BaseButton)
app.component('BaseCard', BaseCard)
app.use(router)
app.mount('#app')
