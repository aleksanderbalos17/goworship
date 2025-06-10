import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, Pencil, Trash2, Plus } from 'lucide-react';
import axios from 'axios';
import { ADMIN_BASE_URL } from '../constants/api';

interface EventType {
  id: string;
  name: string;
  created_at: string;
  updated_at: string | null;
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
    event_types: EventType[];
    pagination: PaginationData;
  };
}

interface DeleteModalProps {
  eventType: EventType;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}

interface EditModalProps {
  eventType: EventType;
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  isSubmitting: boolean;
}

interface AddModalProps {
  onClose: () => void;
  onConfirm: (name: string) => Promise<void>;
  isSubmitting: boolean;
}

function DeleteModal({ eventType, onClose, onConfirm, isDeleting }: DeleteModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Event Type</h3>
        <p className="text-gray-600 mb-6">
          Are you sure you want to delete "{eventType.name}"? This action cannot be undone.
        </p>
        <div className="flex space-x-4">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm()}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ eventType, onClose, onConfirm, isSubmitting }: EditModalProps) {
  const [name, setName] = useState(eventType.name);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event type name is required');
      return;
    }
    try {
      await onConfirm(name);
      onClose();
    } catch (err: any) {
      console.error('Edit error:', err);
      setError(err.message || 'Failed to update event type');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Event Type</h3>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter event type name"
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AddModal({ onClose, onConfirm, isSubmitting }: AddModalProps) {
  // Pre-fill with sample data for testing
  const [name, setName] = useState('Sample Event Type Test');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Event type name is required');
      return;
    }
    try {
      console.log('Submitting event type:', name.trim());
      await onConfirm(name.trim());
      onClose();
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Failed to create event type');
    }
  };

  // Sample event type options for quick testing
  const sampleEventTypes = [
    'Sunday Service',
    'Prayer Meeting',
    'Bible Study',
    'Youth Group',
    'Worship Night',
    'Community Outreach',
    'Men\'s Fellowship',
    'Women\'s Ministry',
    'Children\'s Church',
    'Choir Practice'
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Event Type</h3>
        
        {/* Quick Sample Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Quick Select (for testing)
          </label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {sampleEventTypes.slice(0, 6).map((sampleType) => (
              <button
                key={sampleType}
                type="button"
                onClick={() => setName(sampleType)}
                className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {sampleType}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Event Type Name *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError('');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter event type name"
              required
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
          </div>

          {/* API Testing Info */}
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-1">API Testing Info:</p>
            <p className="text-xs text-blue-600">
              Endpoint: POST {ADMIN_BASE_URL}/event-types/create
            </p>
            <p className="text-xs text-blue-600">
              Payload: {JSON.stringify({ name: name.trim() })}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Event Type'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function EventTypes() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEventType, setSelectedEventType] = useState<EventType | null>(null);
  const [editingEventType, setEditingEventType] = useState<EventType | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [eventTypes, setEventTypes] = useState<EventType[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEventTypes = async (page: number) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await axios.get<ApiResponse>(`${ADMIN_BASE_URL}/event-types`, {
        params: {
          page,
          per_page: 10
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      setEventTypes(response.data.data.event_types);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError('Failed to fetch event types. Please try again later.');
      console.error('Error fetching event types:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddEventType = async (name: string) => {
    try {
      setIsSubmitting(true);
      setError(null);
      
      const requestData = { name };
      
      console.log('Making API request to:', `${ADMIN_BASE_URL}/event-types/create`);
      console.log('Request data:', requestData);
      
      const response = await axios.post(`${ADMIN_BASE_URL}/event-types/create`, requestData, {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      console.log('API Response:', response);

      // Check if the response indicates success
      if (response.data.status === 'success' || response.status === 200 || response.status === 201) {
        // Refresh the event types list to show the new event type
        await fetchEventTypes(currentPage);
        setShowAddModal(false);
      } else {
        throw new Error(response.data.message || 'Failed to create event type');
      }
    } catch (err: any) {
      console.error('Error adding event type:', err);
      console.error('Error response:', err.response);
      
      // Extract error message from response
      let errorMessage = 'Failed to create event type. Please try again.';
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditConfirm = async (name: string) => {
    if (editingEventType) {
      try {
        setIsSubmitting(true);
        await axios.put(
          `${ADMIN_BASE_URL}/event-types/${editingEventType.id}`,
          { name },
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            }
          }
        );
        await fetchEventTypes(currentPage);
        setEditingEventType(null);
      } catch (err) {
        console.error('Error updating event type:', err);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedEventType) {
      try {
        setIsDeleting(true);
        await axios.delete(`${ADMIN_BASE_URL}/event-types/${selectedEventType.id}`, {
          headers: {
            'Accept': 'application/json'
          }
        });
        await fetchEventTypes(currentPage);
        setSelectedEventType(null);
      } catch (err) {
        console.error('Error deleting event type:', err);
        setError('Failed to delete event type. Please try again later.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  useEffect(() => {
    fetchEventTypes(currentPage);
  }, [currentPage]);

  const handleEdit = (eventType: EventType) => {
    setEditingEventType(eventType);
  };

  const handleDelete = (eventType: EventType) => {
    setSelectedEventType(eventType);
  };

  const filteredEventTypes = eventTypes.filter(eventType => 
    eventType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !eventTypes.length) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Event Types</h1>
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
          <h1 className="text-2xl font-semibold text-gray-800">Event Types</h1>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              fetchEventTypes(currentPage);
            }}
            className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800">Event Types</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search event types..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-64"
            />
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <Plus className="w-5 h-5" />
            <span>Add Event Type</span>
          </button>
        </div>
      </div>

      {/* API Testing Info Panel */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">API Testing Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-blue-700">
          <div>
            <p><strong>Create Endpoint:</strong> POST {ADMIN_BASE_URL}/event-types/create</p>
            <p><strong>List Endpoint:</strong> GET {ADMIN_BASE_URL}/event-types</p>
          </div>
          <div>
            <p><strong>Sample Payload:</strong> {JSON.stringify({ name: "Sample Event Type" })}</p>
            <p><strong>Expected Response:</strong> {JSON.stringify({ status: "success" })}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredEventTypes.map((eventType) => (
              <tr key={eventType.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{eventType.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {eventType.created_at}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {eventType.updated_at || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(eventType)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(eventType)}
                      className="w-8 h-8 rounded-full flex items-center justify-center bg-red-100 text-red-600 hover:bg-red-200"
                    >
                      <Trash2 className="w-4 h-4" />
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
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(page => Math.min(page + 1, pagination.total_pages))}
                disabled={!pagination.has_next_page}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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

      {selectedEventType && (
        <DeleteModal
          eventType={selectedEventType}
          onClose={() => setSelectedEventType(null)}
          onConfirm={handleDeleteConfirm}
          isDeleting={isDeleting}
        />
      )}

      {editingEventType && (
        <EditModal
          eventType={editingEventType}
          onClose={() => setEditingEventType(null)}
          onConfirm={handleEditConfirm}
          isSubmitting={isSubmitting}
        />
      )}

      {showAddModal && (
        <AddModal
          onClose={() => setShowAddModal(false)}
          onConfirm={handleAddEventType}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}