const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: false,
  productionSourceMap: false,
  filenameHashing: false,
  css: {
    loaderOptions: {
      sass: {
        additionalData: `
          @import "@/common/__variables.scss";
        `
      }
    }
  },
  pages: {
    popup: {
      entry: 'src/popup/popup.js',
      template: 'public/popup.html',
      chunks: ['chunk-vendors', 'chunk-common', 'popup']
    },
    content: {
      entry: 'src/content/content.js',
      template: 'public/content.html',
      chunks: ['chunk-vendors', 'chunk-common', 'content']
    },
    preview: {
      title: 'AO3 Progress Bookmark - Preview',
      entry: 'src/preview/preview.js',
      template: 'public/preview.html',
      chunks: ['chunk-vendors', 'chunk-common', 'preview']
    }
  }
})
