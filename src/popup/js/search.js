import { computed, ref, reactive, watch } from 'vue'
import { ANONYMOUS_USER_NAME } from '@/common/const'
import { works } from "./works"
import { settingsPU } from './setting'

const partialText = ref('')
const selection = ref(null)
const hoverredItem = reactive({
  viaNav: false, // false: via hover, true: via up/down
  i: -1,
  id: null
})

const resetHoverredItem = () => {
  hoverredItem.viaNav = false
  hoverredItem.i = -1
  hoverredItem.id = null
}

const searchItems = computed(() => {
  const authorRef = {}
  let workArr = Object.keys(works.value)

  if (settingsPU.view === -2) {
    workArr = workArr.filter(workID => (!works.value[workID].v && works.value[workID].v !== 0) || works.value[workID].lv === 'x')
  } else {
    workArr = workArr
      // .filter(workID => works.value[workID].v === settingsPU.view || works.value[workID].lv === settingsPU.view)
      .filter(workID => settingsPU.view === -1 || works.value[workID].v === settingsPU.view || works.value[workID].lv === settingsPU.view)
  }
  
  workArr = workArr.map(workID => {
    if (works.value[workID].a) {
      Object.keys(works.value[workID].a).forEach(aName => {
        if (!authorRef[aName]) authorRef[aName] = works.value[workID].a[aName] // author url
      })
    } else {
      if (!authorRef[ANONYMOUS_USER_NAME]) authorRef[ANONYMOUS_USER_NAME] = null
    }
    return {type: 'work', val: workID, text: works.value[workID].name, a: works.value[workID].a}
  })
  
  
  const authorArr = Object.keys(authorRef).map(aName => {
    return { type: 'author', val: aName, text: aName, href: authorRef[aName] }
  })

   return [...workArr, ...authorArr]
    .sort((a,b) => a.text.toLowerCase().localeCompare(b.text.toLowerCase()))
    .map((item, i) => ({...item, id: i}))
})

const searchResults = computed(() => {
  let results = searchItems.value
  if (partialText.value.length) {
    const lowerPartialInput = partialText.value.toLocaleLowerCase()
    results = results.filter(item => item.text.toLocaleLowerCase().indexOf(lowerPartialInput) !== -1)
  }

  return results.map((item, i) => ({...item, i}))
})

/**
 * selection's id became obsolete when searchItems is updated
 * - make sure selection's id is updated with the one in the latest searchItem
 * - it is used to allow PBSearchResult to hover on the selected item when scroll wrapper is first mounted
 */
watch(() => searchItems.value,
newSearchItems => {
  if (selection.value) {
    newSearchItems.some(item => {
      const match = selection.value.val === item.val
      if (match) selection.value.id = item.id
      return match
    })
  }
  
})

/**
 * selectAuthor
 * - used by PBPopupItem when search author by clicking on author link instead of from PBSearch
 * - function similar to onSelect under PBSearch
 * - make sure partialText and reset hover is done just like onSelect
 */
const selectAuthor = authorName => {
  partialText.value = ''
  resetHoverredItem()
  selection.value = searchItems.value.filter(item => item.type === 'author' && item.val === authorName)[0]
}

const clearSelection = () => {
  selection.value = null
  partialText.value = ''
  resetHoverredItem()
}

export {
  partialText,
  selection,
  hoverredItem, resetHoverredItem,
  searchResults,
  clearSelection,
  selectAuthor
}
