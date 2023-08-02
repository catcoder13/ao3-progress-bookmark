<template>
  <div class="ao3pb-bm ao3pb-bm--editor" :style="{top: `${editBM.y}px`}">
    <span class="ao3pb-bm__remark" v-if="editBM.invalid && extValidState">Out of bookmark region</span>
    <div class="ao3pb-bm-content">
      <div class="ao3pb-bm__btn ao3pbs-ctr-v">
        <div class="ao3pb-cancel" title="Cancel" @click="stopBookmarkEdit">&#10006;</div>
        <div v-if="!editBM.invalid && extValidState" class="ao3pb-confirm" title="Confirm" @click="onUpdateBookmark">&#10003;</div>
      </div>

      <div class="ao3pb-bm__icon">
        <PBIcon type="location" fill=""></PBIcon>
      </div>

      <div class="ao3pb-bm__info" v-if="!editBM.invalid && extValidState">
        <template v-if="mainBM.cI != null">
          <span :style="{opacity: 0.6}">Old bookmark: Chapter {{parseInt(mainBM.cI) + 1}} | {{ (mainBM.pct * 100).toFixed(2) }}%</span>
          <span>New bookmark: Chapter {{parseInt(editBM.cI) + 1}} | {{ (editBM.pct * 100).toFixed(2) }}%</span>
        </template>
        <span v-else>Chapter {{parseInt(editBM.cI) + 1}} | {{ (editBM.pct * 100).toFixed(2) }}%</span>
      </div>
      <div class="ao3pb-bm__info ao3pb-invalid" v-if="!extValidState" v-html="EXT_INVALID_MSG"></div>
    </div>
  </div>
</template>

<script>
import { onMounted, onUnmounted, watch, reactive } from 'vue'
import { updateBookmark, stopBookmarkEdit, mainBM } from '../js/bookmark'
import { mousePos } from '../js/mousePos'
import { extValidState, EXT_INVALID_MSG } from '../js/valid'

import PBIcon from '@/common/PBIcon.vue'

export default {
  props: ['chapters'],
  components: { PBIcon },
  setup (p) {
    const editBM = reactive({ y: mousePos.y, pct: 0, invalid: 0 })

    const onMouseMove = (e, posY = editBM.y) => {
      const clickedY = window.scrollY + posY

      let newPerc = 0
      let hoverCH = Object.keys(p.chapters)[0]
      let lastTop = p.chapters[hoverCH].top

      Object.keys(p.chapters).some(cI => {
        if (p.chapters[cI].top < clickedY) {
          lastTop = p.chapters[cI].top
          hoverCH = cI
          return false
        }
        return true
      })

      newPerc = (clickedY - lastTop) / p.chapters[hoverCH].height
      editBM.y = posY
      

      if (newPerc > 0 && newPerc < 1) {
        editBM.invalid = 0
        // check if cursor is too close to one of the existing pct bm
        // mainBM.tooClose = mainBM.cI && mainBM.cI == hoverCH && Math.abs(mainBM.pct - newPerc) < 0.003
        editBM.cI = hoverCH
        editBM.pct = newPerc
      } else { // exceed bookmark area
        editBM.invalid = 1
      }
    } // onMouseMove
    
    watch(() => mousePos.y, newPosY => onMouseMove(null, newPosY))

    onMounted(() => {
      document.addEventListener('scroll', onMouseMove)
      onMouseMove()
    }) // on mounted
    
    onUnmounted(() => {
      document.removeEventListener('scroll', onMouseMove)
    })

    const onUpdateBookmark = () => {
      if (editBM.invalid) return

      updateBookmark(editBM.cI, editBM.pct.toFixed(5))
      
      stopBookmarkEdit()
    }

    return { 
      editBM, mainBM,
      onUpdateBookmark, stopBookmarkEdit, extValidState, EXT_INVALID_MSG
    }
  }
}
</script>

<style lang="scss">
.ao3pb-bm.ao3pb-bm--editor {
  position: fixed;
  z-index: 100;
  pointer-events: none;

  .ao3pb-bm__remark {
    position: absolute;
    top: -15px;
    z-index: -1;
    display: block;
    width: 100%;
    padding: 10px;
    
    background-color: rgba(red, 0.3);
    text-align: center;
    pointer-events: none;
  }

  .ao3pb-bm-content {
    pointer-events: all;

    .ao3pb-bm__btn {
      & > div {
        line-height: 25px;
        font-size: 22px;
        font-weight: bold;
        color: grey;

        &:hover {
          transition: font-size 0.2s;
          font-size: 26px; 
          color: #333;
        }
      }
      
    }

    .ao3pb-bm__icon { opacity: 0.5; }

    .ao3pb-bm__info {
      &:not(.ao3pb-invalid) { text-align: right; }
      
      span {
        display: block;
        white-space: nowrap;

        &:first-child:not(:only-child) { padding-bottom: 2px; }
      }
    }
  } // ao3pb-bm-content

  
} // ao3pb-bm
</style>