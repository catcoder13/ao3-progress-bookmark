import { createApp } from 'vue'
import Content from './Content.vue'

if (document.getElementById('workskin')) {
  const ao3AssistDom = document.createElement('div')
  ao3AssistDom.setAttribute('id', 'ao3-progress-bookmark')
  ao3AssistDom.classList.add('ao3-progress-bookmark')

  document.querySelector('body').appendChild(ao3AssistDom)

  createApp(Content).mount('#ao3-progress-bookmark')
}
