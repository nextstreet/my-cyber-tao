<template>
  <div
    class="w-56 h-3 my-1.5 flex justify-between items-center transition-all duration-700 ease-out"
    :class="animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'"
  >
    <!-- 阳爻 (实线) -->
    <div
      v-if="isYang"
      class="w-full h-full rounded-sm relative overflow-hidden"
      style="background: #c8aa6e; box-shadow: 0 0 12px rgba(200,170,110,0.6), 0 0 24px rgba(200,170,110,0.25);"
    >
      <div class="absolute inset-0 yang-shine"></div>
    </div>

    <!-- 阴爻 (断线) -->
    <template v-else>
      <div class="w-[43%] h-full rounded-sm relative overflow-hidden"
           style="background: #c8aa6e; box-shadow: 0 0 12px rgba(200,170,110,0.6), 0 0 24px rgba(200,170,110,0.25);">
        <div class="absolute inset-0 yang-shine"></div>
      </div>
      <div class="w-[43%] h-full rounded-sm relative overflow-hidden"
           style="background: #c8aa6e; box-shadow: 0 0 12px rgba(200,170,110,0.6), 0 0 24px rgba(200,170,110,0.25);">
        <div class="absolute inset-0 yang-shine"></div>
      </div>
    </template>
  </div>
</template>

<script setup>
defineProps({
  isYang: Boolean,
  animate: Boolean,
})
</script>

<style scoped>
@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(200%); }
}
.yang-shine {
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
  animation: shine 2.5s ease-in-out infinite;
}
</style>
