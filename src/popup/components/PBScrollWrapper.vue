<template>
  <div ref="wrapper" class="ao3pb-scroll-wrapper" @scroll="onScroll">
    <!-- <template v-if="animate">
      <TransitionGroup name="fade-in">
        <div class="ao3pb-scroll-wrapper__item" :id="`ao3pbr-${item.id}`" v-for="(item, i) in filteredOptions" :key="item.id">
          <slot name="item" v-bind="{item, index: anchor.min+i+1}"></slot>
        </div>
      </TransitionGroup>
    </template> -->
    <div :id="`ao3pbr-${item.id}`" v-for="(item, i) in filteredOptions" :key="item.id">
    <!-- <div class="ao3pb-scroll-wrapper__item" :id="`ao3pbr-${item.id}`" v-for="(item, i) in filteredOptions" :key="item.id"> -->
      <slot name="item" v-bind="{item, index: anchor.min+i+1}"></slot>
    </div>
    
    <slot></slot>
  </div>
</template>

<script>
import { onMounted, ref, reactive, computed, nextTick, watch } from 'vue'

const REACH_EDGE_THRESHOLD = 5


export default {
  props: {
    options: Array,
    anchorMin: { type: Number, default: 0 },
    maxResultAllowed: { type: Number, default: 11 },
    appendOffset: { type: Number, default: 4 }
  },
  setup (p, {emit}) {
    const initMin = Math.max(0, Math.min(p.options.length - 1 - p.maxResultAllowed, p.anchorMin))
    const initMax = initMin + p.maxResultAllowed
    const anchor = reactive({min: initMin, max: initMax})
    const wrapper = ref(null)

    const filteredOptions = computed(() => {
      return p.options.filter((opt, i) => i >= anchor.min && i <= anchor.max)
    })

    watch(() => p.options,
    newOpt => {
      if (anchor.min > newOpt.length - 1) {
        anchor.min = 0
        anchor.max = p.maxResultAllowed
        wrapper.value.scrollTo(0, 0)
      }
    })

    watch(() => p.anchorMin, 
    newAnchorMin => {
      const initMin = Math.max(0, Math.min(newAnchorMin, p.options.length - 1 - p.maxResultAllowed))
      const initMax = initMin + p.maxResultAllowed
      anchor.min = initMin
      anchor.max = initMax

      /**
       * a reserved value -1 to trigger reset scroll from parent component
       *  - -1 must not be a possible value during correct anchor.min calculation
       *  - parent component's anchorMin must reset back to 0 at nextTick
       *     - to align with final correct anchor.min value and to allow future trigger from 0 -> -1 again
       */
      if (newAnchorMin === -1) wrapper.value.scrollTo(0, 0)
    })

    const onScroll = async e => {
      const scrollContainer = (e && e.target) || wrapper.value
      const {height} = scrollContainer.getBoundingClientRect()
      const {scrollTop, scrollHeight} = scrollContainer
      
      if (scrollTop <= REACH_EDGE_THRESHOLD && anchor.min > 0) { // reach scroll top
        const prevID = `#ao3pbr-${filteredOptions.value[0].id}`
        const newMin = Math.max(0, anchor.min - p.appendOffset)
        
        anchor.min = newMin
        anchor.max = Math.min(anchor.min + p.maxResultAllowed, p.options.length - 1)

        await nextTick()
        
        const prevFirstItem = scrollContainer.querySelector(prevID)
        if (prevFirstItem) {
          const diff = scrollContainer.getBoundingClientRect().top - prevFirstItem.getBoundingClientRect().top
          scrollContainer.scrollTo(0, scrollContainer.scrollTop - diff)
        }
        
        emit('top', anchor.min, anchor.max)
        
      } else if (Math.ceil(scrollTop) + height >= parseInt(scrollHeight) - REACH_EDGE_THRESHOLD && anchor.max < p.options.length - 1) { // reach scroll bottom
        const newMax = Math.min(p.options.length - 1, anchor.max + p.appendOffset)
        
        anchor.max = newMax
        anchor.min = Math.max(0, anchor.max - p.maxResultAllowed)

        emit('bottom', anchor.min, anchor.max)
      }
    }

    onMounted(() => {
      emit('mounted', wrapper.value)
    })

    return {wrapper, filteredOptions, onScroll, anchor}
  }
}
</script>

<style lang="scss">
.ao3pb-scroll-wrapper {
  & > div {
    & > * { width: 100%; }
  }
  // .ao3pb-scroll-wrapper__item {
    
  // }
}
</style>
