'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

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
  action?: 'dataSources' | 'methodology'
  isDropdown?: boolean
  dropdownItems?: NavItem[]
}

interface TopNavigationProps {
  onDataSourcesClick?: () => void
  onMethodologyClick?: () => void
}

const issuesDropdownItems: NavItem[] = [
  { id: 'healthcare', label: 'Healthcare', href: '/healthcare' },
  { id: 'water', label: 'Water', href: '/water' },
  { id: 'greenbelt', label: 'Greenbelt', href: '/greenbelt' },
  { id: 'wildlife', label: 'Wildlife Impact', href: '/wildlife' },
]

const dataDropdownItems: NavItem[] = [
  { id: 'receipts', label: 'The Receipts', href: '/receipts' },
  { id: 'dataSources', label: 'Data Sources', action: 'dataSources' },
  { id: 'methodology', label: 'Methodology', href: '/methodology' },
]

const navItems: NavItem[] = [
  { id: 'issues', label: 'Issues', isDropdown: true, dropdownItems: issuesDropdownItems },
  { id: 'data', label: 'The Data', isDropdown: true, dropdownItems: dataDropdownItems },
  { id: 'events', label: 'Events', href: '/protests' },
  { id: 'about', label: 'About', href: '/about' },
]

const DROPDOWN_LEAVE_DELAY_MS = 200

export default function TopNavigation({ onDataSourcesClick, onMethodologyClick }: TopNavigationProps = {}) {
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
      // Use the basePath-aware href
      window.location.href = getNavHref(item.href, basePath)
    } else if (item.section) {
      scrollToSection(item.section)
    }
  }

  return (
    <>
      <motion.nav
            initial={false}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="sticky top-0 left-0 right-0 z-50 w-full"
          >
            <div className={`bg-white/80 backdrop-blur-md transition-all duration-300 w-full ${
              isScrolling ? 'shadow-sm' : ''
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex items-center justify-between h-14 sm:h-16">
                {/* Logo/Title */}
                <div className="flex-shrink-0">
                  <Link
                    href={basePath || '/'}
                    className="flex items-center gap-2 text-sm sm:text-base font-light text-gray-900 hover:text-gray-700 transition-colors"
                    aria-label="Protect Ontario – Home"
                  >
                    <img 
                      src={basePath ? `${basePath}/logo-icon-text.svg` : '/logo-icon-text.svg'} 
                      alt="" 
                      className="h-9 sm:h-10 w-auto"
                    />
                  </Link>
                </div>

                {/* Navigation Items + Take Action CTA */}
                <div className="hidden md:flex items-center flex-1 justify-end gap-1 lg:gap-2 xl:gap-3 max-w-6xl mx-4">
                  {navItems.map((item) => {
                    if (item.isDropdown && item.dropdownItems) {
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
                            className="px-3 lg:px-4 py-2 text-sm lg:text-base font-light text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100/50 whitespace-nowrap flex items-center gap-1"
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
                              <div className="bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px]">
                                {item.dropdownItems.map((dropdownItem) => (
                                  <button
                                    key={dropdownItem.id}
                                    onClick={() => {
                                      handleNavClick(dropdownItem)
                                      setOpenDropdown(null)
                                    }}
                                    className="w-full text-left px-4 py-2 text-sm font-light text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                                  >
                                    {dropdownItem.label}
                                  </button>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )
                    }
                    return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item)}
                      className="px-3 lg:px-4 py-2 text-sm lg:text-base font-light text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100/50 whitespace-nowrap"
                    >
                      {item.label}
                    </button>
                    )
                  })}
                  <Link
                    href={getNavHref('/take-action', basePath)}
                    className="ml-2 lg:ml-4 px-4 lg:px-5 py-2.5 text-sm lg:text-base font-medium text-white bg-[#2E4A6B] hover:bg-[#243d56] rounded-lg shadow-sm hover:shadow transition-colors whitespace-nowrap"
                  >
                    Take Action
                  </Link>
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden relative z-[90]">
                  <MobileMenu 
                    navItems={navItems} 
                    scrollToSection={scrollToSection}
                    onMenuStateChange={setIsMobileMenuOpen}
                    onDataSourcesClick={onDataSourcesClick}
                    onMethodologyClick={onMethodologyClick}
                    basePath={basePath}
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
  scrollToSection,
  onMenuStateChange,
  onDataSourcesClick,
  onMethodologyClick,
  basePath
}: { 
  navItems: NavItem[]
  scrollToSection: (id: string) => void
  onMenuStateChange?: (isOpen: boolean) => void
  onDataSourcesClick?: () => void
  onMethodologyClick?: () => void
  basePath: string
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
        className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative z-[80]"
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
                    style={{ position: 'fixed', inset: 0, zIndex: 60, top: '56px' }}
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
                    style={{ position: 'fixed', top: '56px', right: 0, bottom: 0, width: '14rem', zIndex: 70 }}
                    className="bg-white border-l border-gray-200 shadow-xl overflow-y-auto md:hidden"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <div className="p-4 space-y-1">
                      {navItems.map((item) => {
                        if (item.isDropdown && item.dropdownItems) {
                          return (
                            <div key={item.id} className="space-y-1">
                              <div className="px-4 py-2 text-sm font-medium text-gray-500 uppercase tracking-wider">
                                {item.label}
                              </div>
                              {item.dropdownItems.map((dropdownItem) => (
                                <button
                                  key={dropdownItem.id}
                                  onClick={() => {
                                    if (dropdownItem.action === 'dataSources' && onDataSourcesClick) {
                                      onDataSourcesClick()
                                    } else if (dropdownItem.action === 'methodology' && onMethodologyClick) {
                                      onMethodologyClick()
                                    } else if (dropdownItem.href) {
                                      window.location.href = getNavHref(dropdownItem.href, basePath)
                                    } else if (dropdownItem.section) {
                                      scrollToSection(dropdownItem.section)
                                    }
                                    setIsOpen(false)
                                  }}
                                  className="w-full text-left px-6 py-3 text-base font-light text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                                >
                                  {dropdownItem.label}
                                </button>
                              ))}
                            </div>
                          )
                        }
                        return (
                        <button
                          key={item.id}
                          onClick={() => {
                            if (item.action === 'dataSources' && onDataSourcesClick) {
                              onDataSourcesClick()
                            } else if (item.action === 'methodology' && onMethodologyClick) {
                              onMethodologyClick()
                            } else if (item.href) {
                              // Use the basePath-aware href
                              window.location.href = getNavHref(item.href, basePath)
                            } else if (item.section) {
                              scrollToSection(item.section)
                            }
                            setIsOpen(false)
                          }}
                          className="w-full text-left px-4 py-4 text-lg font-light text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                        >
                          {item.label}
                        </button>
                        )
                      })}
                      <div className="pt-4 mt-4 border-t border-gray-200">
                        <a
                          href={getNavHref('/take-action', basePath)}
                          onClick={() => setIsOpen(false)}
                          className="block w-full text-center px-4 py-4 text-lg font-medium text-white bg-[#2E4A6B] hover:bg-[#243d56] rounded-lg transition-colors"
                        >
                          Take Action
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
