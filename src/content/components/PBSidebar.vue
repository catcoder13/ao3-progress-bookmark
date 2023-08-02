<template>
  <div class="ao3pb-sidebar-group">
    <div class="ao3pb-sidebar">
      <div v-if="!extValidState" class="ao3pb-sidebar__button--reload" @click="reloadPage">
        <PBIcon type="reload" fill="" />
        <div class="ao3pb-bubble ao3pb-invalid">
          <p>Click to reload/refresh this page</p>
          <!-- <p v-html="EXT_INVALID_MSG"></p> -->
        </div>
      </div>
      <div class="ao3pb-sidebar__button--bookmark">
        <template v-if="!extValidState">
          <a class="ao3pb-abtn">
            <PBIcon class="ao3pbs-ctr" fill="#FFF" :type="mainBM.cI == null ? 'add' : 'location'" />
            <div class="ao3pb-bubble ao3pb-invalid" v-html="EXT_INVALID_MSG"></div>
          </a>
        </template>
        <template v-else-if="mainBM.cI == null">
          <a class="ao3pb-abtn" @click="onBookmarkEntryClick" :class="{exceed: !withinBookmarkLimit}">
            <PBIcon class="ao3pbs-ctr" fill="#FFF" type="add" />
            <div class="ao3pb-bubble">
              <template v-if="!withinBookmarkLimit">
                <b>You had reached bookmark limit ({{ BOOKMARK_LIMIT }}).</b>
                <span>Try to remove some existing bookmarks to create more space for new bookmarks.</span>
              </template>
              <template v-else>Add a new bookmark</template>
            </div>
          </a>
        </template>
        <template v-else>
          <a class="ao3pb-abtn--entry" :href="jumpToBookmarkHref" :class="{bmInOtherPage}" @click="jumpToBM">
            <PBIcon class="ao3pbs-ctr" fill="#FFF" type="location" />
            <div class="ao3pb-bubble">
              <b>Jump to bookmark</b>
              <span v-if="bmInOtherPage" class="ao3pb-warning">
                Bookmark located at Chapter {{ parseInt(mainBM.cI) + 1 }}.<br/>
                Click to redirect to Chapter {{ parseInt(mainBM.cI) + 1 }}
                <PBIcon type="visit" fill="#999" />
              </span>
            </div>
          </a>
          <a class="ao3pb-abtn--extra" @click="onBookmarkEntryClick">
            <PBIcon class="ao3pbs-ctr" fill="#FFF" type="edit" />
            <div class="ao3pb-bubble">Change bookmark location{{ mainBM.cI != curCI ? ' to this chapter' : '' }}</div>
          </a>
          <a class="ao3pb-abtn--extra" @click="removeBookmark">
            <PBIcon class="ao3pbs-ctr" fill="#FFF" type="trash" />
            <div class="ao3pb-bubble">Remove bookmark</div>
          </a>
        </template>
      </div>

    </div>
    <div v-if="settings.extraSideBtn" class="ao3pb-sidebar ao3pb-sidebar--extra">
      <a class="ao3pb-abtn" :href="sidebarHref(cICode)" @click="onClick" v-for="({cICode, iconProps, onClick, btnKey, checkIfExternal}, i) in buttons" :key="i">
        <div class="ao3pb-bubble">
          {{ btnLabel(btnKey) }}
          <PBIcon v-if="checkIfExternal && isExternal[btnKey]" type="visit" fill="#999" />
        </div>
        <PBIcon class="ao3pbs-ctr" v-bind="iconProps" fill="#FFF" />
      </a>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { chapters, curCI } from '../js/page'
import { mainBM, bmInProgress, startBookmarkEdit, withinBookmarkLimit, jumpToBookmark, removeBookmark } from '../js/bookmark'
import { chapterInfos, isEntireWork, oneShot, workID } from '../js/static'
import { settings, settingExtraBtn } from '../js/setting'
import { BOOKMARK_LIMIT, EXTRA_BUTTON_INFOS } from '@/common/const'
import { EXT_INVALID_MSG, extValidState } from '../js/valid'

import PBIcon from '@/common/PBIcon.vue'

export default {
  components: { PBIcon },
  setup () {
    const onBookmarkEntryClick = e => startBookmarkEdit(e, chapters)

    const isExternal = computed(() => {
      if (isEntireWork) return false

      return {
        firstCh: curCI.value > 0,
        prevCh: curCI.value > 0,
        nextCh: curCI.value < chapterInfos.length - 1,
        latestCh: curCI.value < chapterInfos.length - 1 
      }
    })

    const bmInOtherPage = computed(() => !isEntireWork && mainBM.cI != curCI.value)

    const jumpToBM = () => {
      jumpToBookmark(chapters, curCI)
    }

    const jumpToBookmarkHref = computed(() => {
      if (!isEntireWork && mainBM.cI != null &&  mainBM.cI != curCI.value) {
        return `/works/${workID}/chapters/${chapterInfos[mainBM.cI].cID}?ao3pbjump`
      }

      return null
    })

    const sidebarHref = cICode => {
      if (cICode === -3) return '#main'
      if (cICode === 3) {
        const commentSection = document.getElementById('show_comments_link')
        return (commentSection && '#show_comments_link') || '#add_comment'
      }

      let targetChHash = curCI.value // cICode === 0

      if ((cICode === -2 || cICode === -1) && curCI.value === 0) return null
      if ((cICode === 1 || cICode === 2) && curCI.value === chapterInfos.length -1) return null

      if (cICode === -2) targetChHash = 0
      else if (cICode === -1) targetChHash = Math.max(0, curCI.value - 1)
      else if (cICode === 1) targetChHash = Math.min(curCI.value + 1, chapterInfos.length - 1)
      else if (cICode === 2) targetChHash = chapterInfos.length - 1
      
      if (isEntireWork || targetChHash === curCI.value) return `#chapter-${targetChHash + 1}`
      
      return `/works/${workID}/chapters/${chapterInfos[targetChHash].cID}#chapter-${targetChHash + 1}`
      
    }

    const buttons = computed(() => {
      return Object.keys(EXTRA_BUTTON_INFOS)
        .filter(btnKey => {
          if (btnKey === 'backToTop' || btnKey === 'comment') return settingExtraBtn[btnKey]
          return !(oneShot || chapterInfos.length === 1) && settingExtraBtn[btnKey]
        })
        .map(btnKey => ({btnKey, ...EXTRA_BUTTON_INFOS[btnKey]}))
    })

    const btnLabel = btnKey => {
      const curChIStr = parseInt(curCI.value) + 1
      return {
        prevCh: 'Previous: Chapter ' + Math.max(1, curChIStr - 1),
        nextCh: 'Next: Chapter ' + Math.min(chapterInfos.length, curChIStr + 1),
        latestCh: 'Latest: Chapter ' + chapterInfos.length
      }[btnKey] || EXTRA_BUTTON_INFOS[btnKey].label
    }

    const reloadPage = () => window.location.reload()

    return {
      sidebarHref,
      mainBM, curCI, removeBookmark, onBookmarkEntryClick, jumpToBM, jumpToBookmarkHref, withinBookmarkLimit, BOOKMARK_LIMIT,
      bmInProgress, settings, bmInOtherPage, extValidState, EXT_INVALID_MSG, reloadPage,
      buttons, btnLabel, isExternal
    }
  }
}
</script>

<style lang="scss">
.ao3pb-sidebar-group {
  position: fixed;
  z-index: 99;
  top: 100px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.ao3pb-sidebar {
  display: flex;
  gap: 3px;
  flex-direction: column;
  align-items: flex-end;

  a[class*=ao3pb-abtn] {
    position: relative;
    background-color: rgba($ao3_red, 0.7);
    width: 20px;
    height: 23px;
    
    border-top-left-radius: 3px;
    border-bottom-left-radius: 3px;

    &:hover {
      background-color: rgba($ao3_red, 1);
      transition: background-color 0.2s;

      .ao3pb-bubble { display: block; }
    }

    &.exceed {
      background-color: #bfbfbf;
      cursor: not-allowed;

      &:active::before { opacity: 0; }

      .ao3pb-bubble {
        white-space: normal;
        width: 250px;

        & > * { display: inline-block; }
        
        b { color: red; padding-bottom: 5px; }
      }
    }
    

    & > .ao3pb-icon {
      transition: transform 0.2s;
      width: calc(100% - 2px);
      // height: calc(100% - 6px);
    }
    

    .ao3pb-bubble {
      display: none;
      position: absolute;
      z-index: 1;
      padding: 5px;
      background-color: #ddd;
      bottom: 0;
      transform: translateY(calc(100% + 5px));
      right: 24px;
      pointer-events: none;
      font-size: 11px;
      color: #333;
      line-height: 12px;
      text-align: left;
      white-space: nowrap;
      box-shadow: 1px 1px 2px #999;
      

      &.ao3pb-invalid {
        background-color: $invalid_orange;
        color: #FFF;
        white-space: wrap;
        width: 243px;
        line-height: 13px;
      }
    }
  }

  .ao3pb-sidebar__button--reload {
    cursor: pointer;
    position: absolute;
    top: -24px;
    right: 1px;

    &:hover {
      .ao3pb-icon { transform: scale(1); }

      .ao3pb-bubble.ao3pb-invalid { display: block; }
    }

    b {
      display: block;
      padding-bottom: 3px;
      font-size: 12px;
    }

    .ao3pb-icon {
      width: 22px;
      height: 22px;
      transform: scale(0.9);
      transition: transform 0.2s;

      path { fill: $invalid_orange; }
    }

    .ao3pb-bubble.ao3pb-invalid {
      display: none;
      position: absolute;
      background-color: $invalid_orange;
      padding: 5px;
      font-size: 11px;
      right: 24px;
      width: 243px;
      color: #FFF;
      z-index: 1;
      pointer-events: none;
    }
  }

  .ao3pb-sidebar__button--bookmark {
    display: flex;
    flex-direction: row-reverse;

    &:hover {
      a[class*=ao3pb-abtn].ao3pb-abtn--entry { border-radius: 0; }
      a[class*=ao3pb-abtn].ao3pb-abtn--extra {
        display: block;
        
        &:not(:last-of-type) { border-radius: 0; }
      }
    }

    a[class*=ao3pb-abtn] {
      &:hover ~ [class*=ao3pb-abtn] { opacity: 0.85; }

      &.ao3pb-abtn--extra {
        display: none;
        color: #FFF;
        text-align: center;

        .ao3pb-bubble { right: 4px; }
      }

      &.bmInOtherPage {
        background-color: rgba(grey, 0.85);
        
        &:hover { background-color: rgba(grey, 1); }
      }

      .ao3pb-bubble {
        b {
          display: block;
          padding-bottom: 5px;

          &:only-child {
            font-weight: normal;
            padding-bottom: 0;
          }
        }

        .ao3pb-warning {
          display: block;
          color: #397ce1;
        }
      }
    }
  } //.ao3pb-sidebar__button--bookmark
} // .ao3pb-sidebar

// setting mode: align left
.ao3pb-left .ao3pb-sidebar-group {
  right: auto;
  left: 0;
  
  .ao3pb-sidebar {
    align-items: flex-start;

    a[class*=ao3pb-abtn] {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-top-right-radius: 3px;
      border-bottom-right-radius: 3px;

      .ao3pb-bubble {
        right: auto;
        left: 24px;
      }
    }

    .ao3pb-sidebar__button--reload {
      right: auto;
      left: 1px;
      
      .ao3pb-bubble { right: auto; left: 24px;}
    }

    .ao3pb-sidebar__button--bookmark {
      flex-direction: row;
      
      & > a[class*=ao3pb-abtn] {
        .ao3pb-bubble {
          right: auto;
          left: 24px;
        }

        &.ao3pb-abtn--extra .ao3pb-bubble { right: auto; left: 4px; }
      }
    }
  }

}

// setting mode align left, hide/show extra button
.ao3pb-left.ao3pb-extraHid .ao3pb-sidebar-group {
  &:hover .ao3pb-sidebar { right: auto; left: 0; }

  .ao3pb-sidebar { right: auto; left: -19px; transition: left 0.2s;}
}

// setting mode hide/show extra button
.ao3pb-extraHid .ao3pb-sidebar-group {

  &:hover .ao3pb-sidebar { right: 0; }

  .ao3pb-sidebar {
    position: relative;
    right: -19px;
    transition: right 0.2s;

    [class*=ao3pb-abtn] {
      width: 24px;
    }
  }
}

.ao3pb-sidebar.ao3pb-sidebar--extra > a[class*=ao3pb-abtn] {
  background-color: rgba($btn_blue, 0.7);

  &:hover { background-color: rgba($btn_blue, 1); }

  &:not([href]) {
    transition: opacity 0.2s;
    opacity: 0.3;
    filter: grayscale(1);
    pointer-events: none;
  }
}

</style>