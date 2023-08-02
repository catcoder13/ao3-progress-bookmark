<template>
  <div class="ao3pb-loading ao3pbs-overlay">
    <div class="ao3pbs-ctr">
      <p v-if="title" >{{title}}</p>
      <PBLoader />
      <span v-if="desc">{{desc}}</span>
    </div>
  </div>
</template>

<script>
import PBLoader from '@/common/PBLoader.vue'

export default {
  props: ['title', 'desc'],
  components: { PBLoader }
}
</script>

<style lang="scss">
.ao3pb-loading {
  background-color: rgba(#000, 0.9);
  z-index: 999;
  user-select: none;
  text-align: center;

  & > * {
    width: 100%;
    
    padding: 20px;
    
    p {
      font-size: 16px;
      color: #FFF;
    }

    span {
      font-size: 12px;
      color: #aaa;
    }
  }

  .ao3pb-loader { margin: 20px auto; }
}
</style>