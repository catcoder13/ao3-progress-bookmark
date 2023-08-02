<template>
  <div class="ao3pb-sorttab">
    <h2 class="ao3pb-title">Sort works by:</h2>
    <button :class="{'ao3pb-cur': opt.val == settingsPU.sortBy.val}" v-for="(opt,i) in SORT_BY" :key="i"
      @click="() => settingsPU.sortBy = opt" :tabindex="getTabIndex([0])">
      <PBIcon v-if="opt.icon" :type="opt.icon" />
      <span class="ao3pb-symbol" v-if="opt.symbol" v-html="opt.symbol"></span>
      <span>{{getOptLabel(opt)}}</span>
      <button :title="`${opt.label} is sorted in ${settingsPU.descends[i] ? 'descending' : 'ascending'} order`"
        @click="e => updateDescends(e, i)" :tabindex="getTabIndex([0], opt.val === settingsPU.sortBy.val)">
        <PBIcon type="sort" fill="" :open="!settingsPU.descends[i]"/>
      </button>
    </button>
  </div>
</template>

<script>
import PBIcon from '@/common/PBIcon.vue'

import { getTabIndex } from '@/popup/js/visibility'
import { settingsPU } from '@/popup/js/setting'
import { SORT_BY } from '@/common/const'

export default {
    components: { PBIcon },
    setup() {
        const getOptLabel = opt => typeof opt === "string" ? opt : opt.label

        const updateDescends = (e, i) => {
          const descendRef = settingsPU.descends
          descendRef[i] = !descendRef[i]

          settingsPU.descends = descendRef

          e.preventDefault()
        }
        return { SORT_BY, getOptLabel, updateDescends, settingsPU, getTabIndex }
    }
}
</script>

<style lang="scss">
.ao3pb-sorttab {
  h2 {
    display: inline-block;
    font-size: 12px;
    margin: 0;
    padding-right: 5px;
  }

  & > button {
    display: inline-block;
    cursor: pointer;
    transition: background-color 0.2s;
    font-size: 11px;
    line-height: 11px;
    padding: 2px 5px;
    margin-right: 5px;
    border-radius: 12px;
    border: 1px solid rgba(#333, 0.2);
    color: #777;
    // opacity: 0.6;

    & > * {
      display: inline-block;
      vertical-align: middle;

      &:not(:last-child) { padding-right: 2px; }
    }

    .ao3pb-icon {
      width: 13px;
      height: 11px;
      opacity: 0.4;
    }

    & > button { // ascend/descend sorting button
      pointer-events: none;
    }

    &:hover,
    &:focus-visible {
      border-color: rgba(#333, 0.5);

      & > button { opacity: 1; }
    }

    &.ao3pb-cur {
      pointer-events: none;
      border: 1.5px solid rgba(#333, 0.5);
      color: #333;
      background-color: #FFF;

      .ao3pb-icon { opacity: 1; }
      & > button { // ascend/descend sorting button
        pointer-events: all;
        cursor: pointer;
        fill: #333;

        &:hover,
        &:focus-visible .ao3pb-icon {
          transition: transform 0.2s;
          transform: scale(1.15);
        }
      } 
    }
  }
}
</style>
