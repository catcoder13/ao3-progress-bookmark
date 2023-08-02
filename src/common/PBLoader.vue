<template>
  <div class="ao3pb-loader" :style="{width: `${size}px`, height: `${size}px`}">
    <span :style="{borderWidth: `${width}px`}"></span>
  </div>
</template>

<script>
export default {
  props: {
    size: { default: 30 },
    width: { default: 5 },
  }
}
</script>

<style lang="scss">
.ao3pb-loader {
  position: relative;
  padding: 0;

  & > * {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
  & > span {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    border: 4px solid rgba(#FFF, 0.2);
    border-top-color: rgba(#FFF, 0.8);
    animation: spin 1s ease-in-out infinite;
  }
}

@keyframes spin {
  to { transform: translate(-50%, -50%) rotate(360deg); }
}
</style>
