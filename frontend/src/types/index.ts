export interface User {
  id: number
  username: string
  email: string
  firstName: string
  lastName: string
  role: Role
  createdAt: string
  updatedAt: string
}

export interface Ticket {
  id: number
  subject: string
  description: string
  status: TicketStatus
  priority: Priority
  createdBy: User
  assignedTo?: User
  createdAt: string
  updatedAt: string
  comments: Comment[]
  attachments: Attachment[]
}

export interface Comment {
  id: number
  content: string
  createdBy: User
  createdAt: string
  ticketId: number
}

export interface Attachment {
  id: number
  fileName: string
  fileSize: number
  contentType: string
  uploadedBy: User
  uploadedAt: string
  ticketId: number
}

export enum Role {
  USER = 'USER',
  SUPPORT_AGENT = 'SUPPORT_AGENT',
  ADMIN = 'ADMIN'
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
}

export interface TicketRequest {
  subject: string
  description: string
  priority: Priority
}

export interface CommentRequest {
  content: string
}

export interface AuthResponse {
  token: string
  type: string
  user: User
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
}

export interface TicketFilters {
  status?: TicketStatus
  priority?: Priority
  assignedTo?: number
  search?: string
  page?: number
  size?: number
  sort?: string
  direction?: 'asc' | 'desc'
}