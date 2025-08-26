import { apiService } from './api'
import { User, Role, PaginatedResponse } from '@/types'

export interface CreateUserRequest {
  username: string
  email: string
  password: string
  firstName: string
  lastName: string
  role: Role
}

export interface UpdateUserRequest {
  username?: string
  email?: string
  firstName?: string
  lastName?: string
  role?: Role
}

class AdminService {
  async getAllUsers(page = 0, size = 10): Promise<PaginatedResponse<User>> {
    return await apiService.get<PaginatedResponse<User>>('/admin/users', { page, size })
  }

  async createUser(userData: CreateUserRequest): Promise<User> {
    return await apiService.post<User>('/admin/users', userData)
  }

  async updateUser(userId: number, userData: UpdateUserRequest): Promise<User> {
    return await apiService.put<User>(`/admin/users/${userId}`, userData)
  }

  async deleteUser(userId: number): Promise<void> {
    return await apiService.delete<void>(`/admin/users/${userId}`)
  }

  async updateUserRole(userId: number, role: Role): Promise<User> {
    return await apiService.patch<User>(`/admin/users/${userId}/role`, { role })
  }

  async searchUsers(query: string, page = 0, size = 10): Promise<PaginatedResponse<User>> {
    return await apiService.get<PaginatedResponse<User>>('/admin/users/search', {
      q: query,
      page,
      size
    })
  }

  async getSystemStats(): Promise<any> {
    return await apiService.get<any>('/admin/stats')
  }
}

export const adminService = new AdminService()