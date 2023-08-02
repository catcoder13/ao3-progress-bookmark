<template>
  <button class="ao3pb-status" :tabindex="getTabIndex([0])">
    <span :class="{[`ao3pb-v${(!work.v && work.v !== 0) ? 'x' : work.v}`]: true}">{{ work.v != null ? CUSTOM_VIEW_STR[work.v] : '+ status' }}</span>
    <div>
      <div><button :tabindex="getTabIndex([0])" v-for="(vStr, i) in CUSTOM_VIEW_STR" :title="`${i === work.v ? 'Unmark' : 'Mark as'} &#x201C;${vStr}&#x201D;`" :key="i"
        :class="{'ao3pb-cur': work.v === i, [`ao3pb-v${i}`]: true}"
        @click="() => onClickView(i)">{{ vStr }}</button></div>
    </div>
    
    </button>
</template>

<script>
import { watch } from 'vue'

import { updateWorkView, works } from '@/popup/js/works'
import { CUSTOM_VIEW_STR } from '@/common/const'
import { settingsPU } from '@/popup/js/setting'
import { getTabIndex } from '@/popup/js/visibility'

export default {
  props: ['work'],
  setup (p) {
    const onClickView = v => {
      const newV = p.work.v === v ? null : v
      updateWorkView(p.work.id, newV)
    }

    watch(() => settingsPU.view,
    () => {
      works.value[p.work.id].lv = null
    })

    return { CUSTOM_VIEW_STR, getTabIndex,  onClickView }
  }
}
</script>

<style lang="scss">
span[class*=ao3pb-v],
button[class*=ao3pb-v] {
  display: inline-block;
  border: 1.5px solid #444;
  border-radius: 4px;
  color: #333;
  font-size: 9px;
  font-weight: bold;
  line-height: 1.6;
  height: 16px;
  width: 50px;
  text-align: center;

  &.ao3pb-vx,
  &.ao3pb-v-2 {
    border-style: dashed;
    opacity: 0.6;
  }

  &.ao3pb-v0 { background-color: #eafdff; }
  &.ao3pb-v1 { background-color: #8ee6f0 ; }
  &.ao3pb-v2 { background-color: #fc9e9e  ; }
}

button.ao3pb-status {
  position: relative;
  display: inline-block;
  vertical-align: middle;
  pointer-events: all;
  margin-right: 3px;

  & > span { pointer-events: none; }
  
  
  &:hover,
  &:focus-visible {
    & > span {
      box-shadow: 0 0 2px #888;

      &.ao3pb-vx { opacity: 1; }
    }

    & > div {
      opacity: 1;
      pointer-events: all;
      padding-left: calc(100% + 5px);
    }
  }

  & > div {
    opacity: 0;
    top: 50%;
    left: 0;
    pointer-events: none;
    position: absolute;
    z-index: 2;
    padding-left: 0;
    transform: translateY(-50%);
    transition: opacity 0.2s, padding-left 0.2s;
  }

  & > div > div {
    display: flex;
    gap: 3px;
    padding: 4px;
    box-shadow: 0 0 4px #888;
    background-color: #e3e3e3;
    border-radius: 2px;

    button {
      cursor: pointer;
      border-style: dashed;
      filter: grayscale(1);
      opacity: 0.75;

      &:hover,
      &:focus-visible { filter: grayscale(0.5); opacity: 1; }

      &.ao3pb-cur {
        border-style: solid;
        filter: grayscale(0);
        opacity: 1;
      }
    }
  }
}
</style>
