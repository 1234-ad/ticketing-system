import { apiService } from './api'
import { 
  Ticket, 
  TicketRequest, 
  CommentRequest, 
  Comment, 
  PaginatedResponse, 
  TicketFilters,
  TicketStatus 
} from '@/types'

class TicketService {
  async createTicket(ticketData: TicketRequest): Promise<Ticket> {
    return await apiService.post<Ticket>('/tickets', ticketData)
  }

  async getMyTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    return await apiService.get<PaginatedResponse<Ticket>>('/tickets/my', filters)
  }

  async getAllTickets(filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    return await apiService.get<PaginatedResponse<Ticket>>('/tickets', filters)
  }

  async getTicketById(id: number): Promise<Ticket> {
    return await apiService.get<Ticket>(`/tickets/${id}`)
  }

  async updateTicketStatus(id: number, status: TicketStatus): Promise<Ticket> {
    return await apiService.patch<Ticket>(`/tickets/${id}/status`, { status })
  }

  async assignTicket(id: number, assigneeId: number): Promise<Ticket> {
    return await apiService.patch<Ticket>(`/tickets/${id}/assign`, { assigneeId })
  }

  async addComment(ticketId: number, commentData: CommentRequest): Promise<Comment> {
    return await apiService.post<Comment>(`/tickets/${ticketId}/comments`, commentData)
  }

  async getTicketComments(ticketId: number): Promise<Comment[]> {
    return await apiService.get<Comment[]>(`/tickets/${ticketId}/comments`)
  }

  async uploadAttachment(ticketId: number, file: File): Promise<any> {
    const formData = new FormData()
    formData.append('file', file)
    return await apiService.postFormData(`/tickets/${ticketId}/attachments`, formData)
  }

  async downloadAttachment(ticketId: number, attachmentId: number): Promise<Blob> {
    const response = await apiService.getApi().get(
      `/tickets/${ticketId}/attachments/${attachmentId}/download`,
      { responseType: 'blob' }
    )
    return response.data
  }

  async searchTickets(query: string, filters?: TicketFilters): Promise<PaginatedResponse<Ticket>> {
    return await apiService.get<PaginatedResponse<Ticket>>('/tickets/search', {
      q: query,
      ...filters
    })
  }
}

export const ticketService = new TicketService()