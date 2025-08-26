'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { ticketService } from '@/services/ticketService'
import { Ticket, TicketStatus, Priority, Role } from '@/types'
import Link from 'next/link'

interface DashboardStats {
  totalTickets: number
  openTickets: number
  inProgressTickets: number
  resolvedTickets: number
  closedTickets: number
  highPriorityTickets: number
  urgentTickets: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats>({
    totalTickets: 0,
    openTickets: 0,
    inProgressTickets: 0,
    resolvedTickets: 0,
    closedTickets: 0,
    highPriorityTickets: 0,
    urgentTickets: 0
  })
  const [recentTickets, setRecentTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch tickets based on user role
        const ticketsResponse = user?.role === Role.USER 
          ? await ticketService.getMyTickets({ size: 10 })
          : await ticketService.getAllTickets({ size: 10 })

        const tickets = ticketsResponse.content

        // Calculate stats
        const newStats: DashboardStats = {
          totalTickets: ticketsResponse.totalElements,
          openTickets: tickets.filter(t => t.status === TicketStatus.OPEN).length,
          inProgressTickets: tickets.filter(t => t.status === TicketStatus.IN_PROGRESS).length,
          resolvedTickets: tickets.filter(t => t.status === TicketStatus.RESOLVED).length,
          closedTickets: tickets.filter(t => t.status === TicketStatus.CLOSED).length,
          highPriorityTickets: tickets.filter(t => t.priority === Priority.HIGH).length,
          urgentTickets: tickets.filter(t => t.priority === Priority.URGENT).length,
        }

        setStats(newStats)
        setRecentTickets(tickets.slice(0, 5))
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user?.role])

  const getStatusBadge = (status: TicketStatus) => {
    const statusClasses = {
      [TicketStatus.OPEN]: 'status-open',
      [TicketStatus.IN_PROGRESS]: 'status-in-progress',
      [TicketStatus.RESOLVED]: 'status-resolved',
      [TicketStatus.CLOSED]: 'status-closed',
    }
    return statusClasses[status] || 'status-open'
  }

  const getPriorityBadge = (priority: Priority) => {
    const priorityClasses = {
      [Priority.LOW]: 'priority-low',
      [Priority.MEDIUM]: 'priority-medium',
      [Priority.HIGH]: 'priority-high',
      [Priority.URGENT]: 'priority-urgent',
    }
    return priorityClasses[priority] || 'priority-low'
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">📊</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalTickets}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <span className="text-green-600 font-semibold">🟢</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Open Tickets</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.openTickets}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <span className="text-yellow-600 font-semibold">🟡</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">In Progress</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.inProgressTickets}</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <span className="text-red-600 font-semibold">🔴</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Urgent</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.urgentTickets}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Tickets */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Tickets</h2>
            <Link 
              href={user?.role === Role.USER ? '/tickets' : '/tickets/all'}
              className="text-blue-600 hover:text-blue-500 text-sm font-medium"
            >
              View all →
            </Link>
          </div>
          
          {recentTickets.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No tickets found</p>
              <Link href="/tickets/create" className="btn-primary mt-4 inline-block">
                Create your first ticket
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentTickets.map((ticket) => (
                <div key={ticket.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <span className="font-medium text-gray-900">#{ticket.id}</span>
                      <h3 className="text-sm font-medium text-gray-900 truncate">
                        {ticket.subject}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className={`text-xs ${getStatusBadge(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`text-xs ${getPriorityBadge(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Link 
                    href={`/tickets/${ticket.id}`}
                    className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/tickets/create" className="btn-primary text-center">
              Create New Ticket
            </Link>
            <Link 
              href={user?.role === Role.USER ? '/tickets' : '/tickets/all'} 
              className="btn-secondary text-center"
            >
              View All Tickets
            </Link>
            {user?.role === Role.ADMIN && (
              <Link href="/admin" className="btn-secondary text-center">
                Admin Panel
              </Link>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}