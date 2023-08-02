import { reactive, watch } from "vue"
import {
  STORE_SETTING_KEY, STORE_SETTING_EXTRA_BTN_KEY, STORE_SETTING_PU_KEY,
  DEFAULT_SETTINGS, DEFAULT_SETTING_EXTRA_BUTTONS, DEFAULT_SETTING_PU, DEFAULT_SETTING_PU_UI, STORE_SETTING_PU_UI_KEY
} from "@/common/const"

/**
 * settings
 * - influent both content and popup
 * - should be read-only when accessed by content
 */
const settings = reactive({...DEFAULT_SETTINGS})
/**
 * settingExtraBtn
 * - should be read-only when accessed by popup
 */
const settingExtraBtn = reactive({...DEFAULT_SETTING_EXTRA_BUTTONS})

/**
 * settingsPU
 * - influence popup listing item
 */
const settingsPU = reactive({...DEFAULT_SETTING_PU}) // focus on item sorting
/**
 * settingsPU
 * - influence style change
 * - must not trigger item sorting
 */
const settingsPUUI = reactive({...DEFAULT_SETTING_PU_UI}) // focus on item appearance, update of settingsPUUI must not influence sorting result

const onResetSetting = () => {
  // below will trigger chrome.storage.local.set of settings
  Object.keys(DEFAULT_SETTINGS).forEach(setKey => settings[setKey] = DEFAULT_SETTINGS[setKey])
  Object.keys(DEFAULT_SETTING_EXTRA_BUTTONS).forEach(setKey => settingExtraBtn[setKey] = DEFAULT_SETTING_EXTRA_BUTTONS[setKey])
}

Promise.all([
  chrome.storage.local.get(STORE_SETTING_KEY).then(obj => obj[STORE_SETTING_KEY]),
  chrome.storage.local.get(STORE_SETTING_EXTRA_BTN_KEY).then(obj => obj[STORE_SETTING_EXTRA_BTN_KEY]),
  chrome.storage.local.get(STORE_SETTING_PU_KEY).then(obj => obj[STORE_SETTING_PU_KEY]),
  chrome.storage.local.get(STORE_SETTING_PU_UI_KEY).then(obj => obj[STORE_SETTING_PU_UI_KEY])
]).then(([settingObj, extraBtnObj, settingPopupObj, settingPopupUIObj]) => {
  if (settingObj) {
    Object.keys(settingObj).forEach(setKey => settings[setKey] = settingObj[setKey])
  }

  if (extraBtnObj) {
    Object.keys(extraBtnObj).forEach(setKey => settingExtraBtn[setKey] = extraBtnObj[setKey])
  }

  if (settingPopupObj) {
    Object.keys(settingPopupObj).forEach(setKey => settingsPU[setKey] = settingPopupObj[setKey])
  }

  if (settingPopupUIObj) {
    Object.keys(settingPopupUIObj).forEach(setKey => settingsPUUI[setKey] = settingPopupUIObj[setKey])
  }

  // initialise setting watch only after setting values are initialised
  watch(() => settingExtraBtn,
  () => {
    chrome.storage.local.set({ [STORE_SETTING_EXTRA_BTN_KEY]: settingExtraBtn})
  }
  , {deep: true})

  watch(() => settings,
  () => {
    chrome.storage.local.set({ [STORE_SETTING_KEY]: settings})
  }, {deep: true})

  watch(() => settingsPU,
  () => {
    chrome.storage.local.set({ [STORE_SETTING_PU_KEY]: settingsPU})
  }, {deep: true})

  watch(() => settingsPUUI,
  () => {
    chrome.storage.local.set({ [STORE_SETTING_PU_UI_KEY]: settingsPUUI})
  }, {deep: true})
})

chrome.storage.onChanged.addListener(obj => {
  // handle popup setting changes
  if (obj[STORE_SETTING_PU_KEY]) {
    const newPUSettings = obj[STORE_SETTING_PU_KEY].newValue || {...DEFAULT_SETTING_PU}
    Object.keys(newPUSettings).forEach(key => {
      settingsPU[key] = newPUSettings[key]
    })
  }

  // handle popup appear setting changes
  if (obj[STORE_SETTING_PU_UI_KEY]) {
    const newPUUISettings = obj[STORE_SETTING_PU_UI_KEY].newValue || {...DEFAULT_SETTING_PU_UI}
    Object.keys(newPUUISettings).forEach(key => {
      settingsPUUI[key] = newPUUISettings[key]
    })
  }
})



export { settings, settingExtraBtn, settingsPU, settingsPUUI, onResetSetting }
