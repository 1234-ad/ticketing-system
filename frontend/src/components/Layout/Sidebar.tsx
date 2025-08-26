'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Role } from '@/types'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊', roles: [Role.USER, Role.SUPPORT_AGENT, Role.ADMIN] },
  { name: 'My Tickets', href: '/tickets', icon: '🎫', roles: [Role.USER, Role.SUPPORT_AGENT, Role.ADMIN] },
  { name: 'Create Ticket', href: '/tickets/create', icon: '➕', roles: [Role.USER, Role.SUPPORT_AGENT, Role.ADMIN] },
  { name: 'All Tickets', href: '/tickets/all', icon: '📋', roles: [Role.SUPPORT_AGENT, Role.ADMIN] },
  { name: 'Admin Panel', href: '/admin', icon: '⚙️', roles: [Role.ADMIN] },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { user } = useAuth()

  const filteredNavigation = navigation.filter(item => 
    user?.role && item.roles.includes(user.role)
  )

  return (
    <div className="w-64 bg-white shadow-sm border-r border-gray-200 min-h-screen">
      <nav className="mt-8 px-4">
        <ul className="space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  } group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </div>
  )
}