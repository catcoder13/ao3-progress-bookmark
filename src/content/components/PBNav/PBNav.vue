<template>
  <div class="ao3pb-nav"
    :class="{stucked, hovered: hoveredChI != null, approx: approxChI != null}"
    :style="navStyle">
  <div class="ao3pb-bg" :style="navBgStyle"></div>
    <PBNavBar v-if="chapterInfos.length === 1" :href="navbarHref" class="ao3pb-abtn ao3pb-oneshot"
      @enter="hoveredChI = curCI" @leave="hoveredChI = null" :cI="curCI" width="100%" />

    <template v-else-if="approxChI == null">
      <PBNavBar :href="navbarHref" class="ao3pb-cur"
        @enter="hoveredChI = curCI" @leave="hoveredChI = null" :cI="curCI"
        :width="`calc(${100 / (chapterInfos.length)}%)`" :left="`calc(${curCI / chapterInfos.length * 100}%)`" />

      <PBNavBar v-if="mainBM.cI != null && mainBM.cI != curCI" :href="navbarHref"
        @enter="hoveredChI = mainBM.cI" @leave="hoveredChI = null" :cI="mainBM.cI"
        :width="`calc(${100 / (chapterInfos.length)}%)`" :left="`calc(${mainBM.cI / chapterInfos.length * 100}%)`" />
        
    </template>

    <template v-else>
      <div v-if="approxChI > 0" :style="leftNavStyle">
        <PBNavBar v-if="mainBM.cI != null && mainBM.cI != curCI && mainBM.cI < approxChI" :href="navbarHref"
          @enter="hoveredChI = mainBM.cI" @leave="hoveredChI = null" :cI="mainBM.cI"
          :width="`calc(${100 / (approxChI)}%)`" :left="`calc(${mainBM.cI / approxChI * 100}%)`" />

        <PBNavBar v-if="curCI < approxChI" class="ao3pb-cur" :href="navbarHref"
          @enter="hoveredChI = curCI" @leave="hoveredChI = null" :cI="curCI"
          :width="`calc(${100 / (approxChI)}%)`" :left="`calc(${curCI / approxChI * 100}%)`" />
      </div>
      
      <PBNavBar :href="navbarHref" class="ao3pb-abtn"
        @enter="hoveredChI = approxChI" @leave="hoveredChI = null" :cI="approxChI" :width="`${approxBarWidth}px`"/>

      <div v-if="approxChI < chapterInfos.length - 1" :style="rightNavStyle">
        <PBNavBar v-if="mainBM.cI != null && mainBM.cI != curCI && mainBM.cI > approxChI" :href="navbarHref"
        @enter="hoveredChI = mainBM.cI" @leave="hoveredChI = null" :cI="mainBM.cI"
        :width="`calc(${100 / (chapterInfos.length - 1 - approxChI)}%)`"
        :left="`calc(${(mainBM.cI - approxChI - 1) / (chapterInfos.length - 1 - approxChI) * 100}%)`" />

        <PBNavBar v-if="curCI > approxChI" class="ao3pb-cur" :href="navbarHref"
          @enter="hoveredChI = curCI" @leave="hoveredChI = null" :cI="curCI"
          :width="`calc(${100 / (chapterInfos.length - 1 - approxChI)}%)`"
          :left="`calc(${(curCI - approxChI - 1) / (chapterInfos.length - 1 - approxChI) * 100}%)`" />
      </div>
    </template>
  </div>
      
  <div v-if="hoveredChI != null" class="ao3pb-nav-info" :style="infoPos">
    <span class="ao3pb-note" v-if="chapterInfos.length > 1">{{ (isEntireWork) ? 'Entire work' : 'Chapter by chapter' }}</span>
    <div class="ao3pb-heading">
      <PBIcon v-if="mainBM.cI != null && mainBM.cI == approxChI" />
      <b v-if="oneShot">{{name}}</b>
      <b v-else>Chapter {{ parseInt(approxChI) + 1 }}</b>
    </div>
    
    <span v-if="approxChI != null && chapterInfos[approxChI].title" class="ao3pb-title">{{ chapterInfos[approxChI].title }}</span>

    <template v-if="hoveredChI != null && !bmInProgress">
      <span class="ao3pb-desc" v-if="isEntireWork">
        <PBIcon type="mouse" fill="#999"/>
        Jump to <b>Chapter {{ parseInt(hoveredChI) + 1 }}</b>
      </span>
      <span class="ao3pb-desc" v-else-if="hoveredChI != curCI">
        <PBIcon type="visit" fill="#999"/>
        Visit <b>Chapter {{ parseInt(hoveredChI) + 1 }}</b>
      </span>
      <span class="ao3pb-desc" v-else>
        <PBIcon type="mouse" fill="#999"/>
        Back to the beginning of this {{oneShot ? 'one-shot' : 'chapter'}}
      </span>
    </template>
  </div>

  <div v-else-if="approxChI != null" class="ao3pb-nav-info--short" :style="infoPos">
    <b class="ao3pb-heading">{{ oneShot ? 'One-shot' : `Chapter ${parseInt(approxChI) + 1}`}}</b>
  </div>

  
</template>

<script>
import { computed, onMounted, ref, reactive, onUnmounted } from 'vue'
import { mainBM, bmInProgress } from '@/content/js/bookmark'
import { chapters, curCI, view } from '@/content/js/page'
import { chapterInfos, isEntireWork, workID, oneShot, name} from '@/content/js/static'
import {mousePos, activateMouseMove, deactivateMouseMove} from '@/content/js/mousePos'
import { scrollY, activateScroll, deactivateScroll } from '@/content/js/scroll'

import PBIcon from '@/common/PBIcon.vue'
import PBNavBar from './PBNavBar.vue'

const TOOLTIP_RANGE_Y = 40
export default {
  name: 'PBNavbar',
  components: { PBIcon, PBNavBar },
  setup() {
    const innerDivWorkWrapper = document.querySelector('#inner #main .wrapper')

    if (!innerDivWorkWrapper) {
      console.warn('[AO3 PB] Navbar failed to initialised due to (#inner #main .wrapper) not exists.')
      return
    }

    activateMouseMove()
    activateScroll()

    const navbarElem = reactive({width: 0, x: 0, barWidth: 0})

    const approxBarWidth = computed(() => {
      if (hoveredChI.value != null) return (navbarElem.barWidth > 200 ? navbarElem.barWidth : 200)
      
      return navbarElem.barWidth < 8 ? 8 : navbarElem.barWidth
    })

    const stucked = ref(false)
    let mainContentTop = 0
    let wrapperWidth = 0
    let wrapperLeft = 0

    const onLocalScroll = () => {
      stucked.value = window.scrollY > mainContentTop

      navbarElem.left = stucked.value ? 0 : wrapperLeft
      navbarElem.top = stucked.value ? 0 : mainContentTop
      navbarElem.width = stucked.value ? view.width : wrapperWidth
      navbarElem.barWidth = navbarElem.width / chapterInfos.length
    }

    const onLocalResize = () => {
      const {x, y, width, height} = innerDivWorkWrapper.getBoundingClientRect()
      mainContentTop = window.scrollY + y + height
      wrapperWidth = width
      wrapperLeft = x

      onLocalScroll()
    }

    const resizeObserver = new ResizeObserver(onLocalResize)
    const outer = document.getElementById('outer')
    resizeObserver.observe(outer)

    const inView = ref(true)

    const onMouseEnterDoc = () => inView.value = true
    const onMouseLeaveDoc = () => inView.value = false


    const hoveredChI = ref(null)

    const approxChI = computed(() => {
      if (bmInProgress.value || !inView.value) return null
      
      if (hoveredChI.value != null) return hoveredChI.value
      
      
      if (stucked.value) {
        if (mousePos.y > TOOLTIP_RANGE_Y || mousePos.y < 0) return null
      } else {
        if (mousePos.x < navbarElem.left || mousePos.x > navbarElem.left + navbarElem.width) return null
        
        const mousePosY = scrollY.value + mousePos.y
        if (mousePosY > navbarElem.top + TOOLTIP_RANGE_Y || mousePosY < navbarElem.top) return null
      }

      const mousePosX = Math.max(0, mousePos.x - navbarElem.left)
      return Math.min(chapterInfos.length - 1, Math.floor(mousePosX / navbarElem.barWidth))
    })

    const bar_color = '#999'
    const bar_color_light = '#bbb'

    const navStyle = computed(() => {
      const width = stucked.value ? '100%' : `${navbarElem.width}px`
      return { top: `${navbarElem.top}px`, width, maxWidth: width }
    })

    const navBgStyle = computed(() => {
      const perc = 1 / chapterInfos.length * 100

      return {
        background: `repeating-linear-gradient(90deg, ${bar_color_light}, ${bar_color_light} ${perc}%, ${bar_color} ${perc}%, ${bar_color} ${perc * 2}%)`
      }
    })

    const leftNavStyle = computed(() => {
      const perc = 1 / approxChI.value * 100

      return {
        width: `calc(${ approxChI.value / (chapterInfos.length - 1) * (navbarElem.width - approxBarWidth.value)}px)`,
        background: `repeating-linear-gradient(90deg, ${bar_color_light}, ${bar_color_light} ${perc}%, ${bar_color} ${perc}%, ${bar_color} ${perc * 2}%)`
      }
    })

    const rightNavStyle = computed(() => {
      const perc = 1 / (chapterInfos.length - 1 - approxChI.value) * 100
      let color1 = approxChI.value % 2 ? bar_color_light : bar_color
      let color2 = approxChI.value % 2 ? bar_color : bar_color_light

      return {
        width: `calc(${ (chapterInfos.length - 1 - approxChI.value) / (chapterInfos.length - 1) * (navbarElem.width - approxBarWidth.value) }px)`,
        background: `repeating-linear-gradient(90deg, ${color1}, ${color1} ${perc}%, ${color2} ${perc}%, ${color2} ${perc * 2}%)`
      }
    })

    const infoPos = computed(() => {
      if (bmInProgress.value || approxChI.value == null) return null
      
      const infoWidthOffset = hoveredChI.value == null ? 60 : 200
      const xPosCorrect = mousePos.x + infoWidthOffset > navbarElem.width ? navbarElem.width - infoWidthOffset : mousePos.x
      return {top: `${mousePos.y + 22}px`, left: `${xPosCorrect}px`}
    })

    const navbarHref = computed(() => {
      if (oneShot) return '#workskin'
      if (hoveredChI.value == null) return null

      const cI = hoveredChI.value
      if (isEntireWork || curCI.value == cI) return `#chapter-${parseInt(cI) + 1}`
      
      return `/works/${workID}/chapters/${chapterInfos[cI].cID}#chapter-${parseInt(cI) + 1}`
    })

    onMounted(() => {
      document.addEventListener('scroll', onLocalScroll)
      window.addEventListener('resize', onLocalResize)
      onLocalResize()

      document.addEventListener('mouseenter', onMouseEnterDoc)
      document.addEventListener('mouseleave', onMouseLeaveDoc)
    })

    onUnmounted(() => {
      document.removeEventListener('scroll', onLocalScroll)
      window.removeEventListener('resize', onLocalResize)
      document.removeEventListener('mouseenter', onMouseEnterDoc)
      document.removeEventListener('mouseleave', onMouseLeaveDoc)
      resizeObserver.unobserve(outer)
      deactivateMouseMove()
      deactivateScroll()
    })

    return {
      chapters, chapterInfos, curCI, approxChI, hoveredChI, name, bmInProgress, approxBarWidth,
      infoPos, mainBM, isEntireWork, navbarElem, stucked, oneShot, navbarHref, navStyle, leftNavStyle, rightNavStyle, navBgStyle
    }
  }
}
</script>

<style lang="scss">
.ao3pb-nav {
  position: absolute;
  width: 100%;
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  transition: width 0.2s, max-width 0.2s;
  text-align: center;
  height: 21px;
  overflow: hidden;
  pointer-events: none;

  &.stucked {
    position: fixed;

    a.ao3pb-cur { height: 8px; }
  }

  &.hovered > div { transition: width 0.1s; }

  & > div {
    position: relative;
    z-index: 0;
    height: 5px;

    &.ao3pb-bg {
      position: absolute;
      width: 100%;
      left: 0;
    }
  }

  div.ao3pb-bg,
  a.ao3pb-abtn,
  a.ao3pb-cur {
    box-shadow: 0 1px 2px #888;
  }

  &.approx a.ao3pb-abtn { height: 17px; }

  & > * {
    display: inline-block;
    vertical-align: top;
  }

  a:not(.ao3pb-abtn) { position: absolute; }

  a.ao3pb-abtn { // only this bar require transition
    pointer-events: all;
    transition: height 0.2s, width 0.1s;
    z-index: 1;
  }
} // navbar

[class*=ao3pb-nav-info] {
  position: fixed;
  z-index: 100;
  background-color: #eee;
  padding: 10px;
  font-size: 14px;
  max-width: 200px;
  pointer-events: none;
  box-shadow: 1px 1px 3px #888;

  &.ao3pb-nav-info--short {
    padding: 5px;

    .ao3pb-heading {
      padding: 0;
      font-size: 10px;
      min-width: 0;
    }
  }
  
  & > * { 
    display: block; 
    
    &:not(:last-child) { padding-bottom: 7px; }
  }

  .ao3pb-heading {
    font-size: 12px;
    min-width: 100px;
    padding: 5px 0;
    color: #333;
    

    b { display: inline; }

    & > * { vertical-align: middle;}

    .ao3pb-icon { display: inline-block; width: 20px; height: 20px; }
  }

  .ao3pb-note {
    position: absolute;
    font-size: 10px;
    top: 0;
    right: 0;
    padding: 2px 5px;
    background-color: #666;
    color: #FFF;
  }

  .ao3pb-title {
    font-size: 13px;
    color: #444;
    padding-bottom: 5px;
  }

  .ao3pb-desc {
    font-size: 11px;
    font-style: italic;
    color: #85aec2;
  }
} // ao3pb-nav-info

</style>
