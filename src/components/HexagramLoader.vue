<template>
  <div class="hex-loader">
    <svg viewBox="0 0 60 84" width="48" height="67" class="loader-svg">
      <g v-for="i in 6" :key="i" :transform="`translate(0, ${(i-1) * 14})`">
        <line class="loader-line"
          :style="{ animationDelay: `${(6-i) * 0.18}s` }"
          x1="0" y1="7" x2="60" y2="7"
          stroke="rgba(180,140,255,0.8)"
          stroke-width="3"
          stroke-linecap="round"
        />
      </g>
    </svg>
  </div>
</template>

<style scoped>
.hex-loader { display: flex; align-items: center; justify-content: center; }
.loader-svg { filter: drop-shadow(0 0 8px rgba(140, 80, 255, 0.5)); }

.loader-line {
  transform-origin: center;
  animation: linePulse 1.2s ease-in-out infinite alternate;
  opacity: 0.3;
}
@keyframes linePulse {
  0%   { opacity: 0.15; stroke-width: 2; }
  100% { opacity: 1;    stroke-width: 3.5; }
}
</style>
