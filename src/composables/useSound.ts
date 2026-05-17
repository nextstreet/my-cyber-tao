import { ref } from 'vue'

let ac: AudioContext | null = null

function getAC(): AudioContext {
  if (!ac || ac.state === 'closed') {
    ac = new (window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (ac.state === 'suspended') ac.resume()
  return ac
}

function playTone(freq: number, type: OscillatorType, gainPeak: number, decay: number, delay = 0) {
  setTimeout(() => {
    try {
      const ctx = getAC()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = type
      osc.frequency.value = freq
      gain.gain.setValueAtTime(gainPeak, ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + decay)
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.start()
      osc.stop(ctx.currentTime + decay)
    } catch (_) { /* AudioContext may be unavailable in some contexts */ }
  }, delay)
}

export function useSound() {
  const enabled = ref(true)

  function coinClang() {
    if (!enabled.value) return
    // Three coins with slight timing offsets
    ;[0, 80, 160].forEach((delay, i) => {
      playTone(900 + i * 70 + Math.random() * 100, 'triangle', 0.3, 0.22, delay)
    })
    if (navigator.vibrate) navigator.vibrate([20, 40, 20])
  }

  function bellRing() {
    if (!enabled.value) return
    playTone(528, 'sine', 0.4, 1.8)
    playTone(1056, 'sine', 0.15, 1.2)
  }

  function hexagramReveal() {
    if (!enabled.value) return
    // Ascending tones as lines draw
    const notes = [220, 247, 277, 311, 349, 392]
    notes.forEach((freq, i) => {
      playTone(freq, 'sine', 0.18, 0.6, i * 350)
    })
  }

  function sealChime() {
    if (!enabled.value) return
    // Deep resonant strike
    playTone(160, 'sine', 0.5, 2.5)
    playTone(240, 'sine', 0.2, 1.8, 80)
    playTone(320, 'triangle', 0.15, 1.2, 160)
    if (navigator.vibrate) navigator.vibrate([40, 30, 80])
  }

  return { coinClang, bellRing, hexagramReveal, sealChime, enabled }
}
