<template>
  <a class="ao3pb-navbar" :class="{'ao3pb-hasbm': mainBM.cI == cI, 'ao3pb-odd': cI % 2}" :style="{width: width, left: left}" :href="navbarHref"
    @mouseenter="$emit('enter')" @mouseleave="$emit('leave')">
    <span v-if="curCI == cI" :style="{width: `${curChProgress}%`}"></span>
    <PBIcon v-if="mainBM.cI != null && mainBM.cI == cI"
      type="location" fill="#000" :style="{left: `${mainBM.pct * 100}%`}" />
  </a>
</template>

<script>
import { computed } from 'vue'
import { curCI, view, chapters } from '@/content/js/page'
import { mainBM } from '@/content/js/bookmark'
import { scrollY } from '@/content/js/scroll'

import PBIcon from '@/common/PBIcon.vue'

export default {
  props: ['cI', 'width', 'left'],
  components: {PBIcon},
  setup() {
    const curChProgress = computed(() => {
      const scrollBottom = scrollY.value + view.height
      return (Math.min(1, Math.max(0, (scrollBottom - chapters[curCI.value].top) / chapters[curCI.value].height)) * 100).toFixed(0)
    })

    return { curCI, mainBM, curChProgress }
  }
}
</script>

<style lang="scss">
a.ao3pb-navbar {
  position: relative;
  height: 5px;
  border-bottom: 0;
  cursor: pointer;
  background-color: $bar_color_light;
  border-left: 1px solid #FFF;
  border-right: 1px solid #FFF;

  &:visited,
  &:link { border-bottom: 0; }

  &.ao3pb-odd { background-color: $bar_color; }

  &.ao3pb-hasbm {
    background-color: #e84f4f;

    & > span { background-color: $ao3_red; }
  }

  & > span { // progress bar
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: $bar_darken_color;
  }

  & > .ao3pb-icon {
    position: absolute;
    transform: translateX(-50%);
    height: 100%;
  }
}
</style>