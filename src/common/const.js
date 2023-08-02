import { onScroll } from "@/content/js/scroll"

const STORE_SETTING_KEY = 'APBSETS' // setting key
const STORE_SETTING_EXTRA_BTN_KEY = 'APBSET_EXTRA_BTN' // side button setting key
const STORE_SETTING_PU_KEY = 'APBSETP' // popup setting key
const STORE_SETTING_PU_UI_KEY = 'APBSETPUI' // popup ui setting key

const STORE_BACKUP_PREFIX = 'APBX'

const STORE_WORK_KEY_PREFIX = `APB`
const STORE_ALL_WORK_KEYS = `APBWKEYS`

const AO3_DOMAIN = "https://archiveofourown.org"

const ANONYMOUS_USER_NAME = '[Anonymous user]'

const BOOKMARK_LIMIT = 1000
const PREVIEW_CHAR_LIMIT = 102000 

const DEFAULT_SETTINGS = {
  progressBar: false,
  extraSideBtn: false,
  extraSideBtnMode: 0,
  alignRight: true
}

const DEFAULT_SETTING_EXTRA_BUTTONS = {
  backToTop: true,
  firstCh: false,
  prevCh: false,
  nextCh: false,
  latestCh: true,
  comment: true
}

const SORT_BY = [
  {i:0, label: 'Recent bookmark', val: 't', symbol: '&#x1F550;'},
  {i:1, label: 'Progress', val: 'pct', icon: 'location'},
  {i:2, label: 'Title', val: 'name'}
]

const DESCENDS = [true, true, false]

const CUSTOM_VIEW = [0, 1, 2]
const CUSTOM_VIEW_STR = ['Unread', 'Reading', 'Complete']

const DEFAULT_SETTING_PU = {
  sortBy: SORT_BY[0],
  descends: DESCENDS,
  view: -1
}

const DEFAULT_SETTING_PU_UI = {
  compact: 0
}

const EXTRA_BUTTON_INFOS = {
  backToTop: {label: 'Top', eventKey: 'backToTop', iconProps: { type: 'top'}, cICode: -3, onClick: onScroll},
  firstCh: {label: 'First chapter', eventKey: 'jumpToFirstChapter', iconProps: {type: 'next-last', open: false}, checkIfExternal: true, cICode: -2},
  prevCh: {label: 'Previous chapter', eventKey: 'jumpToPreviousChapter', iconProps: {type: 'next', open: false}, checkIfExternal: true, cICode: -1},
  nextCh: {label: 'Next chapter', eventKey: 'jumpToNextChapter', iconProps: {type: 'next', open: true}, checkIfExternal: true, cICode: 1},
  latestCh: {label: 'Latest chapter', eventKey: 'jumpToLastChapter', iconProps: {type: 'next-last', open: true}, checkIfExternal: true, cICode: 2},
  comment: {label: 'Comment section', eventKey: 'onJumpToComment', iconProps: {type: 'speech'}, cICode: 3, onClick: () => {
    const commentBtnElem = document.querySelector('#show_comments_link a')
    if (commentBtnElem && commentBtnElem.innerText.indexOf('Hide') === -1) commentBtnElem.click()
  }}
}


export {
  STORE_WORK_KEY_PREFIX, STORE_ALL_WORK_KEYS,
  DEFAULT_SETTINGS, DEFAULT_SETTING_EXTRA_BUTTONS, DEFAULT_SETTING_PU, DEFAULT_SETTING_PU_UI, STORE_BACKUP_PREFIX,
  STORE_SETTING_KEY, STORE_SETTING_EXTRA_BTN_KEY, STORE_SETTING_PU_KEY, STORE_SETTING_PU_UI_KEY,
  EXTRA_BUTTON_INFOS, SORT_BY, DESCENDS,
  AO3_DOMAIN, BOOKMARK_LIMIT, PREVIEW_CHAR_LIMIT,
  ANONYMOUS_USER_NAME, CUSTOM_VIEW, CUSTOM_VIEW_STR
}