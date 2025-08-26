'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { ticketService } from '@/services/ticketService'
import { useAuth } from '@/contexts/AuthContext'
import { Ticket, TicketStatus, Priority, TicketFilters, Role } from '@/types'
import { toast } from 'react-toastify'

export default function AllTicketsPage() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState<TicketFilters>({
    page: 0,
    size: 10,
    sort: 'createdAt',
    direction: 'desc'
  })
  const [totalPages, setTotalPages] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Check if user has permission to view all tickets
    if (user && user.role !== Role.SUPPORT_AGENT && user.role !== Role.ADMIN) {
      toast.error('Access denied')
      return
    }
    fetchTickets()
  }, [filters, user])

  const fetchTickets = async () => {
    try {
      setIsLoading(true)
      const response = await ticketService.getAllTickets(filters)
      setTickets(response.content)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast.error('Failed to fetch tickets')
      console.error('Error fetching tickets:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        setIsLoading(true)
        const response = await ticketService.searchTickets(searchQuery, filters)
        setTickets(response.content)
        setTotalPages(response.totalPages)
      } catch (error: any) {
        toast.error('Search failed')
      } finally {
        setIsLoading(false)
      }
    } else {
      fetchTickets()
    }
  }

  const handleFilterChange = (key: keyof TicketFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 0 // Reset to first page when filters change
    }))
  }

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }))
  }

  const handleQuickStatusUpdate = async (ticketId: number, newStatus: TicketStatus) => {
    try {
      await ticketService.updateTicketStatus(ticketId, newStatus)
      toast.success('Status updated successfully')
      fetchTickets() // Refresh the list
    } catch (error: any) {
      toast.error('Failed to update status')
    }
  }

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

  // Redirect if user doesn't have permission
  if (user && user.role !== Role.SUPPORT_AGENT && user.role !== Role.ADMIN) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to view all tickets.</p>
          <Link href="/tickets" className="btn-primary">
            View My Tickets
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Tickets</h1>
            <p className="text-gray-600">Manage all support tickets in the system</p>
          </div>
          <Link href="/tickets/create" className="btn-primary">
            Create New Ticket
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="md:col-span-2">
              <div className="flex">
                <input
                  type="text"
                  placeholder="Search tickets..."
                  className="input-field rounded-r-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button
                  onClick={handleSearch}
                  className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
            
            <div>
              <select
                className="input-field"
                value={filters.status || ''}
                onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
              >
                <option value="">All Status</option>
                <option value={TicketStatus.OPEN}>Open</option>
                <option value={TicketStatus.IN_PROGRESS}>In Progress</option>
                <option value={TicketStatus.RESOLVED}>Resolved</option>
                <option value={TicketStatus.CLOSED}>Closed</option>
              </select>
            </div>
            
            <div>
              <select
                className="input-field"
                value={filters.priority || ''}
                onChange={(e) => handleFilterChange('priority', e.target.value || undefined)}
              >
                <option value="">All Priority</option>
                <option value={Priority.LOW}>Low</option>
                <option value={Priority.MEDIUM}>Medium</option>
                <option value={Priority.HIGH}>High</option>
                <option value={Priority.URGENT}>Urgent</option>
              </select>
            </div>

            <div>
              <select
                className="input-field"
                value={filters.sort || 'createdAt'}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="createdAt">Sort by Created</option>
                <option value="updatedAt">Sort by Updated</option>
                <option value="priority">Sort by Priority</option>
                <option value="status">Sort by Status</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tickets Table */}
        <div className="card">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-6xl mb-4">🎫</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No tickets found</h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try adjusting your search or filters' : 'No tickets have been created yet'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ticket
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tickets.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">#{ticket.id}</span>
                          </div>
                          <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                            {ticket.subject}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {ticket.description}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs ${getStatusBadge(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-xs ${getPriorityBadge(ticket.priority)}`}>
                          {ticket.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.createdBy.firstName} {ticket.createdBy.lastName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {ticket.assignedTo 
                          ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                          : 'Unassigned'
                        }
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link 
                          href={`/tickets/${ticket.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </Link>
                        {ticket.status === TicketStatus.OPEN && (
                          <button
                            onClick={() => handleQuickStatusUpdate(ticket.id, TicketStatus.IN_PROGRESS)}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Start
                          </button>
                        )}
                        {ticket.status === TicketStatus.IN_PROGRESS && (
                          <button
                            onClick={() => handleQuickStatusUpdate(ticket.id, TicketStatus.RESOLVED)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Page {(filters.page || 0) + 1} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handlePageChange((filters.page || 0) - 1)}
                  disabled={(filters.page || 0) === 0}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange((filters.page || 0) + 1)}
                  disabled={(filters.page || 0) >= totalPages - 1}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}