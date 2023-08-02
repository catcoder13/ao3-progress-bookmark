import { ref } from "vue"
import { compressToUTF16  } from 'lz-string'

import { workID, name, authorsObj, oneShot } from "./static"
import { updateSetting, updateSettingExtraBtn } from './setting'
import { PREVIEW_CHAR_LIMIT } from "@/common/const"

import {
  DEFAULT_SETTINGS, DEFAULT_SETTING_EXTRA_BUTTONS,
  STORE_ALL_WORK_KEYS, STORE_BACKUP_PREFIX, STORE_SETTING_EXTRA_BTN_KEY, STORE_SETTING_KEY, STORE_WORK_KEY_PREFIX
} from "@/common/const"
import { chapters } from "./page"

const STORE_WORK_KEY = STORE_WORK_KEY_PREFIX + workID
const STORE_WORK_BACKUP_KEY = STORE_BACKUP_PREFIX + workID

const work = ref(null)
const storeReady = ref(false)

let workIDArr = []
const workIDs = ref(workIDArr)


const initStoreData = () => {
  Promise.all([
    chrome.storage.local.get(STORE_WORK_KEY).then(obj => obj[STORE_WORK_KEY]),
    chrome.storage.local.get(STORE_SETTING_KEY).then(obj => obj[STORE_SETTING_KEY] || {...DEFAULT_SETTINGS}),
    chrome.storage.local.get(STORE_SETTING_EXTRA_BTN_KEY).then(obj => obj[STORE_SETTING_EXTRA_BTN_KEY] || {...DEFAULT_SETTING_EXTRA_BUTTONS}),
    chrome.storage.local.get(STORE_ALL_WORK_KEYS).then(obj => obj[STORE_ALL_WORK_KEYS] || [])
  ]).then(([workObj, settingObj, settingExtraBtnObj, workIDObjArr]) => {

    if (workObj) work.value = workObj

    updateSetting(settingObj)
    
    updateSettingExtraBtn(settingExtraBtnObj)
    
    workIDs.value = workIDObjArr
    workIDArr = workIDObjArr

    storeReady.value = true
  })

  chrome.storage.onChanged.addListener(obj => {
    if (obj[STORE_WORK_KEY]) {
      work.value = obj[STORE_WORK_KEY].newValue
    }

    if (obj[STORE_SETTING_KEY]) {
      const settingObj = obj[STORE_SETTING_KEY].newValue || {...DEFAULT_SETTINGS}
      updateSetting(settingObj)
    }

    if (obj[STORE_SETTING_EXTRA_BTN_KEY]) {
      const settingExtraBtnObj = obj[STORE_SETTING_EXTRA_BTN_KEY].newValue || {...DEFAULT_SETTING_EXTRA_BUTTONS}
      updateSettingExtraBtn(settingExtraBtnObj)
    }

    if (obj[STORE_ALL_WORK_KEYS]) {
      workIDArr = obj[STORE_ALL_WORK_KEYS].newValue || []
      workIDs.value = workIDArr
    }
    
    // console.log(obj)
  })
}
initStoreData()


/**
 * 
 * updateBookmarkStore 
 *  - responsible to create/update a bookmark into the storage.local
 *  - preview page goes through some custom minification + lz compression before saving into storage.local
 */
const updateBookmarkStore = (cI, pct, cID, chT) => {
  if (!workIDArr.some(wID => wID === workID)) workIDArr.push(workID)
  workIDs.value = workIDArr

  const t = Date.now()

  let previewHTML = chapters[cI].dom.innerHTML.replace(/(?<=>)\s+(?=<)/g, '').replace(/<!--[\s\S]*?-->/g, '')
  const compressHTML = compressToUTF16(previewHTML)
  // console.log(previewHTML.length, compressHTML.length)
  
  const cannotPreview = compressHTML.length > PREVIEW_CHAR_LIMIT

  if (!cannotPreview) chrome.storage.local.set({[STORE_WORK_BACKUP_KEY]: compressHTML})
  
  const v = (work.value && work.value.v) != null ? work.value.v : null // consider existing status(v), including work.v === 0

  const workObj = { cI, pct, t, name, v}
  if (authorsObj) workObj.a = authorsObj
  if (oneShot) workObj.os = 1
  if (cannotPreview) workObj.xpv = 1
  if (cID) workObj.cID = cID
  if (chT) workObj.chT = chT

  chrome.storage.local.set({
    [STORE_WORK_KEY]: workObj,
    [STORE_ALL_WORK_KEYS]: workIDArr
  }).catch(err => console.warn('[AO3 PB] Error on updateBookmarkStore', err))
}

const removeBookmarkStore = cb => {
  chrome.storage.local.remove([STORE_WORK_KEY, STORE_WORK_BACKUP_KEY ]).then(() => {
    if (cb) cb()
  }).catch(err => console.warn('[AO3 PB] Error on removeBookmarkStore(remove)', err))
  
  workIDArr = workIDArr.filter(wID => wID !== workID)
  workIDs.value = workIDArr

  chrome.storage.local.set({[STORE_ALL_WORK_KEYS]: workIDArr})
    .catch(err => console.warn('[AO3 PB] Error on removeBookmarkStore(set)', err))
}

export {work, workIDs, storeReady, updateBookmarkStore, removeBookmarkStore}
