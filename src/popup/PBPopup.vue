<template>
  <div class="ao3pb-pu">
    <PBSetting></PBSetting>
    <!-- <button @click="clearLocalStorage" tabindex="-1" :style="{position: 'fixed', zIndex: 10, cursor: 'pointer', backgroundColor: '#FFF'}">Clear sync storage</button> -->
    <div class="ao3pb-pu__head">
      <h1 class="ao3pb-pu__title">AO3 Progress Bookmark</h1>

      <PBViewTab />
    </div>
    
    <PBSearch />
    <div class="ao3pb-pu__sort">
      <PBSortByTab />
      <div class="ao3pb-pu__sort__sideBtn ao3pbs-ctr-v">
        <button class="ao3pb-icon-wrapper" :title="compactTitle(settingsPUUI.compact)"
          @click="onCompactClick" :tabindex="getTabIndex([0])">
          <PBIcon type="compact" fill="#333" :index="settingsPUUI.compact" />
        </button>
      </div>
    </div>

    <div class="ao3pb-pu__subhead">
      <div class="searchItao3pb-pu__subhead__count" v-if="!selection || selection.type === 'author'">
        <b>{{actualWorkCount}}<template v-if="settingsPU.view !== -1">/{{ Object.keys(works).length }}</template></b> work{{actualWorkCount > 1 ? 's':''}}
        <template v-if="selection && selection.type === 'author'">by <b>{{ selection.val }}</b></template>
        <!-- <span class="ao3pb-viewpin">{{ settingsPU.view >= 0 ? CUSTOM_VIEW_STR[settingsPU.view] : 'No status' }}</span> -->
        <template v-if="settingsPU.view !== -1"> under <span :class="{[`ao3pb-v${(!settingsPU.view && settingsPU.view !== 0) ? 'x' : settingsPU.view}`]: true}">
          {{ CUSTOM_VIEW_STR[settingsPU.view] || '+ status' }}
        </span></template>
        
        <span v-if="!selection && settingsPU.view === -1"> (Bookmark limit: 1000)</span>
      </div>

      <button v-if="selection" @click="clearSelection" :tabindex="getTabIndex([0])">&#10006; Clear search result</button>
    </div>
    
    <PBScrollWrapper class="ao3pb-pu__wrapper" :options="sortedWorks" :anchorMin="anchorMin" :maxResultAllowed="15" :appendOffset="6">
      <template v-slot:item="{item, index}">
        <PBPopupItem :work="item" :index="index" />
      </template>
      
      <span v-if="!Object.keys(works).length" class="ao3pb-no-bm-msg ao3pbs-ctr">No bookmark added.</span>
    </PBScrollWrapper>
  </div>
</template>

<script>
import '@/common/__base.scss'

import {computed, watch, ref, nextTick} from 'vue'
import { getTabIndex } from './js/visibility'
import {works, visitURL} from './js/works'
import { settings, settingsPU, settingsPUUI } from './js/setting'
import { selection, clearSelection } from './js/search'
import { BOOKMARK_LIMIT, SORT_BY, ANONYMOUS_USER_NAME, CUSTOM_VIEW_STR } from '@/common/const'

import PBSortByTab from './components/PBSortByTab.vue'
import PBSetting from './components/PBSetting/PBSetting.vue'
import PBPopupItem from './components/PBPopupItem.vue'
import PBIcon from '@/common/PBIcon.vue'

import PBSearch from './components/PBSearch/PBSearch.vue'
import PBScrollWrapper from './components/PBScrollWrapper.vue'
import PBViewTab from './components/PBViewTab.vue'

export default {
  name: 'App',
  components: { PBSortByTab, PBSetting, PBPopupItem, PBIcon, PBSearch, PBScrollWrapper, PBViewTab },
  setup () {
    const sortedWorks = computed(() => {
      if (!Object.keys(works.value).length) return []
      
      // filter work involved in view
      let workArr = Object.keys(works.value).map(workID => works.value[workID])
      if (settingsPU.view === -2) workArr = workArr.filter(work => (!work.v && work.v !== 0) || work.lv === 'x')
      else if (settingsPU.view >= 0) workArr = workArr.filter(work => work.v === settingsPU.view || work.lv === settingsPU.view)
      
      // handled selection
      if (selection.value) {
        if (selection.value.type === 'work') {
          workArr = workArr.filter(work => work.id === selection.value.val)
        } else if (selection.value.type === 'author') {
          if (selection.value.val === ANONYMOUS_USER_NAME) workArr = workArr.filter(work => !work.a)
          else workArr = workArr.filter(work => work.a && Object.keys(work.a).includes(selection.value.val))
        }
      }
      
      // sort works
      let workArrRef = null
      if (settingsPU.sortBy.val == 'name') {
        workArrRef = workArr.sort((a,b) => {
          const tA = a[settingsPU.sortBy.val].toUpperCase()
          const tB = b[settingsPU.sortBy.val].toUpperCase()
          return tB.localeCompare(tA) // descend by default
        })
      } else {
        workArrRef = workArr.sort((a, b) => b[settingsPU.sortBy.val] - a[settingsPU.sortBy.val]) // descend by default
      }

      return settingsPU.descends[settingsPU.sortBy.i] ? workArrRef : workArrRef.reverse()
    })

    /**
     * sortedWork preserve work that has its status change temporary (with work.lv)
     * - filter out those changed work (with work.v) to reflect the correct work count under a specific status view
     */
    const actualWorkCount = computed(() => {
      if (settingsPU.view === -1) return sortedWorks.value.length
      if (settingsPU.view === -2) return sortedWorks.value.filter(w => !w.v && w.v !== 0).length

      return sortedWorks.value.filter(w => w.v === settingsPU.view).length
    })

    /**
     * if any removal of work results in selected author have no work in current view(author may still have work from other view), 
     * - implies author should no longer exist in searchItems under current view
     * - must perform clearSelection
     */
    watch(() => selection.value && selection.value.type === 'author' && sortedWorks.value,
    newAuthorWorks => {
      if (selection.value && selection.value.type === 'author' && !newAuthorWorks.length) clearSelection()
    })

    /**
     * if any removal of work matches selected work, clearSelection
     */
    watch(() => selection.value && selection.value.type === 'work' && sortedWorks.value.filter(work => work.id === selection.value.val),
    selectedWork => {
      if (selection.value && selection.value.type === 'work' && !selectedWork.length) clearSelection()
    })

    /**
     * when view change
     *  - clear any selection (author or work selection)
     *  - reset current view's work item's last view property (work.lv)
     */
    watch(() => settingsPU.view,
    () => {
      clearSelection()
      
      sortedWorks.value.filter(work => work.lv = null)
    })


    /**
     * trigger scrollWrapper reset to (0, 0) when sortedWorks is updated due to settingsPU.sortBy change
     */
    const anchorMin = ref(0)
    watch(() => settingsPU.sortBy,
    async () => {
      anchorMin.value = -1
      await nextTick()
      anchorMin.value = 0
    })


    const clearLocalStorage =  () => {
      chrome.storage.local.clear()
    }

    const compactTitle = index => {
      if (index === 0) return 'Expand layout'
      if (index === 1) return 'Compact layout'
      return 'Extra compact layout'
    }

    const onCompactClick = () => {
      settingsPUUI.compact = (settingsPUUI.compact + 1) % 3
    }

    return {
      works, selection, sortedWorks, actualWorkCount,
      clearSelection, getTabIndex, compactTitle, onCompactClick,
      settingsPU, settingsPUUI, SORT_BY, visitURL, settings, clearLocalStorage,
      BOOKMARK_LIMIT, anchorMin, CUSTOM_VIEW_STR
    }
  }
}
</script>

<style lang="scss">
$bg: #FFF;

.ao3pb-pu {
  position: relative;
  width: 420px;
  height: 350px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  text-align: left;
  background-color: $ao3_red;
  box-shadow: 0 0 3px #333;
  margin: 0 auto;

  .ao3pb-pu__head {
    background: linear-gradient(to bottom, transparent 0%, #4c0000 100%);

    h1 {
      font-family: Georgia, serif;
      font-size: 18px;
      padding: 8px 0 10px;
      color: #FFF;
      text-align: center;
    }
  }

  .ao3pb-pu__sort {
    position: relative;
    padding: 4px 10px;
    background-color: #eee;
    
    .ao3pb-pu__sort__sideBtn {
      display: flex;
      gap: 3px;
      right: 5px;

      .ao3pb-icon-wrapper {
        cursor: pointer;
        opacity: 0.8;
        transition: opacity 0.2s;
        background-color: transparent;

        &::before { display: none;}

        &:hover { opacity: 1; }
      }
    }
  }

  .ao3pb-pu__subhead {
    position: relative;
    padding: 5px 10px 0;
    background-color: #FFF;
    font-size: 11px;
    color: #555;
    
    & > * { display: inline-block; }

    & > div { // searched bookmark numeric summary
      line-height: 1.4;
      max-width: 267px;

      b { word-break: break-all; }
    }

    & > button { // clear search result button
      float: right;
      border: 1px solid #bbb;
      padding: 4px 8px;
      white-space: nowrap;
      border-radius: 18px;
      cursor: pointer;
      color: #666;
      font-size: 12px;
      
      &:hover,
      &:focus-visible { border: 1px solid #777; }
    }
  }

  .ao3pb-pu__wrapper {
    position: relative;
    flex: 1;
    padding: 4px 10px 15px;
    
    border-top: 2px solid $bg;
    border-bottom: 5px solid $bg;
    background-color: $bg;
    overflow-y: overlay;
  }
}

// .fade-in-enter-active {
//   transition: all 0.5s ease;
// }

// .fade-in-leave-active {
//   transition: all 0.5s ease;
// }

// .fade-in-enter,
// .fade-in-leave-to {
//   opacity: 0;
// }
</style>
