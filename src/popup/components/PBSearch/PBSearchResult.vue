<template>
  <PBScrollWrapper class="ao3pb-search-result" :options="options" :anchorMin="anchorMin"
    @mounted="onWrapperMounted" @top="onReachEdge" @bottom="onReachEdge">
    <template v-slot:item="{item}">
      <button
          @mousemove="() => onNewItemHover(item)"
          @click="$emit('select', $event, item)"
          tabindex="-1"
          class="ao3pbr-blur" :class="{'ao3pb-cur': hoverredItem.i === item.i, [item.type]: true}" >
          <PBIcon v-if="item.type === 'author'" type="author" fill="#84b4e7" />
          <span>
            {{ item.text }}
          </span>
          <span class="ao3pb-author" v-if="item.type === 'work'">by <span v-for="(aName, j) in getAuthorNames(item.a)" :key="j">{{ aName }}</span></span>
        </button>
    </template>
    <p v-if="!options.length">
      No matched result<template v-if="settingsPU.view !== -1"> under <span :class="{[`ao3pb-v${settingsPU.view}`]: true}">{{ CUSTOM_VIEW_STR[settingsPU.view] || '+ status' }}</span></template>.
    </p>
  </PBScrollWrapper>
</template>

<script>
import { ref, watch, reactive } from 'vue'
import { selection, hoverredItem } from '@/popup/js/search'

import PBScrollWrapper from '@/popup/components/PBScrollWrapper.vue'

import { ANONYMOUS_USER_NAME, CUSTOM_VIEW_STR } from '@/common/const'
import PBIcon from '@/common/PBIcon.vue'
import { settingsPU } from '@/popup/js/setting'


export default {
  props: ['options'],
  components: { PBIcon, PBScrollWrapper },
  setup (p) {
    const scrollWrapper = ref(null)
    const anchorMin = ref(Math.max(0, (selection.value && selection.value.id - 4) || 0))
    const anchorRef = reactive({min: anchorMin.value, max: Math.min(p.options.length - 1, anchorMin.value + 10)})

    const correctScrollPos = targetElem => {
      if (!targetElem || !scrollWrapper.value) return
      const {top, bottom} = targetElem.getBoundingClientRect()
      const {top: pTop, height: pHeight} = scrollWrapper.value.getBoundingClientRect()

      const btnTop = scrollWrapper.value.scrollTop + top
      const btnBottom = scrollWrapper.value.scrollTop + bottom
      const containerTop = scrollWrapper.value.scrollTop + pTop
      const containerBottom = containerTop + pHeight

      if (btnBottom + 2 >=containerBottom) {
        const diff = btnBottom - containerBottom
        scrollWrapper.value.scrollTo(0, scrollWrapper.value.scrollTop + diff) // trigger scroll wrapper scroll event
        // console.log('exceed bottom', diff)
      } else if (btnTop < containerTop) {
        const diff = containerTop - btnTop
        scrollWrapper.value.scrollTo(0, scrollWrapper.value.scrollTop - diff) // trigger scroll wrapper scroll event
        // console.log('exceed top', diff)
      }
    }

    watch(() => hoverredItem.i,
    async newI => {
      if (newI >= 0) {
        if (hoverredItem.viaNav) {
          const targetElem = scrollWrapper.value.querySelector(`#ao3pbr-${p.options[newI].id}`)
          correctScrollPos(targetElem)

          if (newI === anchorRef.min) {
            scrollWrapper.value.scrollTo(0,0) // trigger scroll wrapper scroll event
            // console.log('nav reach top item')
          } else if (newI === anchorRef.max) {
            scrollWrapper.value.scrollTo(0, scrollWrapper.value.scrollHeight) // trigger scroll wrapper scroll event
            // console.log('nav reach last item')
          }
        }
      } else {
        scrollWrapper.value.scrollTo(0, 0)
        anchorMin.value = 0
      }
    })

    const onWrapperMounted = el => {
      scrollWrapper.value = el
      if (selection.value) {
        for (var i = anchorRef.min; i <= anchorRef.max; i++) {
          if (p.options[i].id === selection.value.id) {
            onNewItemHover(p.options[i])
            scrollWrapper.value.querySelector(`#ao3pbr-${selection.value.id}`).scrollIntoView()
            break
          }
        }
      }
    }

    const onReachEdge = (min, max) => {
      anchorRef.min = min
      anchorRef.max = max
    }

    const onNewItemHover = item => {
      // using mousemove instead of mouseenter to prevent phantom cursor get wrongly recognize as mouseenter event
      if (hoverredItem.id === item.id) return

      hoverredItem.viaNav = false
      hoverredItem.id = item.id
      hoverredItem.i = item.i
    }

    const getAuthorNames = authorObj => {
      if (!authorObj) return [ANONYMOUS_USER_NAME]
      return Object.keys(authorObj)
    }
 
    return {
      anchorMin, onReachEdge, getAuthorNames,
      onWrapperMounted, onNewItemHover, hoverredItem,
      settingsPU, CUSTOM_VIEW_STR
     }
  }
}
</script>

<style lang="scss">
.ao3pb-search-result {
  display: flex;
  flex-direction: column;
  background-color: #FFF;
  box-shadow: 0 2px 4px #888;

  & > *:nth-child(2n+1) button {
    background-color: #eee;
  }

  & > p {
    padding: 5px;

    span { display: inline-block; }
  }

  button {
    position: relative;
    text-align: left;
    padding: 5px 7px;
    background-color: #FFF;
    cursor: pointer;
    color: #555;
    font-size: 12px;

    & > * { vertical-align: bottom; }

    .ao3pb-icon { padding-right: 2px; }

    &.ao3pb-cur,
    &.author.ao3pb-cur {
      background-color: #555;
      color: #FFF;
    }

    &.author { color: $link_blue; }

    span {
      word-wrap: break-word;
      
      &:first-of-type { padding-right: 2px; }

      &.ao3pb-author {
        opacity: 0.7;
        font-size: 9px;
        padding-left: 2px;

        & > span:not(:last-child)::after {
          content: ',';
          display: inline;
          margin-right: 4px;
        }
      }
    }
  }
}
</style>