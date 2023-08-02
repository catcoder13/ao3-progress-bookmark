import {ref, reactive, computed, watch } from 'vue'
import { workIDs, updateBookmarkStore, removeBookmarkStore, work } from './store'
import { workID, chapterInfos, mainContent, isEntireWork } from './static'
import { activateMouseMove, deactivateMouseMove } from './mousePos'
import { BOOKMARK_LIMIT } from '@/common/const'
import {onScroll} from './scroll'
import { extValidState } from './valid'

const mainBM = reactive({cI: null, pct: null, cID: null, link: null, fwLink: null})

const bmInProgress = ref(false)
const bmFocusCountDown = ref(0)

const withinBookmarkLimit = computed(() => workIDs.value.length < BOOKMARK_LIMIT)

watch(() => work.value,
newWork => {
  if (newWork) {
    const {cI, pct, cID} = newWork
    mainBM.cI = cI
    mainBM.pct = pct
    mainBM.cID = cID
    mainBM.link = `/works/${workID}/chapters/${cID}#chapter-${parseInt(cI) + 1}`
    mainBM.fwLink = `/works/${workID}?view_full_work=true#chapter-${parseInt(cI) + 1}`
  } else {
    mainBM.cI = null
  }
  
})

const updateBookmark = (cI, pct) => {
  if (!extValidState.value) {
    console.warn('[AO3 PB] content script outdated. Kindly refresh the page to stay updated.')
    return
  }

  if (mainBM.cI != null || withinBookmarkLimit.value) {
    updateBookmarkStore(cI, pct, chapterInfos[cI].cID, chapterInfos[cI].title)
    mainBM.cI = cI
    mainBM.pct = pct
    mainBM.cID = chapterInfos[cI].cID
    mainBM.link = `/works/${workID}/chapters/${chapterInfos[cI].cID}#chapter-${parseInt(cI) + 1}`
    mainBM.fwLink = `/works/${workID}?view_full_work=true#chapter-${parseInt(cI) + 1}`
  }
}

const removeBookmark = e => {
  if (!extValidState.value) {
    console.warn('[AO3 PB] content script outdated. Kindly refresh the page to stay updated.')
    return
  }
  
  e.stopPropagation()
  removeBookmarkStore(() => {
    mainBM.cI = null
  }) // delete store record
}

const stopBookmarkEdit = () => {
  mainContent.classList.toggle('bmInProgress', false)
  bmInProgress.value = false
  deactivateMouseMove()
}

const startBookmarkEdit = (e, chapters) => {
  if (!extValidState.value) {
    console.warn('[AO3 PB] content script outdated. Kindly refresh the page to stay updated.')
    return
  }

  if (mainBM.cI == null && !withinBookmarkLimit.value) return

  mainContent.classList.toggle('bmInProgress', true)
  bmInProgress.value = true
  activateMouseMove(null, e.clientY)

  if (!chapters) return

  const cIs = Object.keys(chapters)
  const firstChI = cIs[0]
  const lastChI = cIs[cIs.length - 1]
  const {y: bmAreaFirstTop} = chapters[firstChI].dom.getBoundingClientRect()
  const {y: bmAreaLastTop, height: lastHeight} = chapters[lastChI].dom.getBoundingClientRect()

  if (bmAreaFirstTop > e.clientY) {
    window.scrollTo({
      top: window.scrollY + bmAreaFirstTop - e.clientY + 30,
      behavior: 'smooth'
    })
  } else if (e.clientY > bmAreaLastTop + lastHeight) {
    window.scrollTo({
      top: window.scrollY + bmAreaLastTop + lastHeight - e.clientY - 30,
      behavior: 'smooth'
    })
  }
}

let countDownInt = null
const jumpToBookmark = (chapters, curCI) => {
  if (!isEntireWork && mainBM.cI != curCI.value) return
      
  const {top, height} = chapters[mainBM.cI]
  const bmPos = top + height * mainBM.pct
  const targetScroll = bmPos - window.innerHeight / 2
  window.scrollTo({top: targetScroll })
  onScroll(null, targetScroll)

  bmFocusCountDown.value = true
  if (!countDownInt) clearTimeout(countDownInt)
  countDownInt = setTimeout(() => {
    bmFocusCountDown.value = false
  }, 1200)
}

export {
  mainBM, bmInProgress, bmFocusCountDown, withinBookmarkLimit,
  startBookmarkEdit, updateBookmark, removeBookmark, stopBookmarkEdit, jumpToBookmark
}
