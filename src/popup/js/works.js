import { ref } from 'vue'
import { STORE_WORK_KEY_PREFIX, STORE_ALL_WORK_KEYS, AO3_DOMAIN, STORE_BACKUP_PREFIX } from '@/common/const'
import { settingsPU } from './setting'

// const works = reactive({})
const works = ref({})

/**
 * fetchSyncData
 *  only called once on popup loaded
 */
const fetchSyncData = cb => {
  chrome.storage.local.get(STORE_ALL_WORK_KEYS)
    .then(obj => obj[STORE_ALL_WORK_KEYS])
    .then(workIDs => {
      if (!workIDs) return

      Promise.all(
        workIDs.map(workID => chrome.storage.local.get(STORE_WORK_KEY_PREFIX + workID))
      ).then(workObjs => {
        works.value = workObjs.reduce((acc, workObj) => {
          const workKey = Object.keys(workObj)[0]
          const workID = workKey.split(STORE_WORK_KEY_PREFIX)[1]
          const work = workObj[workKey]
          delete work.lv
          if (workObj) acc[workID] = {...work, id: workID}
          else console.warn('[AO3 PB]', workID, 'exist in array but bm item does not exist')
          
          return acc
        }, {})

        if (cb) cb()

      }).catch(err => console.warn(`[AO3 PB] Error occur on fetching works`, err))
  }).catch(err => console.warn('[AO3 PB] Error occur on fetching all work IDs', err))
}

fetchSyncData()

/**
 * Native popup must update works.value before calling chrome.storage.set to prevent double works triggerred by onChanged
 */
chrome.storage.onChanged.addListener(obj => {
  const existingWorkKeys = Object.keys(works.value)

  /**
   * handle updated/removed work
   * should only influence ao3 work page and non native popup display
   */
    existingWorkKeys
      .filter(key => obj[STORE_WORK_KEY_PREFIX + key])
      .forEach(key => {
        const newWork = obj[STORE_WORK_KEY_PREFIX + key].newValue
        if (newWork) works.value[key] = {...newWork, id: key} // this is changed work
        else {
          delete works.value[key] // this is a removed work
        }
      })
  

  /**
   * handle new added work
   * should only influence ao3 work page and non native popup display
   */
  if (obj[STORE_ALL_WORK_KEYS]) {
    const workIDArr = obj[STORE_ALL_WORK_KEYS].newValue || []
    
    workIDArr
      .filter(key => !existingWorkKeys.includes(key))
      .forEach(key => {
        chrome.storage.local.get(STORE_WORK_KEY_PREFIX + key).then(workObj => {
          const work = workObj[STORE_WORK_KEY_PREFIX + key]
          works.value[key] = {...work, id: key}
        })
      })
  }
  
  // console.log(obj)
})

const removeWork = workID => {
  delete works.value[workID] // update native popup works.value

  // remove bookmark record and preview from store
  chrome.storage.local.remove([ STORE_WORK_KEY_PREFIX + workID, STORE_BACKUP_PREFIX + workID])

  // Update workIDs record from store
  chrome.storage.local.get(STORE_ALL_WORK_KEYS).then(obj => {
    const workIDs = obj[STORE_ALL_WORK_KEYS] || []
    chrome.storage.local.set({ [STORE_ALL_WORK_KEYS]: workIDs.filter(wID => wID !== workID) })
  }).catch(err => console.warn('[AO3 PB] Error occur on fetching all work IDs', err))
}

const removeAllWorks = cb => {
  chrome.storage.local.get(STORE_ALL_WORK_KEYS).then(obj => {
    // Restrieve latest workIDs recrod from store
    const workIDs = obj[STORE_ALL_WORK_KEYS] || []

    works.value = {} // update native popup works.value

    //Remove workIDs, all work records, all work previews from store
    chrome.storage.local.remove([
      STORE_ALL_WORK_KEYS,
      ...workIDs.map(workID => STORE_WORK_KEY_PREFIX + workID),
      ...workIDs.map(workID => STORE_BACKUP_PREFIX + workID)
    ]).then(() => {
      if (cb) cb()
    })
    
  }).catch(err => console.warn('[AO3 PB] Error occur on fetching all work IDs', err))
}

const updateWorkView = (workID, v) => {
  if (settingsPU.view === -2) {
    if (v !== null) works.value[workID].lv = 'x'
    else works.value[workID].lv = null
  } else if (settingsPU.view >= 0) {
    if (v === settingsPU.view) works.value[workID].lv = null
    else works.value[workID].lv = settingsPU.view
  }
  
  works.value[workID].v = v
  
  chrome.storage.local.set({[STORE_WORK_KEY_PREFIX + workID]: works.value[workID]}).catch(err => {
    console.warn('[AO3 PB] Error during updating work view', err)
  })
}

const visitURL = subURL => {
  chrome.tabs.create({ url: AO3_DOMAIN + subURL }, () => {
    window.close()
  })
}

export {works, removeWork, removeAllWorks, updateWorkView, visitURL, fetchSyncData}
