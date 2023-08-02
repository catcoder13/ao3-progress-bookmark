<template>
  <PBLoadingView v-if="downloadInProgress" title="Download in progress..." desc="Please keep this popup window open before download complete or download will be revoked." />
  <PBLoadingView v-if="uploadInProgress" title="Upload in progress..." desc="Please keep this popup window open before upload complete or upload will be disrupted!" />

  <div class="ao3pb-sett ao3pbs-overlay" :class="{open: toggle}" @click="onClickedAreaCheck">
    <button class="ao3pb-sett__entry" @click="onToggle" :tabindex="getTabIndex([0,1])">
      <PBIcon class="ao3pbs-ctr" v-if="!toggle" type="menu" fill="#FFF" :open="false"/>
      <span class="ao3pbs-ctr" v-else>&#10006;</span>
    </button>
    
    <div ref="scrollDom" class="ao3pb-sett__content">
      <h1>Settings</h1>
      <div>
        <h2>AO3 work page layout</h2>
        <div class="ao3pb-sett__content__item">
          <div class="ao3pb-tab--custom">
            <button :class="{checked: !settings.alignRight}" @click="settings.alignRight = false" :tabindex="getTabIndex([1])">Left</button>
            <button :class="{checked: settings.alignRight}" @click="settings.alignRight = true" :tabindex="getTabIndex([1])">Right</button>
          </div>
          <h3>Alignment</h3>
        </div>

        <div class="ao3pb-sett__content__item">
          <PBToggle v-model="settings.extraSideBtnMode" :tabindex="getTabIndex([1])" />
          <h3>Side buttons concealed mode</h3>
        </div>
        <div class="ao3pb-remarks" :style="{opacity: settings.extraSideBtnMode ? 1 : 0.5}">
          Conceal a portion of the side button and reveal it gradually as the mouse cursor approaches.
        </div>
        
        <div class="ao3pb-sett__content__item">
          <PBToggle v-model="settings.progressBar" :tabindex="getTabIndex([1])" />
          <h3>Chapter progress bars</h3>
        </div>
        
        <div class="ao3pb-sett__content__item">
          <PBToggle v-model="settings.extraSideBtn" :tabindex="getTabIndex([1])"/>
          <h3>Extra navigation buttons</h3>
        </div>
        
        <div class="ao3pb-sett__extra-btn" :class="{enabled: settings.extraSideBtn}">
          <button v-for="(val, btnKey) in settingExtraBtn" :key="btnKey" :tabindex="getTabIndex([1], settings.extraSideBtn)"
            :class="{checked: val}"
            @click="() => onExtraBtnClick(btnKey, !val)">
              <PBIcon v-bind="EXTRA_BUTTON_INFOS[btnKey].iconProps" fill="#1c73b5"/>
              <span>{{ EXTRA_BUTTON_INFOS[btnKey].label }}</span>
          </button>
          <div class="ao3pb-remarks" v-if="settings.extraSideBtn">
            Note: some buttons will be deactivated when not needed (eg. First/Previous chapter buttons will be deactivated when the current page is already the first chapter; chapter-related buttons will be hidden on one-shot page)
          </div>
        </div>

        <button class="ao3pb-sett__reset" @click="onResetSetting" :tabindex="getTabIndex([1])">Reset to default settings</button>
      </div>
     
      <div class="ao3pb-sett__content__data">
        <h2>Bookmark data</h2>
        <div>
          <input id="importBMInput" ref="inputFile" type="file" accept=".json" @change="e => curFile = e.target.files[0]" required :tabindex="getTabIndex([1])"/>
          <label for="importBMInput">&#x1F5C1; Upload bookmark records</label>
        </div>

        <button class="ao3pb-download" @click="onDownload" :tabindex="getTabIndex([1])" :title="noWork ? 'No bookmark record available' : null" :class="{'ao3pb-invalid': noWork}">&#x1F5AB; Download all bookmark records</button>

        <button class="ao3pb-delete" @click="openDeleteWindow" :tabindex="getTabIndex([1])" :title="noWork ? 'No bookmark record available' : null" :class="{'ao3pb-invalid': noWork}">&#x1F5D1; Remove all bookmarks</button>
      </div>
    </div>

    <PBSettingUpload v-if="curFile" :file="curFile" @complete="importComplete" @cancel="onClearImport"/>

    <div v-if="deleteMsgOn" class="ao3pb-delete-msg ao3pbs-overlay">
      <b>Are you sure you want to remove all bookmark data?</b>
      <p>Before proceeding, it is advised to download your bookmark data using the "Download all bookmark records" button under the setting menu for potential recovery.</p>
      <div class="ao3pb-button">
        <button class="ao3pb-delete" @click="onDeleteAllBookmarkData" :tabindex="getTabIndex([2])">Confirm remove</button>
        <button @click="deleteMsgOn = false" :tabindex="getTabIndex([2])">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, computed } from 'vue'
import { getTabIndex, visibility } from '@/popup/js/visibility'
import { settings, settingExtraBtn, onResetSetting } from '@/popup/js/setting'
import { downloadData, downloadInProgress, uploadInProgress } from '@/popup/js/data'
import { EXTRA_BUTTON_INFOS } from '@/common/const'
import { works, removeAllWorks } from '@/popup/js/works'

import PBToggle from './PBToggle.vue'
import PBIcon from '@/common/PBIcon.vue'
import PBLoadingView from '@/popup/components/PBLoadingView.vue'
import PBSettingUpload from './PBSettingUpload.vue'

export default {
  components: { PBToggle, PBIcon, PBSettingUpload, PBLoadingView },
  setup() {
    const toggle = ref(false)
    const scrollDom = ref(null)
    
    const noWork = computed(() => !Object.keys(works.value).length)
    const onToggle = e => {
      toggle.value = !toggle.value
      e.stopPropagation()
    }
    const onClickedAreaCheck = e => {
      if (e.target === e.currentTarget) toggle.value = false
    }

    const inputFile = ref(null)

    const deleteMsgOn = ref(false)

    const openDeleteWindow = () => {
      if (noWork.value) return
      deleteMsgOn.value = true
    }

    const onDeleteAllBookmarkData = () => {
      removeAllWorks()
      deleteMsgOn.value = false
      toggle.value = false
    }

    const curFile = ref(null)
    
    const onClearImport = () => {
      inputFile.value.value = null
      curFile.value = null
    }

    const importComplete = () => {
      onClearImport()
      toggle.value = false
    }

    const onDownload = () => {
      if (noWork.value) return 
      downloadData()
    }

    const onExtraBtnClick = (btnKey, newVal) => {
      if (!settings.extraSideBtn) return

      settingExtraBtn[btnKey] = newVal
    }

    watch(() => toggle.value,
    newToggleVal => {
      visibility.value = newToggleVal ? 1 : 0

      if (newToggleVal) scrollDom.value.scrollTo(0,0)
    })

    watch([
      () => deleteMsgOn.value,
      () => curFile.value,
    ],
    ([newDeleteMsgOn, newCurFile]) => {
      visibility.value = (newDeleteMsgOn || newCurFile) ? 2 : 1 
    })

    return {
      scrollDom, inputFile, noWork,
      deleteMsgOn, openDeleteWindow, onDeleteAllBookmarkData, onDownload,
      curFile, importComplete, onClearImport, onExtraBtnClick,
      toggle, onToggle, onClickedAreaCheck, settings, settingExtraBtn, EXTRA_BUTTON_INFOS,
      downloadInProgress, uploadInProgress, onResetSetting, getTabIndex
    }
  }
}
</script>

<style lang="scss">
.ao3pbs-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  font-size: 15px;
}

.ao3pb-button {
  text-align: center;

  button {
    padding: 5px 10px;
    cursor: pointer;
    background-color: #FFF;

    &:not(:last-child) { margin-right: 10px; }

    &:hover,
    &:focus-visible { filter: brightness(0.8); }
  }
}

.ao3pb-sett {
  pointer-events: none;
  z-index: 3;

  &.open {
    background-color: rgba(#000, 0.65);
    pointer-events: all;
    transition: background-color 0.2s 0.2s;
    
    .ao3pb-sett__content {
      visibility:visible;
      transform: translateX(0);
      transition: transform 0.3s;
    }

    .ao3pb-sett__entry:hover,
    .ao3pb-sett__entry:focus-visible { background-color: rgba(#FFF, 0.8); }
  }

  .ao3pb-sett__entry {
    position: absolute;
    z-index: 1;
    right: 5px;
    top: 5px;
    width: 27px;
    height: 27px;
    border-radius: 50%;
    cursor: pointer;
    pointer-events: all;
    background-color: transparent;

    &::before { display: none; }

    & > * {
      line-height: 21px;
      font-size: 20px;
      color: #666;
    }

    .ao3pb-icon {
      width: 25px;
      height: 25px;
    }

    &:hover,
    &:focus-visible { background-color: rgba(#FFF, 0.1); }
  }

  h1 {
    font-family: Georgia, serif;
    font-size: 24px;
    margin-bottom: 15px;
  }

  .ao3pb-sett__content {
    visibility: hidden;
    position: absolute;
    top: 0;
    right: 0;
    width: 100%;
    max-width: 330px;
    height: 100%;
    background-color: #eee;
    transform: translateX(100%);
    transition: transform 0.3s, visibility 0s 0.3s;
    padding: 15px;
    
    overflow-y: scroll;

    & > div {
      margin-bottom: 40px;

      h2 {
        font-size: 14px;
        font-weight: bold;
        margin-bottom: 10px;
        border-bottom: 1px solid #333;
      }

      p {
        margin-bottom: 10px;
        color: #666;
      }

      .ao3pb-sett__content__item {
        display: flex;
        flex-direction: row-reverse;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 5px;

        .ao3pb-toggle ~ h3 { opacity: 0.3; }
        .ao3pb-toggle.checked ~ h3 { opacity: 1; }

        h3 { font-size: 12px; }

        & > button:not(.ao3pb-toggle) {
          border: 1px solid #777;
          cursor: pointer;
          padding: 5px 8px;
          font-size: 13px;
          color: #FFF;
          background-color: #666;

          &:hover,
          &:focus-visible {
            background-color: #333;
            color: #FFF;
          }
        }

        .ao3pb-tab--custom {
          display: flex;

          button {
            background-color: $ao3_red;
            color: #FFF;
            border-radius: 3px;
            padding: 5px 12px;
            cursor: pointer;
            opacity: 0.3;
            transition: opacity 0.2s;

            &:not(:last-child) { margin-right: 5px; }

            &.checked {
              pointer-events: none;
              opacity: 1;
            }

            &:hover,
            &:focus-visible {
              opacity: 1;
            }

          }
        }
      } // .ao3pb-sett__content__item
      
      .ao3pb-sett__extra-btn {
        opacity: 0.5;
        cursor: not-allowed;
        
        &.enabled {
          opacity: 1;
          cursor: default;

          & > button {
            pointer-events: all;
            
            &:active { opacity: 1; }

            &:hover,
            &:focus-visible {
              filter: grayscale(0);
            }

            &.checked { 
              opacity: 1;
              filter: grayscale(0);

              &:hover,
              &:focus-visible {
                filter: grayscale(0.8);
              }

              &:active { opacity: 0.4; }
            }
          }
        }

        & > button {
          display: inline-block;
          cursor: pointer;
          pointer-events: none;
          padding: 3px 6px;
          font-size: 9px;
          font-weight: bold;
          opacity: 0.4;
          border: 1px solid $btn_blue;
          color: $btn_blue;
          filter: grayscale(1);
          border-radius: 12px;
          margin-bottom: 5px;
          margin-right: 5px;

          & > * { display: inline-block; vertical-align: middle; }

          .ao3pb-icon {
            width: 12px;
            height: 12px;
            padding-right: 2px;
          }
        } // .ao3pb-sett__extra-btn 
      }

      .ao3pb-remarks {
        font-size: 10px;
        font-style: italic;
        color: #777;
        margin-bottom: 10px;
      }

      .ao3pb-sett__reset {
        background-color: #666;
        color: #FFF;
        
        cursor: pointer;
        padding: 6px 10px;
        font-size: 14px;
        margin-top: 20px;

        &:hover,
        &:focus-visible { background-color: #333; }
      }
    } // ao3pb-sett__content > div

    .ao3pb-sett__content__data {
      & > * { margin-bottom: 10px; }

      input[type=file] {
        opacity: 0;
        width: 0;
        height: 0;
        position: absolute;

        & ~ label { display: inline-block;}
        
        &:focus-visible ~ label { box-shadow: 0 0 2px 2px #51a7e8; }
      }

      input[type=file] ~ label,
      button {
        cursor: pointer;
        color: #FFF;
        background-color: #666;
        padding: 5px 8px;
        font-size: 13px;
        line-height: 16px;

        &:hover,
        &:focus-visible {
          &:not(.ao3pb-invalid) { background-color: #333; }
        }

        &.ao3pb-invalid {
          cursor: not-allowed;
          opacity: 0.5;
        }
      }

      button.ao3pb-delete {
        background-color: $red;

        &:hover,
        &:focus-visible {
          &:not(.ao3pb-invalid) { background-color: darken($red, 10%); }
        }
      }
    } // ao3pb-sett__content__data
  } // .ao3pb-sett__content

  .ao3pb-delete-msg {
    background-color: rgba(#000, 0.85);
    padding: 20px;
    justify-content: center;
    font-size: 13px;

    & > * { margin-bottom: 10px; }

    b { color: red; }

    p {
      display: block;
      color: #FFF;
    }

    .ao3pb-delete:hover,
    .ao3pb-delete:focus-visible {
      background-color: $red;
      color: #FFF;
    }
  } // .ao3pb-delete-msg
} // .ao3pb-sett
</style>
