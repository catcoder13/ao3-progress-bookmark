<template>
<div class="ao3pb-bm ao3pb-bm--static" :class="PBBookmarkClass()" :style="{top: `${pos}px`}">
  <div class="ao3pb-bm-content">
    <div v-if="extValidState" class="ao3pb-bm__btn ao3pbs-ctr-v">
      <div @click="removeBookmark" title="Remove this bookmark">
        <PBIcon fill="red" type="trash" />
      </div>
      <div @click="startBookmarkEdit" title="Change bookmark location">
        <PBIcon fill="#333" type="edit" />
      </div>
    </div>

    <div class="ao3pb-bm__icon">
      <PBIcon type="location" fill=""></PBIcon>
    </div>

    <span v-if="extValidState" class="ao3pb-bm__info">Chapter {{parseInt(mainBM.cI) + 1}} | {{ (mainBM.pct * 100).toFixed(2) }}%</span>  
    <span v-else class="ao3pb-bm__info ao3pb-invalid" v-html="EXT_INVALID_MSG"></span>
  </div>
</div>
</template>

<script>
import { computed } from 'vue'
import {mainBM, bmFocusCountDown, bmInProgress, removeBookmark, startBookmarkEdit} from '../js/bookmark'
import { extValidState, EXT_INVALID_MSG } from '../js/valid'

import PBIcon from '@/common/PBIcon.vue'

export default {
  props: ['chapters'],
  components: { PBIcon },
  setup (p) {
    const pos = computed(() => p.chapters[mainBM.cI] && (p.chapters[mainBM.cI].top + p.chapters[mainBM.cI].height * mainBM.pct))

    const PBBookmarkClass = () => {
      return {
        highlight: bmFocusCountDown.value,
        bmInProgress: bmInProgress.value
      }
    }

    return {EXT_INVALID_MSG, mainBM, pos, startBookmarkEdit, removeBookmark, PBBookmarkClass, extValidState }
  }
}
</script>

<style lang="scss">
.ao3pb-bm.ao3pb-bm--static {
  position: absolute;
  pointer-events: none;

  & > * { pointer-events: all; }

  &.bmInProgress .ao3pb-bm-content {
    pointer-events: none;

    .ao3pb-icon path { fill: #333; }
  }

  &.highlight .ao3pb-bm-content {
    pointer-events: none;

    .ao3pb-bm__icon {
      animation: bookmarkScale 0.3s 4 alternate;

      .ao3pb-icon { opacity: 1; }
    }
  }  

  .ao3pb-bm-content {
    .ao3pb-bm__btn { display: none; }

    &:hover {
      .ao3pb-bm__btn > div:hover {
        transition: transform 0.2s;
        transform: scale(1.1);
      }

      .ao3pb-bm__info { display: block; }
    }
  }

  .ao3pb-bm__info { display: none; }
  
} // ao3pb-bm


</style>