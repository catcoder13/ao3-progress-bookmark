<template>
  <base :href="AO3_DOMAIN + '/'" />
  <div v-if="loading" class="ao3pb-pv__loader">
    <PBLoader :size="50" :width="5" />
  </div>
  <div v-else class="ao3pb-pv">
    <div class="ao3pb-pv__remarks">
      <template v-if="previewHTML">
        <h1>This is a preview page</h1>
        <p>
          This page serves as a backup of <b>{{ work.name }}<span v-if="!work.os"> (Chapter {{ parseInt(work.cI) + 1 }})</span></b>
          content, capturing it as it existed at the time when its bookmark was created or updated.
        </p>
        <a :href="pageLink">Read this {{ work.os ? 'One-shot' : 'Chapter' }} on AO3</a>
        <a v-if="!work.os" :href="`/works/${workID}?view_full_work=true`">Entire work on AO3</a>
      </template>
      <template v-else>No backup available for this work.</template>
    </div>

    <template v-if="previewHTML">
      <div class="ao3pb-pv___preface preface">
        <h2 class="title">{{ work.name }}</h2>
        <h3 class="byline">
          <a v-for="({name, href}, i) in authors" :key="i" :href="href">{{ name }}</a></h3>
      </div>
      <div v-html="previewHTML"></div>

      <div class="ao3pb-pv__remarks">
        <p>End of preview.</p>
        <a :href="pageLink">Read this {{ work.os ? 'One-shot' : 'Chapter' }} on AO3</a>
        <a v-if="!work.os" :href="`/works/${workID}?view_full_work=true`">Entire work on AO3</a>
      </div>
    </template>
    
  </div>
</template>

<script>
import { ref, computed } from 'vue'
import { decompressFromUTF16 } from 'lz-string'

import { STORE_WORK_KEY_PREFIX, STORE_BACKUP_PREFIX, AO3_DOMAIN, ANONYMOUS_USER_NAME } from '@/common/const'

import PBLoader from '@/common/PBLoader.vue'

export default {
  components: { PBLoader },
  setup() {
    const loading = ref(true)
    const urlParams = new URL(window.location.href).searchParams
    const workID = urlParams.get('workid')
    // console.log('work id', workID)
    if (!workID) throw 'err-noid'
    
    const previewHTML = ref('')
    
    const work = ref({})

    const backupKey = STORE_BACKUP_PREFIX + workID
    const workKey = STORE_WORK_KEY_PREFIX + workID

    Promise.all([
      chrome.storage.local.get(backupKey).then(obj => obj[backupKey]),
      chrome.storage.local.get(workKey).then(obj => obj[workKey])
    ]).then(([previewHTMLStr, workObj]) => {
      try {
        if (!workObj) throw 'err-id'
        if (!previewHTMLStr) throw 'err-preview'

        work.value = workObj

        const workLink = `${AO3_DOMAIN}/works/${workID}` + (work.value.os ? '' : `/chapters/${work.value.cID}`)

        const decomHTML = decompressFromUTF16(previewHTMLStr)
        if (!decomHTML) throw 'err-decom'

        previewHTML.value = decomHTML.replace(/href="#(.*?)"/g, `href="${workLink}#$1"`)

        loading.value = false

      } catch (err) {
        switch (err) {
          case 'err-noid':
            console.warn(`[AO3 PB] no workID provided`)
            break
          case 'err-id':
            console.warn(`[AO3 PB] Record ${workID} does not exist`)
            break
          case 'err-preview':
            console.warn(`[AO3 PB] Preview for ${workID} does not exist`)
            break
          case 'err-decom':
            console.warn('[AO3 PB] Error occurs when parse decompressed page content')
            break
          default:
            console.warn('[AO3 PB] Error:', err)
            break
        }
        
        loading.value = false
      }
      
    })
    const authors = computed(() => {
      if (!work.value.a) return [{name: ANONYMOUS_USER_NAME, href: null}]

      return Object.keys(work.value.a).map(aName => ({name: aName, href: work.value.a[aName]}))
    })
    // const authorLink = computed(() => work.value.aURL ? `${AO3_DOMAIN}/${work.value.aURL}` : null)

    const pageLink = computed(() => {
      if (work.value.os) return `/works/${workID}`

      return `works/${workID}/chapters/${work.value.cID}/#chapter-${parseInt(work.value.cI) + 1}`
    })

    return { loading, previewHTML, pageLink, workID, work, authors, AO3_DOMAIN }
  }
}
</script>

<style lang="scss">
.ao3pb-pv__loader {
  position: fixed;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-color: rgba(#000, 0.2);

  & > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}


body {
  font-size: 100%;
  font: 100%/1.125 'Lucida Grande','Lucida Sans Unicode','GNU Unifont',Verdana,Helvetica,sans-serif;
  line-height: 1.5;
  color: #2a2a2a;

  & > div {
    @media only screen and (max-width: 42em), handheld {
      font-size: 0.875em;
    }
  }
}

.ao3pb-pv {
  font-size: 0.945em; // #main 0.875em -> #workskin 1.08em
  padding: 0.5em 2.5em 3.5em;
  max-width: 72em;
  margin: 0 auto;
  background-color: #fafafa;  
  word-wrap: break-word;

  @media only screen and (max-width: 62em), handheld {
    padding-left: 3.5%;
    padding-right: 3.5%;
  }

  .ao3pb-pv__remarks {
    margin: 1.5em 3em;
    padding: 35px;
    background-color: #ccc;

    h1 { font-size: 20px; }

    h3 { margin-bottom: 0; }

    p { margin-top: 0; }

    a {
      display: inline-block;
      margin-right: 5px;
      margin-bottom: 5px;
      user-select: none;
      color: #444;
      font-size: 100%;
      padding: 0.25em 0.75em;
      white-space: nowrap;
      text-decoration: none;
      border: 1px solid #bbb;
      border-bottom: 1px solid #aaa;
      background-image: linear-gradient(#fff 2%,#ddd 95%,#bbb 100%);
      border-radius: 0.25em;

      &:hover,
      &:focus-visible {
        color: #900;
        border-top: 1px solid #999;
        border-left: 1px solid #999;
        box-shadow: inset 2px 2px 2px #bbb;
      }

      &:active {
        color: #111;
        background: #ccc;
        border-color: #fff;
        box-shadow: inset 1px 1px 3px #333;
      }
    }
  } // ao3pb-pv__remarks

  .ao3pb-pv___preface {
    a[href] {
      border: none;

      &:hover { border-bottom: none; }

      &:not(:last-child)::after {
        content: ',';
        display: inline;
        margin-right: 4px;
      }
    }
  }

  ul.chapter.actions,
  .landmark {
    display: none;
  }
  
  .AO3E { display: none; }

  a {
    color: #111;
    text-decoration: none;
    border-bottom: 1px solid;
    cursor: pointer;

    &:visited { color: #666; }

    &:hover {
      color: #111;
      border-bottom: 1px solid;
    }

    &:not([href]) {
      border-bottom: none;
      cursor: default;
    }
  }

  img {
    max-width: 100%;
    height: auto;
  }

  h1, h2, h3, h4, h5, h6, .heading {
    font-family: Georgia,serif;
    font-weight: 400;
    word-wrap: break-word;
  }

  .preface {
    margin: 1.5em 3em;
    padding: 0.643em 0.643em 0;
    border-top: 1px solid;

    h2,
    h3 {
      font-size: 1.286em;
    }

    h2 {
      font-size: 2.143em;
      
      margin: 0.429em 0;
    }

    h3 {
      margin: 0.5375em 0;
    }

    h4 {
      font-size: 1.143em;
      line-height: 1.125;
      margin: 0.5375em 0;
    }

    .title,
    .byline {
      text-align: center;

      a[href] {
        color: #111;

        &:visited {
          color: #666;
          &:hover { color: #111; }
        }

        &:hover {
          color: #666;
        }
      }
    }

    .summary {
      h3 { border-bottom: 1px solid; }
    }

    .notes {
      padding: 0 0 0.643em;

      h3 { border-bottom: 1px solid; }

      blockquote {
        margin: 0.643em;

        p { margin: 1.286em auto; }
      }
    }
  } // preface

  .userstuff {
    p { margin: 20px 0; }

    hr {
      width: 35%;
      margin: 0.875em auto 1.2525em auto;
      border: 1px solid;
    }
  }
} // .ao3pb-pv
</style>
