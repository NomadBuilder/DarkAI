'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import ProtestsSiteBanner from './ProtestsSiteBanner'
import { HUB_SITE_NAME } from '@/lib/indigenous-hub'

// Start with empty basePath so server and client first render match (avoids hydration error).
// NEXT_PUBLIC_* is inlined at build time; BASE_PATH is server-only, so they can differ.
const INITIAL_BASE_PATH = ''

// Helper to prefix hrefs with basePath
function getNavHref(href: string, basePath: string): string {
  const cleanHref = href.startsWith('/') ? href.slice(1) : href
  return basePath ? `${basePath}/${cleanHref}` : `/${cleanHref}`
}

interface NavItem {
  id: string
  label: string
  section?: string
  href?: string
  /** Opens href in a new tab (e.g. Stripe donate) */
  external?: boolean
  action?: 'dataSources' | 'methodology'
  isDropdown?: boolean
  dropdownItems?: NavItem[]
  /** Grouped sections inside a dropdown (e.g. Resources → Create) */
  dropdownGroups?: { label?: string; items: NavItem[] }[]
}

function getDropdownGroups(item: NavItem): { label?: string; items: NavItem[] }[] {
  if (item.dropdownGroups?.length) return item.dropdownGroups
  if (item.dropdownItems?.length) return [{ items: item.dropdownItems }]
  return []
}

interface TopNavigationProps {
  onDataSourcesClick?: () => void
  onMethodologyClick?: () => void
  /** Purple/yellow nav bar while over the join-styled hero (home preview) */
  navOnDark?: boolean
  /** Slightly shorter bar — used on Indigenous hub pages */
  compact?: boolean
  /** Override the primary CTA (defaults to Join us → /join) */
  primaryCta?: { label: string; href: string }
}

const DEFAULT_PRIMARY_CTA = { label: 'Join us', href: '/join' } as const

const issuesDropdownItems: NavItem[] = [
  { id: 'healthcare', label: 'Healthcare', href: '/healthcare' },
  { id: 'water', label: 'Water', href: '/water' },
  { id: 'public-land', label: 'Public land', href: '/public-land' },
  { id: 'wildlife', label: 'Wildlife Impact', href: '/wildlife' },
  { id: 'indigenous-rights', label: 'Indigenous rights', href: '/indigenous-rights' },
  { id: 'indigenous-hub', label: HUB_SITE_NAME, href: '/stand4land' },
]

const aboutDropdownItems: NavItem[] = [
  { id: 'about', label: 'About', href: '/about' },
  { id: 'media', label: 'Press room', href: '/media' },
  { id: 'receipts', label: 'The Receipts', href: '/receipts' },
  { id: 'dataSources', label: 'Data Sources', action: 'dataSources' },
  { id: 'methodology', label: 'Methodology', href: '/methodology' },
]

const DONATE_STRIPE_URL = 'https://buy.stripe.com/9B614n0UY3CtdbQ5CM4gg00'

const takeActionDropdownItems: NavItem[] = [
  { id: 'join', label: 'Join — get a sign', href: '/join' },
  { id: 'contact-mpp', label: 'Contact your MPP', href: '/take-action' },
  { id: 'donate', label: 'Donate', href: DONATE_STRIPE_URL, external: true },
]

const materialsDropdownItems: NavItem[] = [
  { id: 'materials-hub', label: 'All materials', href: '/materials' },
  { id: 'flyers', label: 'Printable flyers', href: '/flyers' },
  { id: 'products', label: 'Products', href: '/products' },
]

const reportsDropdownItems: NavItem[] = [
  { id: 'reports-all', label: 'All reports', href: '/reports' },
  {
    id: 'report-protection',
    label: 'They sold it as protection',
    href: '/reports/they-called-it-protection',
  },
]

const navItems: NavItem[] = [
  { id: 'issues', label: 'The Issues', isDropdown: true, dropdownItems: issuesDropdownItems },
  { id: 'take-action', label: 'Take action', isDropdown: true, dropdownItems: takeActionDropdownItems },
  { id: 'protests', label: 'Protests', href: '/protests' },
  { id: 'materials', label: 'Materials', isDropdown: true, dropdownItems: materialsDropdownItems },
  { id: 'reports', label: 'Reports', isDropdown: true, dropdownItems: reportsDropdownItems },
  { id: 'about', label: 'About', isDropdown: true, dropdownItems: aboutDropdownItems },
]

const DROPDOWN_LEAVE_DELAY_MS = 200

export default function TopNavigation({
  onDataSourcesClick,
  onMethodologyClick,
  navOnDark = false,
  compact = false,
  primaryCta,
}: TopNavigationProps = {}) {
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownLeaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  // basePath from env on first render (avoids hydration mismatch); sync from window after mount
  const [basePath, setBasePath] = useState(INITIAL_BASE_PATH)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.pathname.startsWith('/ledger')) {
      setBasePath('/ledger')
    }
  }, [])

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      setIsScrolling(true)

      clearTimeout(scrollTimeout)
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.body.classList.toggle('mobile-menu-open', isMobileMenuOpen)
    return () => {
      document.body.classList.remove('mobile-menu-open')
    }
  }, [isMobileMenuOpen])

  // Clear dropdown leave timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownLeaveTimeoutRef.current) {
        clearTimeout(dropdownLeaveTimeoutRef.current)
      }
    }
  }, [])

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 80 // Account for fixed nav height
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  const handleNavClick = (item: NavItem) => {
    if (item.action === 'dataSources' && onDataSourcesClick) {
      onDataSourcesClick()
    } else if (item.action === 'methodology' && onMethodologyClick) {
      onMethodologyClick()
    } else if (item.href) {
      if (item.external || /^https?:\/\//i.test(item.href)) {
        window.open(item.href, '_blank', 'noopener,noreferrer')
      } else {
        window.location.href = getNavHref(item.href, basePath)
      }
    } else if (item.section) {
      scrollToSection(item.section)
    }
  }

  const renderDropdownPanel = (item: NavItem, onSelect: () => void) => (
    <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[200px]">
      {getDropdownGroups(item).map((group, groupIndex) => (
        <div
          key={group.label ?? `group-${groupIndex}`}
          className={groupIndex > 0 ? 'mt-1 border-t border-gray-100 pt-1' : ''}
        >
          {group.label ? (
            <div className="px-4 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
              {group.label}
            </div>
          ) : null}
          {group.items.map((dropdownItem) => (
            <button
              key={dropdownItem.id}
              type="button"
              onClick={() => {
                handleNavClick(dropdownItem)
                onSelect()
              }}
              className={`w-full text-left py-2 text-sm font-light text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors ${
                group.label ? 'px-6' : 'px-4'
              }`}
            >
              {dropdownItem.label}
            </button>
          ))}
        </div>
      ))}
    </div>
  )

  return (
    <>
      <motion.nav
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 left-0 right-0 z-50 w-full"
          >
            <ProtestsSiteBanner basePath={basePath} />
            <div
              className={`backdrop-blur-md transition-all duration-300 w-full ${
                navOnDark
                  ? 'border-b border-[#f9e04c]/15 bg-[#3d2b7a]/90'
                  : `bg-white/80 ${isScrolling ? 'shadow-sm' : ''}`
              }`}
            >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div
                className={`flex items-center justify-between ${compact ? 'h-12 sm:h-14' : 'h-14 sm:h-16'}`}
              >
                {/* Logo/Title */}
                <div className="flex-shrink-0 min-w-0">
                  <Link
                    href={basePath || '/'}
                    className={`flex items-center gap-2 leading-none text-sm sm:text-base font-light transition-colors ${
                      navOnDark ? 'text-[#f9e04c] hover:text-[#f9e04c]/85' : 'text-gray-900 hover:text-gray-700'
                    }`}
                    aria-label="Protect Ontario – Home"
                  >
                    <img
                      src={
                        basePath
                          ? `${basePath}/${navOnDark ? 'logo-icon-text-dark.svg' : 'logo-icon-text.svg'}`
                          : navOnDark
                            ? '/logo-icon-text-dark.svg'
                            : '/logo-icon-text.svg'
                      }
                      alt=""
                      className={`block w-auto ${compact ? 'h-8 sm:h-9' : 'h-9 sm:h-10'}`}
                    />
                  </Link>
                </div>

                {/* Navigation Items + Join CTA */}
                <div className="hidden md:flex items-center flex-1 justify-end gap-1 lg:gap-2 xl:gap-3 max-w-6xl mx-4">
                  {navItems.map((item) => {
                    if (item.isDropdown && (item.dropdownItems || item.dropdownGroups)) {
                      return (
                        <div
                          key={item.id}
                          className="relative"
                          onMouseEnter={() => {
                            if (dropdownLeaveTimeoutRef.current) {
                              clearTimeout(dropdownLeaveTimeoutRef.current)
                              dropdownLeaveTimeoutRef.current = null
                            }
                            setOpenDropdown(item.id)
                          }}
                          onMouseLeave={() => {
                            dropdownLeaveTimeoutRef.current = setTimeout(() => {
                              setOpenDropdown(null)
                              dropdownLeaveTimeoutRef.current = null
                            }, DROPDOWN_LEAVE_DELAY_MS)
                          }}
                        >
                          <button
                            className={`px-3 lg:px-4 py-2 text-sm lg:text-base font-light transition-colors rounded-md whitespace-nowrap flex items-center gap-1 ${
                              navOnDark
                                ? 'text-[#f9e04c]/85 hover:text-[#f9e04c] hover:bg-white/10'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                            }`}
                          >
                            {item.label}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openDropdown === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 pt-1 z-50"
                            >
                              {renderDropdownPanel(item, () => setOpenDropdown(null))}
                            </motion.div>
                          )}
                        </div>
                      )
                    }
                    return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className={`px-3 lg:px-4 py-2 text-sm lg:text-base font-light transition-colors rounded-md whitespace-nowrap ${
                        navOnDark
                          ? 'text-[#f9e04c]/85 hover:text-[#f9e04c] hover:bg-white/10'
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/50'
                      }`}
                    >
                      {item.label}
                    </button>
                    )
                  })}
                  <Link
                    href={getNavHref(primaryCta?.href ?? DEFAULT_PRIMARY_CTA.href, basePath)}
                    className={`ml-2 lg:ml-2 px-4 lg:px-5 py-2.5 text-sm lg:text-base font-medium rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap ${
                      navOnDark
                        ? 'bg-[#f9e04c] text-[#1a1a1a] hover:bg-[#f5d84a]'
                        : 'text-white bg-[#2E4A6B] hover:bg-[#243d56]'
                    }`}
                  >
                    {primaryCta?.label ?? DEFAULT_PRIMARY_CTA.label}
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden relative z-[90]">
                  <MobileMenu
                    navItems={navItems}
                    onNavItemClick={handleNavClick}
                    onMenuStateChange={setIsMobileMenuOpen}
                    basePath={basePath}
                    navOnDark={navOnDark}
                    primaryCta={primaryCta}
                  />
                </div>
              </div>
            </div>
            </div>
          </motion.nav>
    </>
  )
}

function MobileMenu({
  navItems,
  onNavItemClick,
  onMenuStateChange,
  basePath,
  navOnDark = false,
  primaryCta,
}: {
  navItems: NavItem[]
  onNavItemClick: (item: NavItem) => void
  onMenuStateChange?: (isOpen: boolean) => void
  basePath: string
  navOnDark?: boolean
  primaryCta?: { label: string; href: string }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Notify parent of menu state changes
  useEffect(() => {
    onMenuStateChange?.(isOpen)
  }, [isOpen, onMenuStateChange])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setIsOpen(prev => !prev)
        }}
        className={`p-2 transition-colors relative z-[80] ${
          navOnDark ? 'text-[#f9e04c] hover:text-[#f9e04c]/85' : 'text-gray-600 hover:text-gray-900'
        }`}
        aria-label="Toggle menu"
        aria-expanded={isOpen}
        type="button"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {mounted && (
        <>
          {createPortal(
            <AnimatePresence mode="sync">
              {isOpen && (
                <>
                  {/* Backdrop overlay */}
                  <motion.div
                    key="backdrop"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    style={{ position: 'fixed', inset: 0, zIndex: 60, top: '92px' }}
                    className="md:hidden"
                  >
                    <div 
                      className="w-full h-full bg-black/20"
                      onClick={() => setIsOpen(false)}
                    />
                  </motion.div>
                  {/* Slide-out menu */}
                  <motion.div
                    key="menu"
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                    style={{ position: 'fixed', top: '92px', right: 0, bottom: 0, width: '14rem', zIndex: 70 }}
                    className="bg-white border-l border-gray-200 shadow-xl overflow-y-auto md:hidden"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <div className="p-4 space-y-1">
                      {navItems.map((item) => {
                        if (item.isDropdown && (item.dropdownItems || item.dropdownGroups)) {
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {item.label}
                              </div>
                              {getDropdownGroups(item).map((group, groupIndex) => (
                                <div key={group.label ?? `mobile-group-${groupIndex}`}>
                                  {group.label ? (
                                    <div className="px-6 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-400">
                                      {group.label}
                                    </div>
                                  ) : null}
                                  {group.items.map((dropdownItem) => (
                                    <button
                                      key={dropdownItem.id}
                                      type="button"
                                      onClick={() => {
                                        onNavItemClick(dropdownItem)
                                        setIsOpen(false)
                                      }}
                                      className={`w-full text-left py-3 text-base font-light text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded-md transition-colors ${
                                        group.label ? 'px-8' : 'px-6'
                                      }`}
                                    >
                                      {dropdownItem.label}
                                    </button>
                                  ))}
                                </div>
                              ))}
                            </div>
                          )
                        }
                        return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => {
                            onNavItemClick(item)
                            setIsOpen(false)
                          }}
                          className="w-full text-left px-4 py-4 text-lg font-light text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {item.label}
                        </button>
                        )
                      })}
                      <div className="pt-4 mt-4 border-t border-gray-200 space-y-3">
                        <a
                          href={getNavHref(primaryCta?.href ?? DEFAULT_PRIMARY_CTA.href, basePath)}
                          onClick={() => setIsOpen(false)}
                          className={`block w-full text-center px-4 py-4 text-lg font-medium rounded-lg transition-colors ${
                            navOnDark
                              ? 'bg-[#f9e04c] text-[#1a1a1a] hover:bg-[#f5d84a]'
                              : 'text-white bg-[#2E4A6B] hover:bg-[#243d56]'
                          }`}
                        >
                          {primaryCta?.label ?? DEFAULT_PRIMARY_CTA.label}
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>,
            document.body
          )}
        </>
      )}
    </>
  )
}
