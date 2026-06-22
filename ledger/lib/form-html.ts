/** Minimal allowlist sanitizer for admin-authored form copy HTML. */

const ALLOWED_TAGS = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'A', 'UL', 'OL', 'LI', 'SPAN'])

function isSafeHref(href: string): boolean {
  const h = href.trim()
  if (!h) return false
  if (h.startsWith('/') || h.startsWith('#')) return true
  if (h.startsWith('mailto:')) return /^mailto:[^\s<>"']+$/i.test(h)
  try {
    const u = new URL(h)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

export function sanitizeFormHtml(html: string): string {
  if (!html.trim()) return ''
  if (typeof DOMParser === 'undefined') {
    return html.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
  }

  const doc = new DOMParser().parseFromString(html, 'text/html')
  const walk = (node: Node) => {
    const children = [...node.childNodes]
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        if (!ALLOWED_TAGS.has(el.tagName)) {
          while (el.firstChild) el.parentNode?.insertBefore(el.firstChild, el)
          el.remove()
          continue
        }
        [...el.attributes].forEach((attr) => {
          if (el.tagName === 'A' && attr.name === 'href' && isSafeHref(attr.value)) return
          if (attr.name === 'class' && el.tagName === 'A') return
          el.removeAttribute(attr.name)
        })
        if (el.tagName === 'A') {
          const href = el.getAttribute('href')
          if (!href || !isSafeHref(href)) {
            const text = doc.createTextNode(el.textContent ?? '')
            el.replaceWith(text)
            continue
          }
          el.setAttribute('rel', 'noopener noreferrer')
          if (href.startsWith('http')) el.setAttribute('target', '_blank')
        }
      }
      walk(child)
    }
  }
  walk(doc.body)
  return doc.body.innerHTML.trim()
}

export const defaultYardSignIntroHtml =
  '<p>$10 per sign, delivered by volunteers—not shipped by mail. Pay on <a href="/products">Products</a> or via e-transfer to <a href="mailto:FIGHT_FORD_SIGNS@outlook.com">FIGHT_FORD_SIGNS@outlook.com</a> (preferred) when you&apos;re ready.</p>'

export const defaultSuccessYardSignHtml =
  '<p>Haven&apos;t paid yet? Pay $10 per sign on <a href="/products">Products</a>, Stripe checkout, or e-transfer to <a href="mailto:FIGHT_FORD_SIGNS@outlook.com">FIGHT_FORD_SIGNS@outlook.com</a> when you&apos;re ready.</p>'

export function legacyYardSignIntroHtml(parts: {
  introPrefix?: string
  productsLinkLabel?: string
  introMiddle?: string
  paymentEmail?: string
  introSuffix?: string
}): string {
  const email = parts.paymentEmail?.trim() || 'FIGHT_FORD_SIGNS@outlook.com'
  return `<p>${parts.introPrefix ?? ''}<a href="/products">${parts.productsLinkLabel ?? 'Products'}</a>${parts.introMiddle ?? ''}<a href="mailto:${email}">${email}</a>${parts.introSuffix ?? ''}</p>`
}

export function legacySuccessYardSignHtml(parts: {
  prefix?: string
  productsLinkLabel?: string
  middle?: string
  paymentEmail?: string
  suffix?: string
}): string {
  const email = parts.paymentEmail?.trim() || 'FIGHT_FORD_SIGNS@outlook.com'
  return `<p>${parts.prefix ?? ''}<a href="/products">${parts.productsLinkLabel ?? 'Products'}</a>${parts.middle ?? ''}<a href="mailto:${email}">${email}</a>${parts.suffix ?? ''}</p>`
}
