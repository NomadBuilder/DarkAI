'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

// Get basePath for logo and links (same logic as dataPath.ts)
function getBasePath(): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_PATH || process.env.BASE_PATH || ''
  }
  const pathname = window.location.pathname
  if (pathname.startsWith('/ledger')) {
    return '/ledger'
  }
  return ''
}

function getLogoPath(): string {
  return getBasePath()
}

// Helper to prefix hrefs with basePath
function getNavHref(href: string): string {
  const basePath = getBasePath()
  // Remove leading slash if present
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

const dataDropdownItems: NavItem[] = [
  { id: 'receipts', label: 'The Receipts', href: '/receipts' },
  { id: 'dataSources', label: 'Data Sources', action: 'dataSources' },
  { id: 'methodology', label: 'Methodology', action: 'methodology' },
]

const navItems: NavItem[] = [
  { id: 'healthcare', label: 'Healthcare', href: '/healthcare' },
  { id: 'water', label: 'Water Privatization', href: '/water' },
  { id: 'greenbelt', label: 'Greenbelt', href: '/greenbelt' },
  { id: 'wildlife', label: 'Wildlife Impact', href: '/wildlife' },
  { id: 'data', label: 'The Data', isDropdown: true, dropdownItems: dataDropdownItems },
  // { id: 'trade-off', label: 'The Trade-Off', href: '/thetradeoff' }, // Hidden for now
  { id: 'about', label: 'About', href: '/about' },
]

export default function TopNavigation({ onDataSourcesClick, onMethodologyClick }: TopNavigationProps = {}) {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    let scrollTimeout: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Show/hide based on scroll direction
      if (currentScrollY < 100) {
        setIsVisible(true)
      } else if (currentScrollY > lastScrollY && currentScrollY > 200) {
        setIsVisible(false)
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
      setIsScrolling(true)

      // Clear existing timeout
      clearTimeout(scrollTimeout)
      
      // Set scrolling to false after scroll stops
      scrollTimeout = setTimeout(() => {
        setIsScrolling(false)
      }, 150)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(scrollTimeout)
    }
  }, [lastScrollY])

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
      window.location.href = getNavHref(item.href)
    } else if (item.section) {
      scrollToSection(item.section)
    }
  }

  return (
    <>
      <AnimatePresence>
        {(isVisible || isMobileMenuOpen) && (
          <motion.nav
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
          >
            <div className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300 w-full ${
              isScrolling ? 'shadow-sm' : ''
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
              <div className="flex items-center justify-between h-14 sm:h-16">
                {/* Logo/Title */}
                <div className="flex-shrink-0">
                  <Link
                    href="/"
                    className="flex items-center gap-2 text-sm sm:text-base font-light text-gray-900 hover:text-gray-700 transition-colors"
                  >
                    <img 
                      src={`${getLogoPath()}/logo-icon-text.svg`} 
                      alt="The Ledger" 
                      className="h-9 sm:h-10 w-auto"
                    />
                  </Link>
                </div>

                {/* Navigation Items */}
                <div className="hidden md:flex items-center space-x-1 lg:space-x-2 xl:space-x-3 flex-1 justify-center max-w-6xl mx-4">
                  {navItems.map((item) => {
                    if (item.isDropdown && item.dropdownItems) {
                      return (
                        <div
                          key={item.id}
                          className="relative"
                          onMouseEnter={() => setOpenDropdown(item.id)}
                          onMouseLeave={() => setOpenDropdown(null)}
                        >
                          <button
                            className="px-3 lg:px-4 py-2 text-sm lg:text-base font-light text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100/50 whitespace-nowrap flex items-center gap-1"
                          >
                            {item.label}
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </button>
                          {openDropdown === item.id && (
                            <motion.div
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-2 min-w-[180px] z-50"
                            >
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
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden relative z-[90]">
                  <MobileMenu 
                    navItems={navItems} 
                    scrollToSection={scrollToSection}
                    onMenuStateChange={setIsMobileMenuOpen}
                    onDataSourcesClick={onDataSourcesClick}
                    onMethodologyClick={onMethodologyClick}
                  />
                </div>
              </div>
            </div>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

function MobileMenu({ 
  navItems, 
  scrollToSection,
  onMenuStateChange,
  onDataSourcesClick,
  onMethodologyClick
}: { 
  navItems: NavItem[]
  scrollToSection: (id: string) => void
  onMenuStateChange?: (isOpen: boolean) => void
  onDataSourcesClick?: () => void
  onMethodologyClick?: () => void
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
            <AnimatePresence mode="wait">
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
                                      window.location.href = getNavHref(dropdownItem.href)
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
                              window.location.href = getNavHref(item.href)
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
