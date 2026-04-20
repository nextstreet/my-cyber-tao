export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  let startX = 0
  const THRESHOLD = 50

  function onTouchStart(e: TouchEvent) {
    startX = e.touches[0].clientX
  }
  function onTouchEnd(e: TouchEvent) {
    const delta = e.changedTouches[0].clientX - startX
    if (delta < -THRESHOLD) onSwipeLeft()
    else if (delta > THRESHOLD) onSwipeRight()
  }
  return { onTouchStart, onTouchEnd }
}
