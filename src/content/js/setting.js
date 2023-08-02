import { reactive } from 'vue'
import { DEFAULT_SETTINGS, DEFAULT_SETTING_EXTRA_BUTTONS } from '@/common/const'

const settings = reactive({...DEFAULT_SETTINGS})

const settingExtraBtn = reactive({...DEFAULT_SETTING_EXTRA_BUTTONS})

const updateSetting = settingObj => {
  Object.keys(settingObj).forEach(settingProp => {
    settings[settingProp] = settingObj[settingProp]
  })
}

const updateSettingExtraBtn = settingExtraBtnObj => {
  Object.keys(settingExtraBtnObj).forEach(settingProp => {
    settingExtraBtn[settingProp] = settingExtraBtnObj[settingProp]
  })
}

export { settings, updateSetting, settingExtraBtn, updateSettingExtraBtn }
