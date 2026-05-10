/**
 * share.ts
 * Renders the TalismanCard DOM node to a PNG using html2canvas (lazy-loaded),
 * then either triggers a native share sheet (Web Share API) or downloads the file.
 * Portrait 9:16 aspect ratio for TikTok compatibility.
 */

export async function captureElement(el: HTMLElement): Promise<Blob | null> {
  try {
    // Lazy-load html2canvas only when user actually shares (35 KB, not in main bundle)
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, {
      backgroundColor: '#07041a',
      scale: 2,           // Retina quality
      useCORS: true,
      logging: false,
      width: el.offsetWidth,
      height: el.offsetHeight,
    })
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png', 0.95))
  } catch (e) {
    console.warn('[share] html2canvas failed:', e)
    return null
  }
}

export async function shareOrDownload(
  el: HTMLElement,
  title: string,
  text: string,
  filename = 'my-fate.png'
): Promise<'shared' | 'downloaded' | 'failed'> {
  const blob = await captureElement(el)
  if (!blob) return 'failed'

  const file = new File([blob], filename, { type: 'image/png' })

  // Prefer native share sheet (iOS Safari, Android Chrome)
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return 'shared'
    } catch (e) {
      // User cancelled — fall through to download
      if ((e as DOMException).name === 'AbortError') return 'failed'
    }
  }

  // Fallback: direct download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'downloaded'
}

/** Build share caption text for TikTok */
export function buildCaption(
  hexagramName: string,
  fortuneEn: string,
  hash: string
): string {
  const short = fortuneEn.split('.')[0] ?? fortuneEn
  return `The I Ching revealed ${hexagramName} for me today ✨\n"${short}"\n\nVerified fate: ${hash.slice(0, 8)} · cyber-tao.app\n#IChing #Divination #ChineseMysticism #CyberTao #FortuneTelling`
}
