import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  username: string;
  username_approved: "0" | "1" | "2";
  fcm_token: string | null;
  social_facebook_id: string | null;
  social_google_id: string | null;
  social_apple_id: string | null;
  login_enabled: string;
  location_latitude: string;
  location_longitude: string;
  last_onlineAt: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  current_page: number;
  per_page: number;
  total: number;
  total_pages: number;
  has_next_page: boolean;
  has_prev_page: boolean;
}

interface ApiResponse {
  status: string;
  data: {
    users: User[];
    pagination: PaginationData;
  };
}

interface StatusModalProps {
  user: User;
  onClose: () => void;
  onConfirm: () => void;
}

interface UsernameModalProps {
  user: User;
  onClose: () => void;
  onApprove: () => Promise<void>;
  onDecline: () => Promise<void>;
  isSubmitting: boolean;
}

function StatusModal({ user, onClose, onConfirm }: StatusModalProps) {
  const newStatus = user.login_enabled === "1" ? "disable" : "enable";
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Status Change</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to {newStatus} login for {user.first_name} {user.last_name}?
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function UsernameModal({ user, onClose, onApprove, onDecline, isSubmitting }: UsernameModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Username Review</h3>
        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            User: {user.first_name} {user.last_name}
          </p>
          <p className="text-gray-800 font-medium">
            Requested Username: <span className="text-indigo-600">{user.username}</span>
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onDecline}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Decline'}
          </button>
          <button
            onClick={onApprove}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Processing...' : 'Approve'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function Users() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUsernameReview, setSelectedUsernameReview] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/users`, {
        params: {
          page,
          per_page: 15
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      setUsers(response.data.data.users);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch users. Please try again later.');
      console.error('Error fetching users:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(currentPage);
  }, [currentPage]);

  const toggleUserStatus = (user: User) => {
    setSelectedUser(user);
  };

  const handleStatusConfirm = () => {
    if (selectedUser) {
      setUsers(users.map(user => 
        user.id === selectedUser.id
          ? { ...user, login_enabled: user.login_enabled === "1" ? "0" : "1" }
          : user
      ));
      setSelectedUser(null);
    }
  };

  const handleUsernameApproval = async (user: User) => {
    setSelectedUsernameReview(user);
  };

  const handleApproveUsername = async () => {
    if (!selectedUsernameReview) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`${ADMIN_BASE_URL}/users/${selectedUsernameReview.id}/approve-username`, null, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUsernameReview.id
          ? { ...user, username_approved: "1" }
          : user
      ));
      setSelectedUsernameReview(null);
    } catch (err) {
      console.error('Error approving username:', err);
      setError('Failed to approve username. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeclineUsername = async () => {
    if (!selectedUsernameReview) return;
    
    try {
      setIsSubmitting(true);
      await axios.put(`${ADMIN_BASE_URL}/users/${selectedUsernameReview.id}/decline-username`, null, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Update local state
      setUsers(users.map(user => 
        user.id === selectedUsernameReview.id
          ? { ...user, username_approved: "2" }
          : user
      ));
      setSelectedUsernameReview(null);
    } catch (err) {
      console.error('Error declining username:', err);
      setError('Failed to decline username. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredUsers = users.filter(user => 
    `${user.first_name} ${user.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username && user.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (isLoading && !users.length) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Online</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredUsers.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {user.first_name} {user.last_name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{user.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {user.username && (
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-900">{user.username}</span>
                      {user.username_approved === "0" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                          Pending Review
                        </span>
                      )}
                      {user.username_approved === "1" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          Approved
                        </span>
                      )}
                      {user.username_approved === "2" && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Declined
                        </span>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.login_enabled === "1"
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {user.login_enabled === "1" ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.last_onlineAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    {user.username && user.username_approved === "0" && (
                      <button
                        onClick={() => handleUsernameApproval(user)}
                        className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-md hover:bg-indigo-200"
                      >
                        Review Username
                      </button>
                    )}
                    <button
                      onClick={() => toggleUserStatus(user)}
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        user.login_enabled === "1"
                          ? 'bg-red-100 text-red-600 hover:bg-red-200'
                          : 'bg-green-100 text-green-600 hover:bg-green-200'
                      }`}
                    >
                      {user.login_enabled === "1" ? (
                        <X className="w-5 h-5" />
                      ) : (
                        <Check className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {pagination && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                disabled={!pagination.has_prev_page}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                disabled={!pagination.has_next_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(pagination.current_page - 1) * pagination.per_page + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                  </span>{' '}
                  of <span className="font-medium">{pagination.total}</span> results
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(page => Math.max(page - 1, 1))}
                    disabled={!pagination.has_prev_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        page === pagination.current_page
                          ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                    disabled={!pagination.has_next_page}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedUser && (
        <StatusModal
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onConfirm={handleStatusConfirm}
        />
      )}

      {selectedUsernameReview && (
        <UsernameModal
          user={selectedUsernameReview}
          onClose={() => setSelectedUsernameReview(null)}
          onApprove={handleApproveUsername}
          onDecline={handleDeclineUsername}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}