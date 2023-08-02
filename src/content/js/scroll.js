import { ref } from "vue"

const scrollY = ref(0)

let scrollEventCount = 0

const onScroll = (e, manualY) => {
  scrollY.value = manualY || window.scrollY
}

const activateScroll = () => {
  if (scrollEventCount === 0) window.addEventListener('scroll', onScroll)
  scrollEventCount++
  onScroll()
}

const deactivateScroll = () => {
  scrollEventCount--

  if (scrollEventCount <= 0) window.removeEventListener('scroll', onScroll)
}

export { scrollY, onScroll, activateScroll, deactivateScroll }
