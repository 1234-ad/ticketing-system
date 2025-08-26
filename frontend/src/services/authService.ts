import { apiService } from './api'
import { AuthResponse, LoginRequest, RegisterRequest, User } from '@/types'

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const loginData: LoginRequest = { email, password }
    return await apiService.post<AuthResponse>('/auth/signin', loginData)
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return await apiService.post<AuthResponse>('/auth/signup', userData)
  }

  async getCurrentUser(): Promise<User> {
    return await apiService.get<User>('/auth/me')
  }

  async logout(): Promise<void> {
    return await apiService.post<void>('/auth/logout')
  }
}

export const authService = new AuthService()