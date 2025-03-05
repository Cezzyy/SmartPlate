import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import './assets/main.css'

// Font Awesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { 
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faUser,
  faCircleExclamation,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons'
import { faGoogle } from '@fortawesome/free-brands-svg-icons'

// Add icons to the library
library.add(
  faEnvelope, 
  faLock, 
  faEye, 
  faEyeSlash, 
  faUser,
  faGoogle,
  faCircleExclamation,
  faTriangleExclamation
)

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.component('font-awesome-icon', FontAwesomeIcon)

app.mount('#app')
