import { ref } from 'vue'

import { STORE_WORK_KEY_PREFIX, STORE_ALL_WORK_KEYS, STORE_BACKUP_PREFIX } from '@/common/const'

import { works, removeAllWorks } from '@/popup/js/works'

const downloadInProgress = ref(false)
const uploadInProgress = ref(false)

 const importData = obj => {
  uploadInProgress.value = true
  removeAllWorks(() => {
    works.value = obj[STORE_ALL_WORK_KEYS].reduce((acc, workID) => {
      acc[workID] = {...obj[STORE_WORK_KEY_PREFIX + workID], id: workID}
      return acc
    }, {})
    
    /**
     * trigger updating new works
     * native popup's works.value must be updated before this
     */
    chrome.storage.local.set(obj).then(() => uploadInProgress.value = false)
  })
 }
 
const downloadData = () => {
  downloadInProgress.value = true
  Promise.all([
    chrome.storage.local.get(STORE_ALL_WORK_KEYS).then(obj => obj[STORE_ALL_WORK_KEYS] || [])
  ]).then(([workIDs]) => {
    Promise.all([
      ...workIDs.map(workID => chrome.storage.local.get(STORE_WORK_KEY_PREFIX + workID)),
      ...workIDs.map(workID => chrome.storage.local.get(STORE_BACKUP_PREFIX + workID))
    ]).then((objs) => {
      const workObjs = objs.slice(0, workIDs.length)
        .filter(obj => !!obj)
        .reduce((acc, workObj) => {
          const workKey = Object.keys(workObj)[0]
          delete workObj[workKey].lv
          acc[workKey] = workObj[workKey]
          return acc
        }, {})
      
        const workBackupObjs = objs.slice(workIDs.length, objs.length)
          .filter(obj => !!obj)
          .reduce((acc, backupObjs) => {
            const backupKey = Object.keys(backupObjs)[0]
            acc[backupKey] = backupObjs[backupKey]
            return acc
          }, {})
        
      // download obj
      const a = document.createElement('a')

      a.href = URL.createObjectURL(new Blob([JSON.stringify({[STORE_ALL_WORK_KEYS]: workIDs,...workObjs,...workBackupObjs})], { type: 'application/json' }))

      a.download = `ao3pb-${workIDs.length}-bookmark-datas.json`
      
      a.click()
      a.remove()

      downloadInProgress.value = false
    })
  
  })
}

export { importData, downloadData, uploadInProgress, downloadInProgress }
