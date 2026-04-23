export function useSwipe(onSwipeLeft: () => void, onSwipeRight: () => void) {
  let startX = 0
  const THRESHOLD = 50

  function onTouchStart(e: TouchEvent) {
    const touch = e.touches[0]
    if (touch) startX = touch.clientX
  }

  function onTouchEnd(e: TouchEvent) {
    const touch = e.changedTouches[0]
    if (!touch) return
    const delta = touch.clientX - startX
    if (delta < -THRESHOLD) onSwipeLeft()
    else if (delta > THRESHOLD) onSwipeRight()
  }

  return { onTouchStart, onTouchEnd }
}
