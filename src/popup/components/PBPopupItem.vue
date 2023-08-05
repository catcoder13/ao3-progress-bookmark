

<template>
  <div class="ao3pb-pu-item" :class="PBPopupItemClass()">
    <button title="Remove this bookmark" class="ao3pb-xbtn" @click="onRemoveWork" :tabindex="getTabIndex([0])">
      <PBIcon class="ao3pbs-ctr-v" type="trash" fill="#FFF" />
      <!-- <span>&#10006;</span> -->
    </button>

    <button class="ao3pb-pu-item__backgroundBtn" @click="onBtnClick" :title="btnTitle" :tabindex="getTabIndex([0])"></button>

    <span class="ao3pb-index" v-if="index">{{ index }}.</span>

    <div class="ao3pb-pu-item__infos">
      <PBStatus :work="work" v-if="settingsPUUI.compact"/>

      <h3>{{ work.name }}</h3>

      <!-- <button class="ao3pb-authors">{{settingsPUUI.compact ? '' : 'by'}} -->
        <span>
          <a href="#" v-for="(name, i) in authorNames" :key="i" class="ao3pb-author"
            @click="e => onAuthorClick(e, name)" :tabindex="getTabIndex([0])" :title="name">
            <PBIcon v-if="settingsPUUI.compact" type="author" fill="#166fce" />
            <span v-else>{{ name }}</span>
          </a>
        </span>
        
    <!-- </button> -->
     
    </div>

    <div class="ao3pb-pu-item__details">
      <button class="ao3pb-preview" :class="{'ao3pb-invalid' : work.xpv}"
        :title="work.xpv ? `Preview unavailable due to text character\ncount exceeded backup limit.` : 'Preview'"
        @click="onPreviewClick" :tabindex="getTabIndex([0])"><PBIcon type="preview" fill="#333" /></button>
      
      <span class="ao3pb-pu-item__details__ch" :class="{'oneshot': work.os}">
        <span v-if="settingsPUUI.compact < 2">{{chapterText}}</span> <span class="ao3pb-pct">{{ pctStr }}</span></span>

      <PBStatus :work="work" v-if="!settingsPUUI.compact"/>
      
      <span class="ao3pb-dt" :title="`Bookmark created/updated on ${time}`">
        <template v-if="!settingsPUUI.compact">&#x1F550; {{time}}</template>
        <template v-else>&#x1F550;</template>
      </span>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { getTabIndex } from '@/popup/js/visibility'
import { removeWork, visitURL } from '@/popup/js/works'
import { settings, settingsPU, settingsPUUI } from '@/popup/js/setting'
import { selectAuthor, selection } from '@/popup/js/search'
import { PREVIEW_CHAR_LIMIT, ANONYMOUS_USER_NAME, CUSTOM_VIEW_STR } from '@/common/const'

import PBStatus from './PBStatus.vue'
import PBIcon from '@/common/PBIcon.vue'

export default {
  props: ['work', 'index'],
  components: { PBIcon, PBStatus },
  setup (p) {
    const time = (new Date(p.work.t)).toLocaleString()

    const onBtnClick = () => {
      if (p.work.os) {
        visitURL(`/works/${p.work.id}?ao3pbjump`)
      } else {
        visitURL(`/works/${p.work.id}/chapters/${p.work.cID}?ao3pbjump`)
      }
    }

    const pctStr = computed(() => (settingsPUUI.compact ? Math.floor(p.work.pct * 100) : (p.work.pct * 100).toFixed(2)) + '%')

    const btnTitle = computed(() => {
      let remarks = '' 
      
      /**
       * bookmark relocation message is NOT shown only if
       *  - under 'All(-1)' view
       *  - under 'No status(-2)' view AND latest work.v is null
       *  - under 'Unread(0)/Reading(1)/Complete(2)' view AND latest work.v === settingsPU.view
       */
      if (settingsPU.view !== -1 && !(settingsPU.view === -2 && p.work.v === null)) {
        if (p.work.v !== settingsPU.view) {
          remarks = `\n(This bookmark will be relocated to [${CUSTOM_VIEW_STR[p.work.v] || 'No status'}])`
        }
      }

      const pctStrFull = (p.work.pct * 100).toFixed(2) + '%'
      
      if (p.work.os) return `Visit One-shot (${pctStrFull})${remarks}`
      
      return `Visit Chapter ${parseInt(p.work.cI) + 1}${p.work.chT ? `: ${p.work.chT}` : ''} (${pctStrFull})${remarks}`
    })

    const chapterText = computed(() => {
      if (p.work.os) return settingsPUUI.compact ? 'Os' : 'One-shot'

      return (settingsPUUI.compact ? 'C.' : 'Chapter ') + (parseInt(p.work.cI) + 1)
    })
    
    const PBPopupItemClass = () => {
      return {
        'ao3pb-pu-item--compact': settingsPUUI.compact === 1,
        'ao3pb-pu-item--compact2': settingsPUUI.compact === 2,
        'ao3pb-lv': p.work.lv != null
      }
    }

    const onPreviewClick = e => {
      e.stopPropagation()
      if (p.work.xpv) return 

      chrome.tabs.create({ url: chrome.runtime.getURL(`preview.html?workid=${p.work.id}`) }, () => {
        window.close()
      })
      
    }

    const authorNames = computed(() => {
      if (!p.work.a) return [ANONYMOUS_USER_NAME]

      return Object.keys(p.work.a)
    })

    const onAuthorClick = (e, aName) => {
      e.stopPropagation()
      selectAuthor(aName)
    }

    const onRemoveWork = e => {
      e.stopPropagation()
      removeWork(p.work.id)
    }

    return {
      chapterText, btnTitle, time, onBtnClick, settings, settingsPUUI, authorNames,
      PBPopupItemClass, onAuthorClick, onRemoveWork, onPreviewClick, selection, getTabIndex,
      PREVIEW_CHAR_LIMIT, CUSTOM_VIEW_STR, settingsPU, pctStr
    } 
  }
}
</script>

<style lang="scss">
.ao3pb-pu-item[class*=ao3pb-pu-item--compact] {
  flex-direction: row;
  align-items: center;
  justify-content: space-between;

  width: 100%;
  pointer-events: none;
  padding: 8px 16px 5px 5px;
  margin-bottom: 8px;

  .ao3pb-status { margin: 0 4px 4px 0; }
  
  .ao3pb-pu-item__infos {
    margin-bottom: 0;
    max-width: 280px;

    h3 { font-size: 13px; }

    a.ao3pb-author {
      margin-right: 4px;

      .ao3pb-icon { width: 13px; height: 13px; }

      &:hover,
      &:focus-visible {
        .ao3pb-icon {
          transition: transform 0.2s;
          transform: scale(1.2);
        }
      }

      &::after { display: none; }
    }
  }

  .ao3pb-pu-item__details {
    .ao3pb-pu-item__details__ch {
      margin-right: 2px;
      padding: 3px;
    }

    span.ao3pb-dt { pointer-events: all; }

    
  }
} // .ao3pb-pu-item.ao3pb-pu-item--compact

.ao3pb-pu-item.ao3pb-pu-item--compact2 {
  padding: 0 16px 0 5px;
  margin-bottom: 1px;
  
  .ao3pb-index { font-size: 7px; }

  .ao3pb-pu-item__infos {
    display: flex;
    padding-top: 6px;
    max-width: 290px;

    h3 { 
      font-size: 11px;
      line-height: 16px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    & > span { // author group
      white-space: nowrap;
    }
  }

  .ao3pb-pu-item__details {
    .ao3pb-pu-item__details__ch {
      padding: 1px 3px;
    }

    
  }
}

.ao3pb-pu-item {
  position: relative;
  margin-bottom: 10px;
  padding: 10px 16px 8px 8px;
  
  text-align: left;
  display: flex;
  flex-direction: column;
  width: 100%;

  &.ao3pb-lv {
    button.ao3pb-pu-item__backgroundBtn { background-color: #aaa; }
  }

  button.ao3pb-pu-item__backgroundBtn {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
    pointer-events: all;
    background-color: #e3e3e3;

    &:hover,
    &:focus-visible {
      filter: brightness(0.9);
      box-shadow: 1px 1px 2px #555;
      filter: brightness(0.9);
    }
    
    &:focus-visible { box-shadow: 0 0 2px 2px #51a7e8; }

    &:active {
      transition: box-shadow 0s;
      filter: brightness(0.95);
      box-shadow: 0px 0px 2px #555;
    }

    & ~ * {
      z-index: 1;
      pointer-events: none;
    }
  }

  .ao3pb-index {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 8px;
    color: #999;
    pointer-events: none;
  }

  .ao3pb-preview {
    cursor: pointer;
    opacity: 0.7;
    pointer-events: all;
    margin-right: 2px;

    .ao3pb-icon {
      width: 20px;
      height: 20px;
    }

    &:not(.ao3pb-invalid) {
      &:hover,
      &:focus-visible {
        opacity: 1;

        .ao3pb-icon {
          transition: transform 0.2s;
          transform: scale(1.15);
        }
      }
    }
    
    &.ao3pb-invalid {
      opacity: 0.2;
      cursor: not-allowed;
    }
  }

  .ao3pb-pu-item__infos {
    margin-bottom: 10px;
    width: 100%;

    h3 {
      font-family: Georgia, serif;
      font-size: 16px;
      line-height: 1.2;
      word-wrap: break-word;
      display: inline;
      padding-right: 5px;
      color: #000;
    }

    & > span {
      font-size: 11px;
      line-height: 1.1;
      text-align: left;
    }

    a.ao3pb-author {
      display: inline-block;
      font-size: 12px;
      word-wrap: break-word;
      position: relative;
      z-index: 1;
      pointer-events: all;
      margin-right: 8px;
      
      &:last-child { margin-right: 0; }

      &:hover,
      &:focus-visible {
        opacity: 1;

        .ao3pb-icon { opacity: 1; }

        span {
          transition: transform 0.2s;
          transform: scale(1.05);
        }
      }

      .ao3pb-icon { opacity: 0.7; }

      & > * {
        display: inline-block;
        vertical-align: text-bottom;
      }

      &:not(:last-child) {
        position: relative;
        
        &::after {
          content: ',';
          position: absolute;
          right: -4px;
          bottom: 0;
          color: #333;
        }
      }
    }
  } // ao3pb-pu-item__infos
      
  .ao3pb-pu-item__details {
    display: inline-block;
    white-space: nowrap;

    & > * { display: inline-block; vertical-align: middle; }

    .ao3pb-pu-item__details__ch {
      margin-right: 5px;
      padding: 3px 6px;
      background-color: #777;
      color: #eee;
      border-radius: 3px;
      font-size: 10px;
      font-weight: bold;

      &.oneshot {
        background-color: #fff;
        color: #333;
      }

      & > span.ao3pb-pct {
        font-weight: normal;
        font-size: 8px;
      }
    } // .ao3pb-pu-item__details__ch

    span.ao3pb-dt {
      font-size: 10px;
      color: #333;
      opacity: 0.8;
      user-select: none;
    }
  } // ao3pb-pu-item__details

  

  .ao3pb-xbtn {
    position: absolute;
    z-index: 1;
    right: 0;
    top: 0;
    padding: 0;
    height: 100%;
    width: 12px;
    background-color: #666;
    opacity: 0.2;
    transition: opacity 0.2s;
    cursor: pointer;
    pointer-events: all;

    &:hover,
    &:focus-visible {
      transition: width 0.2s, opacity 0.2s;
      opacity: 1;
      width: 18px;
      background-color: red;
      box-shadow: 1px 1px 3px #333;
    }

    &:focus-visible { box-shadow: 0 0 2px 2px #51a7e8; }

    .ao3pb-icon {
      left: 0;
      width: 100%;
    }
  }
} // ao3pb-pu-item
</style>
