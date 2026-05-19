/**
 * share.ts
 * Renders the TalismanCard DOM node to a PNG using html2canvas (lazy-loaded)
 */

export async function captureElement(el: HTMLElement): Promise<Blob | null> {
  try {
    const { default: html2canvas } = await import('html2canvas')
    const canvas = await html2canvas(el, {
      backgroundColor: '#07041a',
      scale: 2,
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

  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text })
      return 'shared'
    } catch (e) {
      if ((e as DOMException).name === 'AbortError') return 'failed'
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 5000)
  return 'downloaded'
}

export function buildCaption(
  hexagramName: string,
  fortuneEn: string,
  hash: string
): string {
  const short = fortuneEn.split('.')[0] ?? fortuneEn
  return `The I Ching revealed ${hexagramName} for me today ✨\n"${short}"\n\nVerified fate: ${hash.slice(0, 8)} · cyber-tao.app\n#IChing #Divination #ChineseMysticism #CyberTao #FortuneTelling`
}
