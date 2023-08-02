/**
 * static.js
 *  - retrieves page's dom element references
 *  - determine if an ao3 page is a work page (via mainContent) + manifest.json's matches/exclude_matches lists
 */

/**
 * dom: mainContent
 *  - the only dom element that determines if a work page is a valid work page
 *  - retrieve one-shot title, one-shot chapter section
 * example of invalid work page: https:/[ao3 domain]/works/xxxxx that is a pre warning page and not a work page that has mainContent
 */
const mainContent = document.getElementById('workskin')
if (!mainContent) console.warn('[AO3 PB] URL matches a work page, however #worksin does not exist, thus it is deemed not a work page.')


/**
 * dom: chapterDoms
 *  - multiple chapter dom reference (if exists)
 * 
 * isEntireWork
 *  - although a page with param "view_full_work=true" is an Entire Work page's url format,
 *  - "view_full_work=true" can also be added manually to a one-shot page while the page is not Entire Work,
 *    and multi-chapter page with only one chapter available will not have Entire Work button available anyway
 *    (multi-chapter page with only one chapter will always be displayed in Chapter by chapter fashion regardless the present of view_full_work=true)
 *  - therefore, isEntireWork will be determine whether there exists more than one chapter dom in a single page
 */
const chapterDoms = mainContent ? mainContent.querySelectorAll('#chapters > .chapter') : []
const isEntireWork = chapterDoms.length > 1

/**
 * oneShot
 *  - determine is a work is multi-chapter or one-shot
 *  - if one-shot page is loaded as a single chapter page, access chStat dom to determine if it is a one-shot page
 */
let oneShot = chapterDoms.length === 0
const chStat = document.querySelector('dd.chapters')
if (chStat && chStat.innerHTML === '1/1') oneShot = true


/**
 * name, author's name and url if any 
 *  - retrieve basic info from dom
 */
const name = mainContent && mainContent.querySelector('.title').innerText.trim()
let authorsObj = null

if (mainContent) {
  const authorByline = mainContent.querySelector('.byline')
  const authorElem = authorByline.querySelectorAll('a[rel=author]')
  if (authorElem.length) {
    authorsObj = [...authorElem].reduce((acc, aItem) => {
      acc[aItem.innerText] = aItem.getAttribute('href')
      return acc
    } , {})
  }
}

/**
 * jumpToBMOnLoad
 *  - check if jump to bookmark on load is needed
 *  - focus on ao3 work url with param "ao3pbjump"
 *  - modify history.scrollRestoration to allow page jump programmatically on load
 */
const jumpToBMOnLoad = !!(window.location.href).match(/ao3pbjump/)
if (jumpToBMOnLoad && history.scrollRestoration) history.scrollRestoration = 'manual'


/**
 * workID
 *  - retrieve workID from url(one-shot) or mainContent(multi-chapter)
 */
let workID = null
const match1 = (window.location.href).match(/chapters\/(\d+)/)
const match2 = (window.location.href).match(/\/works\/(\d+)/)

if (match1) { // pattern: https://archiveofourown.org/chapters/xxxxxxxxx
  workID = mainContent && mainContent.querySelector('.title a').getAttribute('href').match(/\/works\/(\d+)/)[1]
} else if (match2) { // pattern: https://archiveofourown.org/works/xxxxxxxxx/...
  workID = match2[1]
} else {
  console.warn('url not match, workID not found')
}

// console.log(isEntireWork, jumpToBMOnLoad, workID, name, authorsObj)

/**
 * chapterInfos
 *  - retrieve chapter title text(if any) and chapter id
 */
const chapterListElem = document.getElementById('selected_id')
let chapterInfos = null 
if (chapterListElem) { // if chapter dropdown exist(Chapter by chapter page)
  chapterInfos = Array.from(chapterListElem.querySelectorAll('option')).map((optElem,i) => {
    const title = optElem.innerText.match(/(?:\d+\. )?(.+)/)[1]
    
    return {
      cID: optElem.getAttribute('value'),
      title: title !== `Chapter ${i+1}` ? title : null
    }
  })
} else if (!oneShot) {
  chapterInfos = Array.from(chapterDoms).map(chDom => {
    const matches = (/^Chapter \d+(?:: (.*))?$/).exec(chDom.querySelector('.title').innerText)
    const title = matches[1] || matches[0]
    return {
      cID: chDom.querySelector('.title a').getAttribute('href').match(/\/works\/\d+\/chapters\/(\d+)/)[1],
      title: title !== chDom.querySelector('.title a').innerText ? title : null
    }
  })
} else {
  // one shot does not have chapter id
  chapterInfos = [{ cID: null, title: null }]
}

export {
  workID, name, authorsObj,
  oneShot, isEntireWork, jumpToBMOnLoad,
  mainContent, chapterDoms, chapterInfos
}
