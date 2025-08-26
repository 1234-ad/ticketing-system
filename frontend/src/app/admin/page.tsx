'use client'

import { useEffect, useState } from 'react'
import DashboardLayout from '@/components/Layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { adminService, CreateUserRequest, UpdateUserRequest } from '@/services/adminService'
import { User, Role } from '@/types'
import { toast } from 'react-toastify'
import Link from 'next/link'

export default function AdminPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [totalPages, setTotalPages] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)

  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: Role.USER
  })

  const [editForm, setEditForm] = useState<UpdateUserRequest>({})

  useEffect(() => {
    if (user && user.role !== Role.ADMIN) {
      toast.error('Access denied')
      return
    }
    fetchUsers()
  }, [user, currentPage])

  const fetchUsers = async () => {
    try {
      setIsLoading(true)
      const response = searchQuery 
        ? await adminService.searchUsers(searchQuery, currentPage, 10)
        : await adminService.getAllUsers(currentPage, 10)
      setUsers(response.content)
      setTotalPages(response.totalPages)
    } catch (error: any) {
      toast.error('Failed to fetch users')
      console.error('Error fetching users:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(0)
    fetchUsers()
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await adminService.createUser(createForm)
      toast.success('User created successfully')
      setShowCreateModal(false)
      setCreateForm({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: Role.USER
      })
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create user')
    }
  }

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingUser) return

    try {
      await adminService.updateUser(editingUser.id, editForm)
      toast.success('User updated successfully')
      setEditingUser(null)
      setEditForm({})
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update user')
    }
  }

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Are you sure you want to delete this user?')) return

    try {
      await adminService.deleteUser(userId)
      toast.success('User deleted successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete user')
    }
  }

  const handleRoleChange = async (userId: number, newRole: Role) => {
    try {
      await adminService.updateUserRole(userId, newRole)
      toast.success('User role updated successfully')
      fetchUsers()
    } catch (error: any) {
      toast.error('Failed to update user role')
    }
  }

  const getRoleBadge = (role: Role) => {
    const roleClasses = {
      [Role.USER]: 'bg-gray-100 text-gray-800',
      [Role.SUPPORT_AGENT]: 'bg-blue-100 text-blue-800',
      [Role.ADMIN]: 'bg-red-100 text-red-800',
    }
    return `px-2 py-1 rounded-full text-xs font-medium ${roleClasses[role]}`
  }

  // Redirect if user doesn't have permission
  if (user && user.role !== Role.ADMIN) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600 mb-4">You don't have permission to access the admin panel.</p>
          <Link href="/dashboard" className="btn-primary">
            Go to Dashboard
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
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
            <p className="text-gray-600">Manage users and system settings</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            Create New User
          </button>
        </div>

        {/* Search */}
        <div className="card">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search users..."
                className="input-field"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <button onClick={handleSearch} className="btn-primary">
              Search
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="card">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search query</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
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
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
                            {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {u.firstName} {u.lastName}
                            </div>
                            <div className="text-sm text-gray-500">@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {u.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                          className="text-sm border-0 bg-transparent focus:ring-0"
                          disabled={u.id === user?.id} // Can't change own role
                        >
                          <option value={Role.USER}>User</option>
                          <option value={Role.SUPPORT_AGENT}>Support Agent</option>
                          <option value={Role.ADMIN}>Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(u)
                            setEditForm({
                              username: u.username,
                              email: u.email,
                              firstName: u.firstName,
                              lastName: u.lastName,
                              role: u.role
                            })
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        {u.id !== user?.id && (
                          <button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
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
                Page {currentPage + 1} of {totalPages}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(prev => prev - 1)}
                  disabled={currentPage === 0}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(prev => prev + 1)}
                  disabled={currentPage >= totalPages - 1}
                  className="btn-secondary text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create User Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input-field"
                    value={createForm.firstName}
                    onChange={(e) => setCreateForm({...createForm, firstName: e.target.value})}
                    required
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input-field"
                    value={createForm.lastName}
                    onChange={(e) => setCreateForm({...createForm, lastName: e.target.value})}
                    required
                  />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className="input-field"
                  value={createForm.username}
                  onChange={(e) => setCreateForm({...createForm, username: e.target.value})}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input-field"
                  value={createForm.email}
                  onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="input-field"
                  value={createForm.password}
                  onChange={(e) => setCreateForm({...createForm, password: e.target.value})}
                  required
                />
                <select
                  className="input-field"
                  value={createForm.role}
                  onChange={(e) => setCreateForm({...createForm, role: e.target.value as Role})}
                >
                  <option value={Role.USER}>User</option>
                  <option value={Role.SUPPORT_AGENT}>Support Agent</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Create User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Edit User</h3>
              <form onSubmit={handleUpdateUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="First Name"
                    className="input-field"
                    value={editForm.firstName || ''}
                    onChange={(e) => setEditForm({...editForm, firstName: e.target.value})}
                  />
                  <input
                    type="text"
                    placeholder="Last Name"
                    className="input-field"
                    value={editForm.lastName || ''}
                    onChange={(e) => setEditForm({...editForm, lastName: e.target.value})}
                  />
                </div>
                <input
                  type="text"
                  placeholder="Username"
                  className="input-field"
                  value={editForm.username || ''}
                  onChange={(e) => setEditForm({...editForm, username: e.target.value})}
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="input-field"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                />
                <select
                  className="input-field"
                  value={editForm.role || editingUser.role}
                  onChange={(e) => setEditForm({...editForm, role: e.target.value as Role})}
                  disabled={editingUser.id === user?.id}
                >
                  <option value={Role.USER}>User</option>
                  <option value={Role.SUPPORT_AGENT}>Support Agent</option>
                  <option value={Role.ADMIN}>Admin</option>
                </select>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingUser(null)
                      setEditForm({})
                    }}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Update User
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}