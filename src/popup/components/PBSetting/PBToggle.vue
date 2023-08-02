<template>
  <button class="ao3pb-toggle" :class="{checked: modelValue}" @click="$emit('update:modelValue', !modelValue)"></button>
</template>

<script>
export default {
  props: ['modelValue'],
  emits: ['update:modelValue']
}
</script>

<style lang="scss">
button.ao3pb-toggle {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 17px;
  cursor: pointer;

  background-color: #FFF;
  border-radius: 15px;
  border: 1px solid #999;
  
  opacity: 0.7;

  &:hover,
  &:focus-visible { opacity: 1; }

  &.checked::before {
    left: 100%;
    transform: translate(calc(-100% - 2px), -50%);
    background-color: $green;
  }

  &::before {
    content: '';
    display: block;
    width: 13px;
    height: 13px;
    position: absolute;
    top: 50%;
    left: 2px;
    transform: translate(0, -50%);
    background-color: #888;
    border-radius: 50%;
    transition: left 0.2s, transform 0.2s;
  }
}
</style>
