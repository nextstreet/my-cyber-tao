<template>
  <div id="app">
    <!-- Onboarding — only on first visit, layered above all routes -->
    <OnboardingScreen v-if="showOnboarding" @done="showOnboarding = false" />
    <RouterView />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import OnboardingScreen from '@/components/OnboardingScreen.vue'
import { useGuardians } from '@/composables/useGuardians'

const showOnboarding = ref(!localStorage.getItem('ct_onboarded_v1'))
const { init } = useGuardians()

onMounted(() => {
  // Init guardian URLs immediately on app load.
  // getPublicUrl() is a local computation (no network round-trip),
  // so this completes synchronously in < 1ms.
  init()
})
</script>
