'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  id: string
  label: string
  section: string
}

const navItems: NavItem[] = [
  { id: 'numbers', label: 'The Numbers', section: 'numbers' },
  { id: 'ledger', label: 'The Ledger', section: 'ledger' },
  { id: 'staffing', label: 'Staffing Crisis', section: 'staffing' },
  { id: 'hospitals', label: 'Hospital Crisis', section: 'hospitals' },
  { id: 'findings', label: 'Findings', section: 'findings' },
]

export default function TopNavigation() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [isScrolling, setIsScrolling] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

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

  return (
    <AnimatePresence>
      {(isVisible || isMobileMenuOpen) && (
        <motion.nav
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className={`fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300 ${
            isScrolling ? 'shadow-sm' : ''
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Logo/Title */}
              <div className="flex-shrink-0">
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-sm sm:text-base font-light text-gray-900 hover:text-gray-700 transition-colors"
                >
                  The Ledger
                </button>
              </div>

              {/* Navigation Items */}
              <div className="hidden md:flex items-center space-x-1 lg:space-x-2 flex-1 justify-center max-w-4xl mx-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.section)}
                    className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-light text-gray-600 hover:text-gray-900 transition-colors rounded-md hover:bg-gray-100/50 whitespace-nowrap"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Mobile Menu Button */}
              <div className="md:hidden relative z-50">
                <MobileMenu 
                  navItems={navItems} 
                  scrollToSection={scrollToSection}
                  onMenuStateChange={setIsMobileMenuOpen}
                />
              </div>
            </div>
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

function MobileMenu({ 
  navItems, 
  scrollToSection,
  onMenuStateChange 
}: { 
  navItems: NavItem[]
  scrollToSection: (id: string) => void
  onMenuStateChange?: (isOpen: boolean) => void
}) {
  const [isOpen, setIsOpen] = useState(false)

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

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/20 z-[60] md:hidden"
              style={{ top: '56px' }}
            />
            {/* Slide-out menu */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed top-14 sm:top-16 right-0 bottom-0 w-64 bg-white border-l border-gray-200 shadow-xl z-[70] overflow-y-auto md:hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      scrollToSection(item.section)
                      setIsOpen(false)
                    }}
                    className="w-full text-left px-4 py-3 text-sm font-light text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
