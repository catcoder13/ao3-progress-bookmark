<template>
  <div class="ao3pb-viewtab">
    <button :class="{'ao3pb-cur': settingsPU.view === -1}" :tabindex="getTabIndex([0])"
      @click="settingsPU.view = -1">All</button>
    
    <button v-for="i in CUSTOM_VIEW" :key="i" :tabindex="getTabIndex([0])"
      :class="{'ao3pb-cur': i === settingsPU.view}"
      @click="settingsPU.view = i">{{ CUSTOM_VIEW_STR[i] }}</button>

    <button :class="{'ao3pb-cur': settingsPU.view === -2}" :tabindex="getTabIndex([0])"
      @click="settingsPU.view = -2">No status</button>
  </div>
</template>

<script>
import { CUSTOM_VIEW, CUSTOM_VIEW_STR } from '@/common/const'
import { settingsPU } from '../js/setting'
import { getTabIndex } from '../js/visibility'

export default {
  setup () {

    return { CUSTOM_VIEW, CUSTOM_VIEW_STR, settingsPU, getTabIndex}
  }
}
</script>

<style lang="scss">
.ao3pb-viewtab {
  border-bottom: 2px solid #FFF;
  display: flex;
  gap: 2px;
  justify-content: center;

  button {
    color: #FFF;
    opacity: 0.5;
    line-height: 1;
    padding: 3px 9px;
    font-size: 12px;
    cursor: pointer;
    border-top-left-radius: 2px;
    border-top-right-radius: 2px;

    &:hover,
    &:focus-visible {
      opacity: 0.8;
      background-color: rgba(#FFF, 0.2);
    }

    &.ao3pb-cur {
      pointer-events: none;
      cursor: default;
      opacity: 1;
      background-color: #FFF;
      color: #333;
      filter: invert(0);
      font-weight: bold;
    }
  }
}
</style>
