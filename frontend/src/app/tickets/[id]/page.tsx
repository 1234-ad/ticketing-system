'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { ticketService } from '@/services/ticketService'
import { useAuth } from '@/contexts/AuthContext'
import { Ticket, Comment, TicketStatus, Priority, Role } from '@/types'
import { toast } from 'react-toastify'

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmittingComment, setIsSubmittingComment] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  const ticketId = parseInt(params.id as string)

  useEffect(() => {
    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const fetchTicketDetails = async () => {
    try {
      setIsLoading(true)
      const [ticketData, commentsData] = await Promise.all([
        ticketService.getTicketById(ticketId),
        ticketService.getTicketComments(ticketId)
      ])
      setTicket(ticketData)
      setComments(commentsData)
    } catch (error: any) {
      toast.error('Failed to fetch ticket details')
      console.error('Error fetching ticket:', error)
      router.push('/tickets')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmittingComment(true)
    try {
      const comment = await ticketService.addComment(ticketId, { content: newComment })
      setComments(prev => [...prev, comment])
      setNewComment('')
      toast.success('Comment added successfully')
    } catch (error: any) {
      toast.error('Failed to add comment')
    } finally {
      setIsSubmittingComment(false)
    }
  }

  const handleStatusUpdate = async (newStatus: TicketStatus) => {
    if (!ticket) return

    setIsUpdatingStatus(true)
    try {
      const updatedTicket = await ticketService.updateTicketStatus(ticketId, newStatus)
      setTicket(updatedTicket)
      toast.success('Ticket status updated successfully')
    } catch (error: any) {
      toast.error('Failed to update ticket status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const canUpdateStatus = () => {
    if (!user || !ticket) return false
    return user.role === Role.ADMIN || 
           user.role === Role.SUPPORT_AGENT || 
           (user.role === Role.USER && ticket.createdBy.id === user.id)
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

  const getNextStatuses = (currentStatus: TicketStatus): TicketStatus[] => {
    switch (currentStatus) {
      case TicketStatus.OPEN:
        return [TicketStatus.IN_PROGRESS, TicketStatus.RESOLVED, TicketStatus.CLOSED]
      case TicketStatus.IN_PROGRESS:
        return [TicketStatus.RESOLVED, TicketStatus.CLOSED]
      case TicketStatus.RESOLVED:
        return [TicketStatus.CLOSED, TicketStatus.IN_PROGRESS]
      case TicketStatus.CLOSED:
        return [TicketStatus.IN_PROGRESS]
      default:
        return []
    }
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

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ticket not found</h2>
          <button onClick={() => router.back()} className="btn-primary">
            Go Back
          </button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id}</h1>
              <span className={`text-sm ${getStatusBadge(ticket.status)}`}>
                {ticket.status.replace('_', ' ')}
              </span>
              <span className={`text-sm ${getPriorityBadge(ticket.priority)}`}>
                {ticket.priority}
              </span>
            </div>
            <p className="text-gray-600">Created by {ticket.createdBy.firstName} {ticket.createdBy.lastName}</p>
          </div>
          <button onClick={() => router.back()} className="btn-secondary">
            ← Back
          </button>
        </div>

        {/* Ticket Details */}
        <div className="card">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{ticket.subject}</h2>
              <div className="prose max-w-none">
                <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="text-sm font-medium text-gray-500">Created</span>
                <p className="text-sm text-gray-900">{new Date(ticket.createdAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <p className="text-sm text-gray-900">{new Date(ticket.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Assigned To</span>
                <p className="text-sm text-gray-900">
                  {ticket.assignedTo 
                    ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}`
                    : 'Unassigned'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Update */}
        {canUpdateStatus() && (
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Status</h3>
            <div className="flex flex-wrap gap-2">
              {getNextStatuses(ticket.status).map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  disabled={isUpdatingStatus}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Mark as {status.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Comments Section */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Comments ({comments.length})
          </h3>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-6">
            <div className="space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                rows={3}
                className="input-field resize-none"
                required
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingComment || !newComment.trim()}
                  className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmittingComment ? 'Adding...' : 'Add Comment'}
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-4">
            {comments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No comments yet</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {comment.createdBy.firstName.charAt(0)}{comment.createdBy.lastName.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {comment.createdBy.firstName} {comment.createdBy.lastName}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="ml-10">
                    <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}