<template>
  <div class="ao3pb-search" :class="{open}">
    <input type="text" tabindex="-1" :value="selection && selection.text" :style="{opacity: partialText ? 0 : (open ? 0.5 : 1)}"/>
    <input class="ao3pb-search_main" ref="input" type="text" :value="partialText" :tabindex="getTabIndex([0])"
      @input="onInput"
      :placeholder="placeholder"
      @focus="onFocus"
      @click="onFocus"
      @blur="onBlur"
      @keydown="onKeyDown"
    />
    <button class="ao3pb-xbtn ao3pbs-ctr-v" v-if="selection" @click="clearSelection" title="Clear search result" :tabindex="getTabIndex([0])">&#10006;</button>
    <PBSearchResult v-if="open" @select="onSelect" :options="searchResults" />
  </div>
</template>

<script>
import {nextTick, ref, computed} from 'vue'
import { getTabIndex } from '@/popup/js/visibility'
import {
  selection, hoverredItem, resetHoverredItem, clearSelection,
  partialText, searchResults
} from '@/popup/js/search'

import PBSearchResult from './PBSearchResult.vue'
import { CUSTOM_VIEW_STR } from '@/common/const'
import { settingsPU } from '@/popup/js/setting'


export default {
  props: ["curSelection"],
  components: { PBSearchResult },
  setup() {
    const input = ref(null)
    const open = ref(false)

    const placeholder = computed(() => {
      if (selection.value) return ''
      let keyword = ''
      if (settingsPU.view === -2) keyword = '[work with no status] '
      else if (settingsPU.view >= 0) keyword = `[${CUSTOM_VIEW_STR[settingsPU.view].toLowerCase()} work] `

      return `Search ${keyword}by title or author`
    })
    const onFocus = () => {
      if (open.value) return

      // console.log('focus')

      open.value = true
      
      /**
       * - if searchResults.length > 0 and no matches selection, 
       * - applicable to onFocus triggered by onInput when result list is not opened
       * - if hoverredItem exist, do not reset hoverredItem to 0 when searchResults.length > 0
       */
      if (searchResults.value.length) {
        if (hoverredItem.i === -1) {
          hoverredItem.i = 0
          hoverredItem.id = searchResults.value[0].id
        } else if (!selection.value && partialText.value === '') {
          resetHoverredItem()
        }
      } else {
        resetHoverredItem()
      }
    }

    const onInput = async e => {
     
      resetHoverredItem()
      partialText.value = e.target.value

      /**
       * wait until searchResults update upon partialText.value change
       */
      await nextTick()

      /**
       * if input change result in searchResults.length > 0, reset hover to the first searchResults item
       * if old hoverredItem exist in new searchResults, overwrite it into 0
       */
      //  
      if (partialText.value.trim() && searchResults.value.length) {
        hoverredItem.i = 0
        hoverredItem.id = searchResults.value[0].id
      }

      if (!open.value) open.value = true
    }

    const onBlur = e => {
        if (!e.relatedTarget || !e.relatedTarget.classList.contains("ao3pbr-blur")) {
          open.value = false
          partialText.value = ''
        }
    }

    const onSelect = (e, item) => {
      selection.value = item
      partialText.value = ''
      resetHoverredItem()
      open.value = false
    }

    const onKeyDown = e => {
      if (e.shiftKey && e.code === 'Tab') return

      let newI = hoverredItem.i

      switch (e.code) {
        case 'Tab':
            e.target.blur()
          break
        case 'Escape':
          if (partialText.value) {
              partialText.value = ''
              resetHoverredItem()
          }
          else e.target.blur()
          
          e.preventDefault() // prevent esc cause the entire popup to close
          break
        case 'Enter':
          if (open.value) {
            if (searchResults.value[hoverredItem.i]) onSelect(null, searchResults.value[hoverredItem.i])
          } else {
            onFocus()
          }
            break
        case 'ArrowUp':
          hoverredItem.viaNav = true
          if (searchResults.value.length === 1) {
            newI = 0
          } else {
            newI = hoverredItem.i <= 0 ? 0 : hoverredItem.i - 1
          }
          hoverredItem.id = searchResults.value[newI].id
          hoverredItem.i = newI
          e.preventDefault()
          break
        case 'ArrowDown':
          hoverredItem.viaNav = true
          newI = (hoverredItem.i < searchResults.value.length - 1) ? hoverredItem.i + 1 : searchResults.value.length - 1
          hoverredItem.id = searchResults.value[newI].id
          hoverredItem.i = newI
          e.preventDefault()
          break
      }
    }

    return {
        input, open, placeholder,
        selection, partialText, hoverredItem, searchResults, getTabIndex,
        onFocus, onSelect, onInput, onBlur, clearSelection, onKeyDown
    }
  }
    
}
</script>

<style lang="scss">
.ao3pb-search {
  position: relative;

  &.open {
    &::before {
      pointer-events: all;
      cursor: pointer;
      transform: rotate(-135deg);
      top: 9px;
    }

    .ao3pb-xbtn { display: none; }
  }

  input {
    width: 100%;
    padding: 5px 14px 5px 5px;
    outline: none;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: inset 0 2px 2px #bbb;

    &:first-child {
      position: absolute;
      top: 0;
      left: 0;
      pointer-events: none;
      background-color: transparent;
      opacity: 0.5;
    }
  }

  .ao3pb-xbtn {
    right: 25px;
    font-size: 14px;
    color: #888;
    
    cursor: pointer;
    transition: transform 0.2s, color 0.2s;

    &:hover,
    &:focus-visible { transform: translateY(-50%) scale(1.2); color: #333; }
  }

  &::before {
    content: '';
    position: absolute;
    top: 5px;
    right: 8px;
    transform: rotate(45deg);
    border-right: 2px solid #888;
    border-bottom: 2px solid #888;
    height: 8px;
    width: 8px;
    transition: transform 0.2s, border-color 0.2s;
    pointer-events: none;
  }
  
  .ao3pb-search-result {
    position: absolute;
    z-index: 2;
    bottom: 0;
    transform: translateY(100%);
    width: 100%;
    max-height: 150px;
    overflow-y: auto;
  }
}
</style>
