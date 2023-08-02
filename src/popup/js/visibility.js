import {ref} from 'vue'

const visibility = ref(0)

const getTabIndex = (lvls, extraValidate=true) => {
  return lvls.includes(visibility.value) && extraValidate ? 0 : -1
}

export {visibility, getTabIndex}
