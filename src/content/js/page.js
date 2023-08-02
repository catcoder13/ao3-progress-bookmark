import { reactive, computed, ref, watch } from 'vue'
import { mainContent, chapterDoms, isEntireWork, oneShot } from './static'
import { scrollY, onScroll, activateScroll } from './scroll'

const pageReady = ref(false)
const windowLoaded = ref(false)

let chapters = {}

const view = reactive({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight})

const curCICom = computed(() => {
  if (oneShot || chapterDoms.length === 1) return 0

  const scrollBottom = scrollY.value + view.height
  const result = Object.keys(chapters).filter(cI => chapters[cI].top < scrollBottom).length

  return result < 2 ? 0 : result - 1
})

/**
 * update curCI by watching curCICom value change prevents curCI dependent dom rerender during every scroll
 * curCICom is updated during every scrollY update (despite final calculation may reach a same value as old curCICom)
 * curCI only updated when curCICom value differ from its old value
 */
const curCI = ref(0)

watch(() => curCICom.value, newCIComVal => curCI.value = newCIComVal)


/**
 * only register resize/scroll event for valid work page (determined by mainContent)
 */
if (mainContent) {
  const onResize = () => {
    view.width = document.documentElement.clientWidth
    view.height = document.documentElement.clientHeight
    onScroll()
  }
  
  const updateChapterDomSize = () => {
    view.width = document.documentElement.clientWidth
    view.height = document.documentElement.clientHeight
  
    const cIs = Object.keys(chapters)
    cIs.forEach(cI => {
      const {top, height} = (chapters[cI].dom && chapters[cI].dom.getBoundingClientRect()) || {top: 0, height: 0}
      chapters[cI].top = window.scrollY + top
      chapters[cI].height = height
    })
    onScroll()
  }
  

  /**
   * initialise position/height reference multi chapter/one-shot content 
   */
  if (chapterDoms.length) { // multi chapter or one shot with chapter wrapper
    curCI.value = parseInt(chapterDoms[0].getAttribute('id').split('chapter-')[1]) - 1

    chapterDoms.forEach(ch => {
      const cIndex = parseInt(ch.getAttribute('id').split('chapter-')[1]) - 1
      chapters[cIndex] = reactive({ top: -1, height: 0, dom: ch })
    })
  } else { // one shot without chapter wrapper
    chapters[0] = reactive({ top: -1, height: 0, dom: mainContent && mainContent.querySelector('#chapters') })
  }
  

  /**
   * scroll event
   * initialise scroll event ON LOAD is only needed if the page is
   *  - is an Entire Work page(which chapterDoms.length must be > 1)
   *    in which curCI must stayed updated with scroll event that updates scrollY
   */
  if (isEntireWork) activateScroll()

  
  /**
   * update content's position/height reference when outer is resized
   * this is used instead of window.resize due to
   *  - window.resize is not triggered by page content growth/shrink
   *  - page content resize occurs when eg. expand comment section
   */
  const resizeObserver = new ResizeObserver(updateChapterDomSize)
  const outer = document.getElementById('outer')
  resizeObserver.observe(outer)
  updateChapterDomSize()

  
  /**
   * update viewport size reference when the browser is resized
   * this is needed on top of outer's resizeObserver due to
   *  - viewport change due to window resize vertically does not trigger outer's resize.
   */
  window.addEventListener('resize', onResize)
  onResize()


  window.addEventListener('load', () => windowLoaded.value = true)
  pageReady.value = true
}


export { chapters, curCI, view, pageReady, windowLoaded }
