<template>
  <div
    class="w-64 h-4 my-2 flex justify-between items-center transition-all duration-700 ease-out transform"
    :class="animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
  >
    <div
      v-if="isYang"
      class="w-full h-full bg-tao-gold shadow-[0_0_10px_rgba(200,170,110,0.5)]"
    ></div>

    <template v-else>
      <div class="w-[42%] h-full bg-tao-gold shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
      <div class="w-[42%] h-full bg-tao-gold shadow-[0_0_10px_rgba(200,170,110,0.5)]"></div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  isYang: Boolean,
  animate: Boolean,
})
</script>
