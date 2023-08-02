import { ref } from 'vue'

const EXT_INVALID_MSG = 'If you see this message, it means the extension completed an software update after this page is loaded.<br><br>Kindly reload this page to resume to its normal functionalities.'

const extValidState = ref(true)

document.addEventListener('mousemove', () => {
  extValidState.value = !!chrome.runtime?.id
})

export { extValidState, EXT_INVALID_MSG }
