<template>
  <div :class="contentClass" v-if="ready">
    <PBSidebar v-if="!bmInProgress" />
    <PBEditor class="ao3pbs-ctr" v-else :chapters="chapters" />
    
    <PBBookmark class="ao3pbs-ctr" v-if="canShowBookmark" :chapters="chapters" />

    <PBNav v-if="settings.progressBar" />
  </div>
</template>

<script>
import '@/common/__base.scss'

import { computed, watch } from 'vue'
import { storeReady } from './js/store'
import {chapters, curCI, pageReady, windowLoaded } from './js/page'
import { mainBM, bmInProgress, jumpToBookmark } from './js/bookmark'
import { isEntireWork, jumpToBMOnLoad } from './js/static'
import { settings } from './js/setting'
import { extValidState } from './js/valid'

import PBBookmark from './components/PBBookmark.vue'
import PBEditor from './components/PBEditor.vue'
import PBNav from './components/PBNav/PBNav.vue'
import PBSidebar from './components/PBSidebar.vue'

export default {
  name: 'App',
  components: { PBNav, PBSidebar, PBEditor, PBBookmark },
  setup () {
    const canShowBookmark = computed(() => {
      if (!mainBM.cI) return false
      if (isEntireWork) return true

      return mainBM.cI == curCI.value
    })

    const ready = computed(() => windowLoaded.value && storeReady.value && pageReady.value)

    watch(() => ready.value,
    () => {
      if (jumpToBMOnLoad) jumpToBookmark(chapters, curCI)
    })

    const contentClass = computed(() => {
      return {
        'ao3pb-left': !settings.alignRight,
        'ao3pb-extraHid': settings.extraSideBtnMode,
        'ao3pb-outdated': !extValidState.value
      }
    })

    return {
      chapters, ready, settings, contentClass,
      bmInProgress, canShowBookmark, extValidState
    }
  }
}
</script>

<style lang="scss">
#workskin {
  &.bmInProgress #chapters > .chapter, //multi-chapter page structure
  &.bmInProgress #chapters:not(:has(.chapter)) // one-shot page structure
  {
    background-color: rgba(#aaa, 0.3);
  }
}

.ao3pb-bm {
  width: 100%;
  max-width: 1160px;
  filter: brightness(1.5);

  .ao3pb-bm-content { // styles shared by both PBBookmark and PBEditor
    position: absolute;
    top: -17px;
    right: 15px;

    .ao3pb-bm__icon {
      position: relative;
      width: 40px;
      height: 40px;
      padding: 5px;
      
      opacity: 0.3;

      .ao3pb-icon {
        position: absolute;
        width: 30px;
        height: 30px;

        path { fill: $ao3_red; }
        
      }
    }

    &:hover {
      .ao3pb-bm__btn { display: flex; }
    }
  } // ao3pb-bm-content

  .ao3pb-bm__btn {
    display: flex;
    z-index: 1;
    right: 5px;
    overflow: hidden;
    white-space: nowrap;
    border-top-right-radius: 30px;
    border-bottom-right-radius: 30px;
    cursor: pointer;
    overflow: visible;

    & > div {
      position: relative;
      display: block;
      width: 28px;
      opacity: 0.75;
      padding: 5px;
      
      
      &:hover { opacity: 1; }
      
      .ao3pb-icon {
        width: 100%;
        height: 100%;
      }
    }
  }

  .ao3pb-bm__info {
    position: absolute;
    font-size: 11px;
    line-height: 12px;
    background-color: #333;
    color: #ddd;
    bottom: 0;
    transform: translateY(calc(100% + 10px));
    right: 0;
    white-space: nowrap;
    padding: 5px 10px;
    

    &.ao3pb-invalid {
      background-color: $invalid_orange;
      filter: brightness(0.69);
      color: #FFF;
      white-space: wrap;
      width: 243px;
      padding: 5px;
      line-height: 13px;
    }
  }
} // ao3pb-bm

.ao3pb-left .ao3pb-bm {
  .ao3pb-bm-content {
    right: auto;
    left: 15px;

    .ao3pb-bm__btn {
      right: auto;
      left: 5px;
      flex-direction: row-reverse;
    }

    .ao3pb-bm__info {
      right: auto;
      left: 0;
    }
  }
}

.ao3-progress-bookmark > .ao3pb-outdated {
  .ao3pb-sidebar:not(.ao3pb-sidebar--extra) .ao3pb-abtn,
  .ao3pb-sidebar:not(.ao3pb-sidebar--extra) .ao3pb-abtn:hover {
    cursor: not-allowed;
    background-color: rgba($invalid_orange, 0.7);

    &:active::before { opacity: 0; }
  }

  .ao3pb-bm-content {
    cursor: not-allowed;

    // overwrite bookmark and editor fill color but NOT bmInProgress' bookmark fill color 
    .ao3pb-icon path { fill: $invalid_orange; }
  }
}

</style>
