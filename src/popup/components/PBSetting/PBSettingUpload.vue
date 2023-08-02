<template>
  <div class="ao3pb-sett-upload ao3pbs-overlay">
    <PBLoadingView v-if="fileReadInProgress" desc="Load file data..." />

    <template v-else-if="!summaries.workCount">
      <span>No bookmark data found in this file!</span>
    </template>

    <template v-else-if="summaries.workCount > BOOKMARK_LIMIT">
      <span>Fail to read file: bookmark data exceeds limit<br>
        (Limit: {{ BOOKMARK_LIMIT }}, bookmark data in file: {{ summaries.workCount }})</span>
    </template>
    
    <div v-else class="ao3pb-sett-upload__content">
      <h2>Import summary</h2>
      <span>Total works from file: {{ summaries.workCount }}</span>
      <div class="ao3pb-authors">
        <div tabindex="0">
          <div class="" v-for="(authorWorkCount, authorName) in summaries.authors" :key=authorName>
            <PBIcon type="author" fill="#999" />
            <span>{{ authorName }}: {{ authorWorkCount }} work{{ authorWorkCount > 1 ? 's' : ''}}</span>
          </div>
        </div>
        <b class="ao3pb-remark">Note: All existing bookmarks will be removed before importing above bookmark records!</b>
      </div>
    </div>

    <div class="ao3pb-button">
      <button v-if="summaries.workCount && summaries.workCount <= BOOKMARK_LIMIT" @click="onConfirmImport">Confirm import</button>
      <button @click="onCancel">Cancel</button>
    </div>
  </div>
</template>

<script>
import { onUnmounted, reactive, ref } from 'vue'
import { importData } from '@/popup/js/data'
import { STORE_ALL_WORK_KEYS, STORE_WORK_KEY_PREFIX, BOOKMARK_LIMIT, ANONYMOUS_USER_NAME } from '@/common/const'
import PBIcon from '@/common/PBIcon.vue'
import PBLoadingView from '../PBLoadingView.vue'

export default {
  props: ["file"],
  emits: ['complete', 'cancel'],
  components: { PBIcon, PBLoadingView },
  setup(p, { emit }) {
    const reader = new FileReader()
    const summaries = reactive({ workCount: 0, authors: {} })
    const fileReadInProgress = ref(true)

    let resultObj = {}
    const onFileRead = () => {
      try {
        if (reader.result) {
          resultObj = JSON.parse(reader.result)
          const { [STORE_ALL_WORK_KEYS]: workIDs } = resultObj
          
          summaries.workCount = workIDs.length
          summaries.authors = workIDs.reduce((acc, workID) => {
            const { a } = resultObj[STORE_WORK_KEY_PREFIX + workID]
            if (!a) {
              if (!acc[ANONYMOUS_USER_NAME]) acc[ANONYMOUS_USER_NAME] = 0
              acc[ANONYMOUS_USER_NAME]++
            } else {
              Object.keys(a).forEach(aName => {
                if (!acc[aName]) acc[aName] = 0
                acc[aName]++
              })
            }
            return acc
          }, {})
        }
        
        fileReadInProgress.value = false
      } catch (err) {
        console.warn('[AO3 PB] Error occurs when parsing the imported bookmark data', err)
        fileReadInProgress.value = false
      }
        
    }
    reader.addEventListener("load", onFileRead)
    reader.readAsText(p.file)
    
    onUnmounted(() => {
        reader.removeEventListener("load", onFileRead)
    })

    const onConfirmImport = () => {
      if (!summaries.workCount || summaries.workCount > BOOKMARK_LIMIT) return
      importData(resultObj)
      emit('complete')
    }
    
    const onCancel = () => emit("cancel")


    return { summaries, onConfirmImport, onCancel, fileReadInProgress, BOOKMARK_LIMIT }
  }
}
</script>

<style lang="scss">
.ao3pb-sett-upload {
  padding: 20px;
  background-color: rgba(#000, 0.85);
  color: #FFF;
  justify-content: center;
  text-align: center;

  span {
    font-size: 13px;
    line-height: 1.2;
    word-wrap: break-word;
  }

  & > *:not(:last-child) { margin-bottom: 10px; }

  .ao3pb-sett-upload__content {
    text-align: left;

    & > *:not(:last-child) { margin-bottom: 10px; }
    
    .ao3pb-authors {
      &:focus-visible {
        box-shadow: 0 0 2px 2px #51a7e8;
        outline: none;
      }

      & > div {
        max-height: 110px;
        overflow-y: auto;
        background-color: #333;
      }

      b {
        font-size: 11px;
        color: red;
      }

      & > div > div:not(:last-child) { // author scroll content
        padding-bottom: 3px;
      }
    }
  } // .ao3pb-sett-upload__content
}
</style>
